export const I_PASSWORD_RESET_TOKEN_REPOSITORY =
  'IPasswordResetTokenRepository';
export interface IPasswordResetTokenRepository {
  upsert(data: {
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;

  findFirstByEmail(email: string): Promise<{
    email: string;
    token: string;
    expiresAt: Date;
  } | null>;

  findAllByEmail(
    email: string,
  ): Promise<Array<{ email: string; token: string; expiresAt: Date }>>;

  deleteByEmail(email: string): Promise<void>;
}
