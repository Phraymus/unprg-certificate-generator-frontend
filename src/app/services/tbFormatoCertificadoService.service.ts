import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbFormatoCertificado} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbformatocertificados`;
@Injectable({
  providedIn: 'root'
})
export class TbFormatoCertificadoService extends GenericCrudService<TbFormatoCertificado>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}