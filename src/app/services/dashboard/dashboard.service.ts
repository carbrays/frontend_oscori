import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { GuardarPostulante } from '../../interfaces/guardarpostulante.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  getTotal(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cliente/totales`);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/clientes`);
  }

  getMercancia(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/mercancias`);
  }

  getNaviera(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/navieras`);
  }

  getCiudad(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/ciudades`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/vehiculos`);
  }

  getDespachos(grupo: string, estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/despachos_estado/${grupo}/${estado}`);
  }

   getContenedores(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/contenedores_estado/${estado}`);
  }

  
}
