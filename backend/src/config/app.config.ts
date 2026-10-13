export function loadAppConfig(): { port: number; frontendOrigin: string } {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
  }

  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
  let originUrl: URL;
  try {
    originUrl = new URL(frontendOrigin);
  } catch {
    throw new Error('FRONTEND_ORIGIN deve ser uma origem HTTP ou HTTPS válida.');
  }

  if (!['http:', 'https:'].includes(originUrl.protocol) || originUrl.origin !== frontendOrigin) {
    throw new Error('FRONTEND_ORIGIN deve conter apenas a origem, sem caminho ou barra final.');
  }

  return { port, frontendOrigin };
}
