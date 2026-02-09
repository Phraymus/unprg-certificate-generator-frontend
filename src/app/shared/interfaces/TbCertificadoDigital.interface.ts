export interface TbCertificadoDigital {
  id?: number;

  tbFirma?: any; // o TbFirma si lo tienes tipado

  keystoreTipo?: string; // P12/PFX (solo lectura en front)
  aliasCert?: string;

  subjectDn?: string;
  issuerDn?: string;
  serialNumber?: string;

  validoDesde?: string; // ISO string
  validoHasta?: string; // ISO string

  estado?: string; // "1"|"0"
  createdAt?: string;
  updatedAt?: string;
}
