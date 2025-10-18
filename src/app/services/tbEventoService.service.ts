import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbEvento} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbeventos`;
@Injectable({
  providedIn: 'root'
})
export class TbEventoService extends GenericCrudService<TbEvento>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}