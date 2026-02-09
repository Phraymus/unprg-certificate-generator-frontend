import { TbFormatoCertificadoFirmaId } from './TbFormatoCertificadoFirmaId.interface';
import { TbFirma } from './TbFirma.interface';
import { TbFormatoCertificado } from "~interfaces/TbFormatoCertificado.interface";

export interface TbFormatoCertificadoFirma {
  id?: TbFormatoCertificadoFirmaId;
  tbFirma?: TbFirma;
  tbFormatoCertificado?: TbFormatoCertificado;

  // ====== NUEVOS CAMPOS DE CONFIGURACIÓN DE FIRMA ======
  orden?: number;                    // Orden de firma (1, 2, 3...)
  firmarDigital?: string | '0' | '1'; // '1' = Habilitar firma digital PKCS#7
  firmaVisible?: string | '0' | '1';  // '1' = Mostrar imagen de firma

  // Posicionamiento
  pagina?: number;                   // Página donde colocar la firma (1-based)
  posX?: number;                     // Posición X en puntos
  posY?: number;                     // Posición Y en puntos
  ancho?: number;                    // Ancho de imagen en puntos
  alto?: number;                     // Alto de imagen en puntos

  // Layout automático
  layoutMode?: 'ABS' | 'STACK' | 'COLUMN'; // Modo de posicionamiento
  gapX?: number;                     // Espaciado horizontal (para COLUMN)
  gapY?: number;                     // Espaciado vertical (para STACK)

  // Metadatos de firma digital
  reason?: string;                   // Razón de la firma (ej: "Certificado académico oficial")
  location?: string;                 // Ubicación (ej: "UNPRG - Chiclayo")
}
