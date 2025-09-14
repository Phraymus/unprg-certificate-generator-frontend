export enum EstadoParticipanteEnum {
  Activo = '1',
  Inactivo = '2',
  Pendiente = '3',
  Completado = '4'
}

export function stringAEnumParticipante(estado: string): EstadoParticipanteEnum | undefined {
  return EstadoParticipanteEnum[estado as keyof typeof EstadoParticipanteEnum]; // Accedemos al enum usando el string
}

export function valueAStringParticipante(value: string): string | undefined {
  const entry = Object.entries(EstadoParticipanteEnum).find(([key, val]) => val === value);
  return entry ? entry[0] : undefined;
}
