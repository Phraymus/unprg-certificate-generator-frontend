import { TbEventoFormatoCertificadoFirmaId } from './TbEventoFormatoCertificadoFirmaId.interface';
import { TbFirma } from './TbFirma.interface';
import {TbFormatoCertificado} from "~interfaces/TbFormatoCertificado.interface";

export interface TbFormatoCertificadoFirma {
  id?: TbEventoFormatoCertificadoFirmaId;
  tbFirma?: TbFirma;
  tbFormatoCertificado?: TbFormatoCertificado;
}
