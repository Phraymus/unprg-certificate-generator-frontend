import {Inject} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CrudService} from './CrudService.service';
import {ApiResponse} from "../interfaces";
import {HttpClient} from "@angular/common/http";

export abstract class GenericCrudService<T> implements CrudService<T> {
  protected constructor(@Inject(String) protected url: string, protected http: HttpClient) {
  }

  findById(idCrud: number): Observable<T> {
    return this.http.get<ApiResponse>(`${this.url}/model-se-ro/${idCrud}`).pipe(map((res) => res.data));
  }

  findAll(): Observable<T[]> {
    return this.http.get<ApiResponse>(`${this.url}/model-se-ro/findAll`).pipe(map((res) => res.data));
  }

  insert(resource: T): Observable<T> {
    return this.http.post<ApiResponse>(`${this.url}`, resource).pipe(map((res) => res.data));
  }

  update(resource: T): Observable<T> {
    return this.http.put<ApiResponse>(`${this.url}`, resource).pipe(map((res) => res.data));
  }

  delete(resource: T): Observable<ApiResponse<T>> {
    return this.http.request<ApiResponse>('delete', `${this.url}`, {body: resource}).pipe(map((res) => res.data));
  }
}
