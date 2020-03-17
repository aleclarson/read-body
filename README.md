
# read-body v0.0.1

Buffer a readable stream into memory.

```js
import {readBody} from 'read-body'

// Read the stream into a buffer (limit of 1mb).
let buffer = await readBody(stream)

// Clear the cached buffer.
stream.body = null

// Read the same stream again, but with a limit of 100mb.
buffer = await readBody(stream, 1e8)

// Parse the stream as JSON.
const json = await stream.json()

// Do the two lines above in one fell swoop.
buffer = await readBody(stream, {json: true, maxBytes: 1e8})
```

When `readBody` is called, the stream has its `body` property
set to a promise that resolves with a buffer. By default,
the buffer is limited to 1mb max. If the limit is exceeded,
the promise is rejected, the buffer is destroyed, and the
stream is drained. The `body` property is used to prevent
reading the same stream more than once.

Instead of passing `json: true` via the options object,
try calling the `.json()` method which is available on
the stream once the promise is resolved.

For convenience, the `bytes` and `maxBytes` properties
are added to the stream once the promise is resolved.

### readJson(input, ?config)

Shortcut for `readBody(stream, {json: true})`.

```js
import {readJson} from 'read-body'

// Read the stream into a JSON value (limit of 1mb).
const json = await readJson(stream)
```
