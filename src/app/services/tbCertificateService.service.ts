import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '~environments/environment';
import { TbParticipante } from '~shared/interfaces';

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/certificates`;

@Injectable({
  providedIn: 'root'
})
export class TbCertificateService {

  constructor(private _http: HttpClient) { }

  /**
   * Genera un certificado Word para un participante específico
   * @param eventoId ID del evento
   * @param personaId ID de la persona
   * @returns Observable<Blob> - El archivo Word como blob
   */
  generateCertificate(eventoId: number, personaId: number): Observable<Blob> {
    return this._http.get(`${url}/generate/${eventoId}/${personaId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
    });
  }

  /**
   * Genera un certificado Word usando el objeto participante completo
   * @param participanteId Objeto con los IDs del participante
   * @returns Observable<Blob> - El archivo Word como blob
   */
  generateCertificateFromParticipantId(participanteId: { idtbEvento: number, idtbPersona: number }): Observable<Blob> {
    return this._http.post(`${url}/generate`, participanteId, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Genera un certificado PDF para un participante específico
   * @param eventoId ID del evento
   * @param personaId ID de la persona
   * @returns Observable<Blob> - El archivo PDF como blob
   */
  generateCertificatePdf(eventoId: number, personaId: number): Observable<Blob> {
    return this._http.get(`${url}/generate-pdf/${eventoId}/${personaId}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }

  /**
   * Genera un certificado PDF usando el objeto participante completo
   * @param participanteId Objeto con los IDs del participante
   * @returns Observable<Blob> - El archivo PDF como blob
   */
  generateCertificatePdfFromParticipantId(participanteId: { idtbEvento: number, idtbPersona: number }): Observable<Blob> {
    return this._http.post(`${url}/generate-pdf`, participanteId, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf',
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Obtiene una vista previa de los datos que se usarían en el certificado
   * @param eventoId ID del evento
   * @param personaId ID de la persona
   * @returns Observable con los datos del participante
   */
  previewCertificateData(eventoId: number, personaId: number): Observable<any> {
    return this._http.get(`${url}/preview/${eventoId}/${personaId}`);
  }

  /**
   * Descarga automáticamente el certificado Word generado
   * @param eventoId ID del evento
   * @param personaId ID de la persona
   * @param participante Datos del participante para crear nombre de archivo
   */
  downloadCertificate(eventoId: number, personaId: number, participante?: TbParticipante): Promise<void> {
    return new Promise((resolve, reject) => {
      this.generateCertificate(eventoId, personaId).subscribe({
        next: (blob: Blob) => {
          try {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Crear nombre de archivo con extensión .docx
            const fecha = new Date().toISOString().split('T')[0];
            const dni = participante?.tbPersona?.dni || personaId.toString();
            const codigoEvento = participante?.tbEvento?.codigo || eventoId.toString();

            link.download = `certificado_${codigoEvento}_${dni}_${fecha}.docx`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error al generar certificado:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Descarga automáticamente el certificado PDF generado
   * @param eventoId ID del evento
   * @param personaId ID de la persona
   * @param participante Datos del participante para crear nombre de archivo
   */
  downloadCertificatePdf(eventoId: number, personaId: number, participante?: TbParticipante): Promise<void> {
    return new Promise((resolve, reject) => {
      this.generateCertificatePdf(eventoId, personaId).subscribe({
        next: (blob: Blob) => {
          try {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Crear nombre de archivo con extensión .pdf
            const fecha = new Date().toISOString().split('T')[0];
            const dni = participante?.tbPersona?.dni || personaId.toString();
            const codigoEvento = participante?.tbEvento?.codigo || eventoId.toString();

            link.download = `certificado_${codigoEvento}_${dni}_${fecha}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error al generar certificado PDF:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Valida si un evento tiene formato de certificado asignado
   * @param eventoId ID del evento
   * @returns Promise<boolean>
   */
  async validateEventoHasFormato(eventoId: number): Promise<boolean> {
    try {
      const response = await this.previewCertificateData(eventoId, 1).toPromise();
      return response && response.data;
    } catch (error) {
      return false;
    }
  }


  /**
   * Genera el ZIP con todos los certificados del evento (PDF por defecto)
   * GET /api/certificates/zip/{eventoId}?format=pdf
   */
  generateCertificatesZip(eventoId: number, format: 'pdf' | 'word' = 'pdf'): Observable<Blob> {
    return this._http.get(`${url}/zip/${eventoId}?format=${format}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/zip'
      })
    });
  }

  /**
   * Descarga automáticamente el ZIP con todos los certificados del evento en PDF
   */
  downloadCertificatesZipPdf(eventoId: number, evento?: { codigo?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.generateCertificatesZip(eventoId, 'pdf').subscribe({
        next: (blob: Blob) => {
          try {
            const urlObj = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = urlObj;

            const fecha = new Date().toISOString().split('T')[0];
            const codigoEvento = evento?.codigo || eventoId.toString();
            link.download = `certificados_${codigoEvento}_${fecha}.zip`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlObj);

            resolve();
          } catch (e) {
            reject(e);
          }
        },
        error: (error) => {
          console.error('Error al generar ZIP:', error);
          reject(error);
        }
      });
    });
  }
}
