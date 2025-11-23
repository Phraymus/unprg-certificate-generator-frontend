import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {ApiResponse, TbFormatoCertificadoFirma} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbformatocertificadofirmas`;
@Injectable({
  providedIn: 'root'
})
export class TbFormatoCertificadoFirmaService extends GenericCrudService<TbFormatoCertificadoFirma>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }

  findAllByIdFormatoCertificado(eventoId: number): Observable<TbFormatoCertificadoFirma[]> {
    return this.http.get<ApiResponse<TbFormatoCertificadoFirma[]>>(
      `${this.url}/findAllByIdFormatoCertificado/${eventoId}`
    ).pipe(
      map(response => response.data || [])
    );
  }

  findFirmaIdsByFormatoCertificadoId(eventoId: number): Observable<number[]> {
    return this.findAllByIdFormatoCertificado(eventoId).pipe(
      map(asignaciones =>
        asignaciones
          .map(a => a.tbFirma?.id)
          .filter(id => id !== undefined) as number[]
      )
    );
  }
}
