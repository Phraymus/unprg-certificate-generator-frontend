export interface TbEvento {
  id?: number;
  codigo?: string;
  nombre?: string;
  fechaInicio?: string; // LocalDate se mapea a string en formato ISO
  fechaFin?: string;    // LocalDate se mapea a string en formato ISO
}