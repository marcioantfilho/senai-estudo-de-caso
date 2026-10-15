export function loadDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL é obrigatória: informe a conexão com o PostgreSQL.');
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL deve ser uma URL de conexão válida.');
  }

  if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL deve usar o protocolo postgresql://.');
  }

  return databaseUrl;
}
