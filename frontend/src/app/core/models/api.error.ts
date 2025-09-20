export class ApiError extends Error {
  constructor(
    public readonly status: number | undefined,
    public readonly errors: string[] = [],
    message?: string
  ) {
    super(message ?? (errors?.join('; ') || 'Request failed'));
  }
}
