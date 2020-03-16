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
  if (!config.json) {
    req.json = jsonCacher
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
        req.bytes = bytes
        req.maxBytes = maxBytes

        const buffer = Buffer.concat(chunks)
        if (config.json) {
          jsonParser(buffer).then(resolve, reject)
        } else {
          resolve(buffer)
        }
      } else {
        resolve(null)
      }
    })
  })
}

module.exports = readBody

// Parse the body as JSON, with caching.
async function jsonCacher(resolve) {
  const buffer = await this.body
  const json = buffer ? await jsonParser(buffer) : {}
  this.json = async () => json
  return resolve ? resolve(json) : json
}

// Parse the body as JSON, without caching.
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
