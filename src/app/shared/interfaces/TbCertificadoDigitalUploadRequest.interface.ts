export interface TbCertificadoDigitalUploadRequest {
  idFirma: number;
  password: string;
  aliasCert?: string;
  estado?: string; // "1"|"0"
  file: File;
}
