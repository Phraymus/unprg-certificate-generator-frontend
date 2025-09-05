import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbEventoFormatoCertificado} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbeventoformatocertificados`;
@Injectable({
  providedIn: 'root'
})
export class TbEventoFormatoCertificadoService extends GenericCrudService<TbEventoFormatoCertificado>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}