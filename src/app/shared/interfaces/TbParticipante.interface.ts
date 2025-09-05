import { TbParticipanteId } from './TbParticipanteId.interface';
import { TbEvento } from './TbEvento.interface';
import { TbPersona } from './TbPersona.interface';

export interface TbParticipante {
  id?: TbParticipanteId;
  tbEvento?: TbEvento;
  tbPersona?: TbPersona;
  estado?: string;
  fechaInscripcion?: string;
  nota?: number; // BigDecimal se mapea a number en TypeScript
}
