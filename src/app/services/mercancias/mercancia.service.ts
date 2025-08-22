import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class MercanciaService {

  constructor(private http: HttpClient) {}

  getMercancias(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/mercancia/mercancias`);
  }

  insertarMercancia(mercancia: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/mercancia/crear_mercancia`, mercancia);
  }

  editarMercancia(id: number, mercancia: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/mercancia/editar_mercancia/${id}`, mercancia);
  }

  eliminarMercancia(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/mercancia/eliminar_mercancia/${id}`, body);
  }
}
