export const WHATSAPP_ERROR_MESSAGES: Record<number, string> = {
  0: 'Error de autenticación: El token de acceso ha caducado o no es válido.',
  3: 'Problema de permisos: Tu app no tiene los permisos necesarios para esta acción.',
  10: 'Permiso denegado: No tienes acceso a este recurso.',
  100: 'Parámetro no válido: Uno o más parámetros en la solicitud son incorrectos.',
  190: 'Token caducado: Debes obtener un nuevo token de acceso en el panel de Meta.',
  368: 'Cuenta bloqueada temporalmente: Se han infringido las políticas de WhatsApp.',
  130429:
    'Límite de frecuencia alcanzado: Has enviado demasiados mensajes en poco tiempo.',
  131000: 'Error desconocido: Meta no pudo procesar el mensaje.',
  131008: 'Falta un parámetro obligatorio en la solicitud.',
  131009: 'Valor de parámetro no válido.',
  131021: 'No puedes enviarte mensajes a ti mismo.',
  131026:
    'Mensaje no entregado: El destinatario no tiene WhatsApp o usa una versión incompatible.',
  131031:
    'Cuenta bloqueada: Tu cuenta de WhatsApp Business ha sido restringida.',
  131042:
    'Problema de pago: Verifica tu método de pago en el Administrador de WhatsApp.',
  131047:
    'Ventana de 24 horas cerrada: Debes usar una plantilla porque el cliente no ha respondido en las últimas 24h.',
  131048:
    'Límite de spam: Tu número ha enviado demasiados mensajes marcados como spam.',
  131049:
    'Mensaje no entregado por Meta para proteger la integridad del ecosistema.',
  131051: 'Tipo de mensaje no compatible.',
  131052:
    'Error al descargar archivo: Meta no pudo bajar el archivo enviado por el usuario.',
  131053:
    'Error al subir archivo: El archivo es demasiado grande (máx 16MB) o el formato no es válido.',
  131056:
    'Límite de mensajes entre emisor y receptor alcanzado: Espera un momento.',
  132000:
    'El número de variables no coincide con la definición de la plantilla.',
  132001: 'La plantilla no existe o no ha sido aprobada en este idioma.',
  132005: 'El texto de la plantilla es demasiado largo para este idioma.',
  132012: 'Formato de parámetros de plantilla incorrecto.',
  132015: 'Plantilla en pausa por baja calidad.',
  132016: 'Plantilla desactivada permanentemente por baja calidad.',
  2593107: 'Límite de sincronización excedido.',
};

export function translateMetaError(
  code: number,
  originalMessage: string,
): string {
  return WHATSAPP_ERROR_MESSAGES[code] || originalMessage;
}
