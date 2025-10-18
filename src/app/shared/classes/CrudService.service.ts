import { Observable } from 'rxjs';
import {ApiResponse} from "../interfaces";

export interface CrudService<T> {
	findById(idCrud: number): Observable<T>;
	findAll(): Observable<T[]>;
	insert(resource: T): Observable<T>;
	update(resource: T): Observable<T>;
	delete(resource: T): Observable<ApiResponse<T>>;
}
