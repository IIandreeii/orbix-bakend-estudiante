export interface IStorageService {
  uploadFile(buffer: Buffer, path: string, mimeType: string): Promise<string>;
  downloadWhatsAppMedia(url: string, accessToken: string): Promise<Buffer>;
}
