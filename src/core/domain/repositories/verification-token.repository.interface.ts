export const I_VERIFICATION_TOKEN_REPOSITORY = 'IVerificationTokenRepository';
export interface IVerificationTokenRepository {
  upsert(data: {
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;

  findAllByEmail(
    email: string,
  ): Promise<Array<{ token: string; expiresAt: Date }>>;

  deleteAllByEmail(email: string): Promise<void>;
}
