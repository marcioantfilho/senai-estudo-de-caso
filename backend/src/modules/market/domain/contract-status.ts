export const CONTRACT_STATUSES = ['ATIVO', 'ENCERRADO', 'RESCINDIDO'] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
