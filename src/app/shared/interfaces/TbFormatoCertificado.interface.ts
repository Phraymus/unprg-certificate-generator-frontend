import { TbUsuario } from './TbUsuario.interface';

export interface TbFormatoCertificado {
  id?: number;
  codigo?: string;
  nombreFormato?: string;
  rutaFormato?: string;
  tbUsuario?: TbUsuario;
  idtbUsuario?: number;
  // Propiedades adicionales para el frontend
  archivo?: File;
  fechaCreacion?: string;
  tamanoArchivo?: number;
}
