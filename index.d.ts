export interface ReadBodyOptions {
  maxBytes?: number,
  json?: boolean,
}

declare const readBody: {
  /** Read the given stream and convert with `JSON.parse` */
  <T extends { [key: string]: any }>(
    input: ReadableStream,
    opts: { json: true } & ReadBodyOptions
  ): Promise<T>

  /** Read the given stream into a buffer of limited size */
  (input: ReadableStream, maxBytes?: number): Promise<Buffer>

  /** Read the given stream into a buffer */
  (input: ReadableStream, opts?: ReadBodyOptions): Promise<Buffer | string>
}

export default readBody
