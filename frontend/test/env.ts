import { TestEnvironment } from 'jest-environment-jsdom'

/**
 * @issue https://github.com/wheresrhys/fetch-mock/issues/884
 */
export default class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup()

    this.global.Request = Request
    this.global.Response = Response
    this.global.ReadableStream = ReadableStream
  }
}
