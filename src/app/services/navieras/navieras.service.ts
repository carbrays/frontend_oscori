import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class NavierasService {

  constructor(private http: HttpClient) {}

  getNavieras(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/naviera/navieras`);
  }

  insertarNaviera(naviera: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/naviera/crear_naviera`, naviera);
  }

  editarNaviera(id: number, naviera: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/naviera/editar_naviera/${id}`, naviera);
  }

}
