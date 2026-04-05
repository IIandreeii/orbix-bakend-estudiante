export const I_REFRESH_TOKEN_REPOSITORY = 'IRefreshTokenRepository';
export interface IRefreshTokenRepository {
  create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void>;

  findByUserId(userId: string): Promise<
    Array<{
      token: string;
      userId: string;
      isRevoked: boolean;
      expiresAt: Date;
      user: { id: string; email: string; role: string };
    }>
  >;

  deleteByToken(token: string): Promise<void>;

  deleteAllByToken(token: string): Promise<void>;

  deleteAllByUserEmail(email: string): Promise<void>;

  revokeAndRotate(
    oldToken: string,
    newData: { token: string; userId: string; expiresAt: Date },
  ): Promise<void>;
}
