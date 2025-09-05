import { TbParticipante } from './TbParticipante.interface';

export interface TbCertificado {
  id?: number;
  codigoQr?: string;
  urlCertificado?: string;
  tbParticipante?: TbParticipante;
}