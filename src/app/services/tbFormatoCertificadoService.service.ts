import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbFormatoCertificado} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ApiResponse} from "~shared/interfaces";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbformatocertificados`;

@Injectable({
  providedIn: 'root'
})
export class TbFormatoCertificadoService extends GenericCrudService<TbFormatoCertificado> {

  constructor(private _http: HttpClient) {
    super(url, _http);
  }

  // Método para subir archivo Word junto con los datos del formato
  insertWithFile(formatoData: TbFormatoCertificado, archivo: File): Observable<TbFormatoCertificado> {
    const formData = new FormData();

    // Agregar datos del formato
    formData.append('codigo', formatoData.codigo || '');
    formData.append('nombreFormato', formatoData.nombreFormato || '');
    formData.append('idtbUsuario', (formatoData.idtbUsuario || 0).toString());

    // Agregar archivo
    formData.append('archivo', archivo, archivo.name);

    return this._http.post<ApiResponse>(`${this.url}/upload`, formData)
      .pipe(map((res) => res.data));
  }

  // Método para actualizar con archivo (opcional)
  updateWithFile(formatoData: TbFormatoCertificado, archivo?: File): Observable<TbFormatoCertificado> {
    if (archivo) {
      const formData = new FormData();

      // Agregar datos del formato
      formData.append('id', (formatoData.id || 0).toString());
      formData.append('codigo', formatoData.codigo || '');
      formData.append('nombreFormato', formatoData.nombreFormato || '');
      formData.append('idtbUsuario', (formatoData.idtbUsuario || 0).toString());

      // Agregar archivo
      formData.append('archivo', archivo, archivo.name);

      return this._http.put<ApiResponse>(`${this.url}/upload`, formData)
        .pipe(map((res) => res.data));
    } else {
      // Actualización sin archivo
      return this.update(formatoData);
    }
  }

  // Método para descargar archivo
  downloadFile(id: number): Observable<Blob> {
    return this._http.get(`${this.url}/download/${id}`, {
      responseType: 'blob'
    });
  }

  // Método para obtener URL de vista previa
  getPreviewUrl(id: number): string {
    return `${this.url}/preview/${id}`;
  }
}
