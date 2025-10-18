import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbCertificado} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbcertificados`;
@Injectable({
  providedIn: 'root'
})
export class TbCertificadoService extends GenericCrudService<TbCertificado>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}