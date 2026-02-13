import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {ApiResponse, TbEventoFormatoCertificado} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbeventoformatocertificados`;
@Injectable({
  providedIn: 'root'
})
export class TbEventoFormatoCertificadoService extends GenericCrudService<TbEventoFormatoCertificado>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }

  findByEventoId(eventoId: number): Observable<TbEventoFormatoCertificado[]> {
    return this.http.get<ApiResponse>(`${this.url}/findByEventoId/${eventoId}`)
      .pipe(map((res) => res.data));
  }
}
