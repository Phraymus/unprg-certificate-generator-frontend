import { TbFormatoCertificadoFirmaId } from './TbFormatoCertificadoFirmaId.interface';
import { TbFirma } from './TbFirma.interface';
import {TbFormatoCertificado} from "~interfaces/TbFormatoCertificado.interface";

export interface TbFormatoCertificadoFirma {
  id?: TbFormatoCertificadoFirmaId;
  tbFirma?: TbFirma;
  tbFormatoCertificado?: TbFormatoCertificado;
}
