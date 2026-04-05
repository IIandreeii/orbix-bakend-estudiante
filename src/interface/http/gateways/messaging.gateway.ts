import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import type { IRealtimeNotifier } from '../../../core/application/services/realtime-notifier.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'messaging',
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, IRealtimeNotifier
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, whatsAppAccountId: string) {
    if (!whatsAppAccountId) return;
    void client.join(whatsAppAccountId);
    this.logger.log(`Client ${client.id} joined room: ${whatsAppAccountId}`);
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(client: Socket, whatsAppAccountId: string) {
    if (!whatsAppAccountId) return;
    void client.leave(whatsAppAccountId);
    this.logger.log(`Client ${client.id} left room: ${whatsAppAccountId}`);
  }

  emitNewMessage(whatsAppAccountId: string, message: Record<string, unknown>) {
    void this.server.to(whatsAppAccountId).emit('new_message', message);
  }

  emitStatusUpdate(whatsAppAccountId: string, update: Record<string, unknown>) {
    void this.server
      .to(whatsAppAccountId)
      .emit('message_status_updated', update);
  }

  emitChatUpdate(whatsAppAccountId: string, chat: Record<string, unknown>) {
    void this.server.to(whatsAppAccountId).emit('chat_updated', chat);
  }
}
