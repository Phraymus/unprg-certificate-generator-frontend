import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {ApiResponse, TbTipoParticipante} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbtipoparticipantes`;
@Injectable({
  providedIn: 'root'
})
export class TbTipoParticipanteService extends GenericCrudService<TbTipoParticipante>{
  constructor(private readonly _http: HttpClient) {
    super(url, _http);
  }

  findAllByEstado(estado: boolean): Observable<TbTipoParticipante[]> {
    return this.http.get<ApiResponse>(`${this.url}/findAllByEstado/${estado}`).pipe(map((res) => res.data));
  }
}
