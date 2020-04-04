import { Readable } from 'stream'

export interface ReadBodyOptions {
  maxBytes?: number,
  json?: boolean,
}

export const readJson: {
  /** Read the given stream and convert with `JSON.parse` */
  <T extends { [key:string]: any }>(
    input: Readable,
    opts?: Omit<ReadBodyOptions, 'json'>
  ): Promise<T>
}

export const readBody: {
  /** Read the given stream and convert with `JSON.parse` */
  <T extends { [key: string]: any }>(
    input: Readable,
    opts: { json: true } & ReadBodyOptions
  ): Promise<T>

  /** Read the given stream into a buffer of limited size */
  (input: Readable, maxBytes?: number): Promise<Buffer>

  /** Read the given stream into a buffer */
  (input: Readable, opts?: Omit<ReadBodyOptions, 'json'>): Promise<Buffer>

  /** Read the given stream */
  <T extends { [key: string]: any }>(
    input: Readable,
    opts?: ReadBodyOptions
  ): Promise<Buffer | T>
}
