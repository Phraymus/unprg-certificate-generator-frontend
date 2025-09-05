import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbEventoFormatoCertificadoFirma} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbeventoformatocertificadofirmas`;
@Injectable({
  providedIn: 'root'
})
export class TbEventoFormatoCertificadoFirmaService extends GenericCrudService<TbEventoFormatoCertificadoFirma>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}
