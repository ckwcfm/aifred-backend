import { ErrorStatusCode } from '@/constants/http.constants'
// create Express Error class
export class ApiError extends Error {
  public readonly status: (typeof ErrorStatusCode)[keyof typeof ErrorStatusCode]
  public readonly message: string

  constructor(code: keyof typeof ErrorStatusCode, message: string) {
    super()
    this.status = ErrorStatusCode[code]
    this.message = message
  }
}
