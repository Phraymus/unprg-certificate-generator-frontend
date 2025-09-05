import {Injectable} from "@angular/core";
import {GenericCrudService} from "~shared/classes/GenericCrud.service";
import {TbFirma} from "~shared/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "~environments/environment";

const url = `${environment.HOST_UNPRG_CERTIFICATE_BACKEND}/tbfirmas`;
@Injectable({
  providedIn: 'root'
})
export class TbFirmaServiceService extends GenericCrudService<TbFirma>{
  constructor(private _http: HttpClient) {
    super(url, _http);
  }
}
