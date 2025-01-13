export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// create Express Error class
export class ApiError extends Error {
  public readonly status: (typeof HttpStatusCode)[keyof typeof HttpStatusCode]
  public readonly message: string

  constructor(code: keyof typeof HttpStatusCode, message: string) {
    super()
    this.status = HttpStatusCode[code]
    this.message = message
  }
}
