export const I_AUTH_REPOSITORY = 'IAuthRepository';
export interface IAuthRepository {
  findCredentialByUserId(
    userId: string,
    strategy: string,
  ): Promise<{ credential: string | null } | null>;

  updateCredentialByEmail(
    strategy: string,
    email: string,
    credential: string,
  ): Promise<void>;

  createAuth(data: {
    userId: string;
    strategy: string;
    identifier: string;
    credential: string;
  }): Promise<void>;
}
