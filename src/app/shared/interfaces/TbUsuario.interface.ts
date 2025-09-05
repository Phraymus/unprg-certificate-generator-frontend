import { TbPersona } from './TbPersona.interface';

export interface TbUsuario {
  id?: number;
  usuario?: string;
  clave?: string;
  idtbPersona?: TbPersona;
}