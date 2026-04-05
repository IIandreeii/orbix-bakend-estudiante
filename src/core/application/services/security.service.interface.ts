export interface IHashService {
  hash(payload: string): Promise<string>;
  compare(payload: string, hashed: string): Promise<boolean>;
}

export interface ITokenService {
  generate(
    payload: Record<string, unknown>,
    expiresIn?: string,
    secret?: string,
  ): Promise<string>;
  verify<TPayload extends Record<string, unknown>>(
    token: string,
    options?: { secret?: string; ignoreExpiration?: boolean },
  ): Promise<TPayload>;
}
