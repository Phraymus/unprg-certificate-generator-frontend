import { TbUsuario } from './TbUsuario.interface';

export interface TbFormatoCertificado {
  id?: number;
  codigo?: string;
  nombreFormato?: string;
  rutaFormato?: string;
  idtbUsuario?: TbUsuario;
}