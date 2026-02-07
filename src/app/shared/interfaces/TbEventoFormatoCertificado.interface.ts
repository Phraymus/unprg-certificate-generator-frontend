import { TbEvento } from './TbEvento.interface';
import { TbFormatoCertificado } from './TbFormatoCertificado.interface';
import {TbTipoParticipante} from "~interfaces/TbTipoParticipante.interface";
import {TbEventoFormatoCertificadoId} from "~interfaces/TbEventoFormatoCertificadoId";

export interface TbEventoFormatoCertificado {
  id?: TbEventoFormatoCertificadoId;
  tbEvento?: TbEvento;
  tbFormatoCertificado?: TbFormatoCertificado;
  tbTipoParticipante?: TbTipoParticipante;
}
