import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbUsuario} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbusuarios`;
@Injectable({
  providedIn: 'root'
})
export class TbUsuarioService extends GenericCrudService<TbUsuario>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}