import { TbEvento } from './TbEvento.interface';
import { TbFormatoCertificado } from './TbFormatoCertificado.interface';

export interface TbEventoFormatoCertificado {
  id?: number;
  tbEvento?: TbEvento;
  idtbFormatoCertificado?: TbFormatoCertificado;
  codigo?: string;
  descripcion?: string;
  fecha?: string; // LocalDate se mapea a string en formato ISO
}