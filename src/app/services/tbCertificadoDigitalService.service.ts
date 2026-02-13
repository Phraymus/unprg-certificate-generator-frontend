import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "~environments/environment";
import {TbCertificadoDigitalUploadRequest} from "~interfaces/TbCertificadoDigitalUploadRequest.interface";

// Rutas corregidas según el backend
const urlCertificadoDigital = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbcertificadodigitales`;
const urlFirmas = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbfirmas`;

@Injectable({ providedIn: 'root' })
export class TbCertificadoDigitalService {
  constructor(private _http: HttpClient) {}

  findById(id: number): Observable<any> {
    return this._http.get(`${urlCertificadoDigital}/${id}`);
  }

  findActiveByFirmaId(idFirma: number): Observable<any> {
    return this._http.get(`${urlCertificadoDigital}/findFirstByFirmaIdAndEstado/${idFirma}/true`);
  }

  findAllByFirma(idFirma: number): Observable<any> {
    return this._http.get(`${urlCertificadoDigital}/findAllByFirmaId/${idFirma}`);
  }

  /**
   * Sube un certificado digital (.p12/.pfx) para una firma
   * Ruta correcta: POST /api/tbfirmas/{idFirma}/certificado-digital
   */
  upload(req: TbCertificadoDigitalUploadRequest): Observable<any> {
    const fd = new FormData();
    fd.append('file', req.file);
    fd.append('password', req.password);

    if (req.aliasCert) {
      fd.append('alias', req.aliasCert); // El backend espera 'alias', no 'aliasCert'
    }

    // Nota: El endpoint del backend no usa 'estado' en el upload
    // El certificado se guarda como activo por defecto y desactiva los anteriores

    return this._http.post(`${urlFirmas}/${req.idFirma}/certificado-digital`, fd);
  }

  /**
   * Estos métodos necesitarían endpoints adicionales en el backend
   * Por ahora, comento su implementación
   */

  // activate(id: number): Observable<any> {
  //   // Este endpoint no existe en el backend actual
  //   // Necesitarías agregarlo en TbFirmaController
  //   return this._http.put(`${urlCertificadoDigital}/${id}/activate`, {});
  // }

  // disable(id: number): Observable<any> {
  //   // Este endpoint no existe en el backend actual
  //   return this._http.put(`${urlCertificadoDigital}/${id}/disable`, {});
  // }
}
