import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {ApiResponse, TbParticipante} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";
import {map} from "rxjs/operators";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbparticipantes`;
@Injectable({
  providedIn: 'root'
})
export class TbParticipanteService extends GenericCrudService<TbParticipante>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }

  findAllByIdEvento(id: number) {
    return this.http.get<ApiResponse>(`${this.url}/findAllByIdEvento/${id}`).pipe(map((res) => res.data));
  }
}
