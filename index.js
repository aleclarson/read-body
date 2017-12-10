// TODO: Destroy streams that upload below a certain bits per second.

async function readBody(req, config) {
  if (req.body) {
    return req.body
  }
  if (typeof config == 'number') {
    config = {maxBytes: config}
  } else if (!config) {
    config = {}
  }
  return req.body = new Promise((resolve, reject) => {
    const maxBytes = config.maxBytes || 1e6

    let bytes = 0
    let chunks = []
    req.on('data', function consume(chunk) {
      bytes += Buffer.byteLength(chunk)
      if (bytes > maxBytes) {
        chunks = null // Prevent resolve.
        req.removeListener('data', consume)
        reject(new Error(`Cannot exceed ${maxBytes / 1e6} megabytes`))
        req.resume() // Drain the stream without reading.
      } else {
        chunks.push(chunk)
      }
    })

    // The 'end' and 'error' events will never emit on the same stream.
    req.on('error', reject)
    req.on('end', () => {
      if (bytes && chunks) {
        const buffer = Buffer.concat(chunks)

        req.bytes = bytes
        req.maxBytes = maxBytes

        if (config.json) {
          jsonParser(buffer).then(resolve, reject)
        } else {
          req.json = getJSON
          resolve(buffer)
        }
      }
    })
  })
}

module.exports = readBody

async function getJSON(resolve, reject) {
  const buffer = await this.body
  const promise = jsonParser(buffer)
  if (arguments.length) {
    return promise.then(resolve, reject)
  } else {
    return promise
  }
}

async function jsonParser(buffer) {
  const json = buffer.toString()
  try {
    return JSON.parse(json)
  } catch(e) {
    const error = Error('Failed to parse request body:\n  ' + e.message)
    error.code = 'INVALID_JSON'
    throw error
  }
}
