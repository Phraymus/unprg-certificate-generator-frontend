import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbPersona} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbpersonas`;
@Injectable({
  providedIn: 'root'
})
export class TbPersonaService extends GenericCrudService<TbPersona>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}