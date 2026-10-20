import { ContractSnapshot, ContractTerms, describeContract } from '../../market/domain/loyalty';
import { PlayerDetails } from '../../players/domain/player';
import { comparePlayers } from '../../players/domain/player-sort';
import { ClubSummary } from './club';

export interface SquadContract extends ContractTerms {
  playerId: number;
}

export interface SquadMember extends PlayerDetails {
  contract: ContractSnapshot;
}

export interface ClubDetails extends ClubSummary {
  squad: SquadMember[];
}

/** RN11: elenco na ordem GOL, ZAG, LAT, MEI, ATA, depois nome e id. */
const squadOrder = comparePlayers(['position']);

/** RN11: cada jogador com o contrato como estaria se fosse vendido em `at`. */
export function buildSquad(players: readonly PlayerDetails[], contracts: readonly SquadContract[], at: Date): SquadMember[] {
  const contractByPlayer = new Map(contracts.map((contract) => [contract.playerId, contract]));
  return [...players].sort(squadOrder).map((player) => {
    const contract = contractByPlayer.get(player.id);
    if (contract === undefined) {
      throw new Error(`Jogador ${player.id} está no elenco sem contrato ativo.`);
    }
    return { ...player, contract: describeContract(contract, at) };
  });
}
