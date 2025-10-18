import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {ApiResponse, TbPersona} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbpersonas`;
@Injectable({
  providedIn: 'root'
})
export class TbPersonaService extends GenericCrudService<TbPersona>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }

  findAllByNombreOrDni(search: string): Observable<TbPersona[]> {
    return this.http.get<ApiResponse>(`${this.url}/findAllByNombreOrDni/${search}`).pipe(map((res) => res.data));
  }
}
