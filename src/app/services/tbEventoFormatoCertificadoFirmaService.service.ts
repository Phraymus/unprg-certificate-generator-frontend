import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {ApiResponse, TbEventoFormatoCertificadoFirma} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbeventoformatocertificadofirmas`;
@Injectable({
  providedIn: 'root'
})
export class TbEventoFormatoCertificadoFirmaService extends GenericCrudService<TbEventoFormatoCertificadoFirma>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }

  findByEventoId(eventoId: number): Observable<TbEventoFormatoCertificadoFirma[]> {
    return this.http.get<ApiResponse<TbEventoFormatoCertificadoFirma[]>>(
      `${this.url}/findByEventoFormato/${eventoId}`
    ).pipe(
      map(response => response.data || [])
    );
  }

  findFirmaIdsByEventoId(eventoId: number): Observable<number[]> {
    return this.findByEventoId(eventoId).pipe(
      map(asignaciones =>
        asignaciones
          .map(a => a.idtbFirma?.id)
          .filter(id => id !== undefined) as number[]
      )
    );
  }
}
