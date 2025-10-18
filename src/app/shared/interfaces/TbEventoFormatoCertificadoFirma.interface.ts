import { TbEventoFormatoCertificadoFirmaId } from './TbEventoFormatoCertificadoFirmaId.interface';
import { TbFirma } from './TbFirma.interface';
import { TbEventoFormatoCertificado } from './TbEventoFormatoCertificado.interface';

export interface TbEventoFormatoCertificadoFirma {
  id?: TbEventoFormatoCertificadoFirmaId;
  idtbFirma?: TbFirma;
  tbEventoFormatoCertificadoIdtbEvento?: TbEventoFormatoCertificado;
}