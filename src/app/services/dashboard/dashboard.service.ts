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
  getTotalCotizacion(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/totales`);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/clientes`);
  }

  getMercancia(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/mercancias`);
  }

  getNaviera(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/navieras`);
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

   getCotizacionesEstado(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/cotizaciones_estado/${estado}`);
  }

   getCotizaciones(tipo: number, id_cliente: number, estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/cotizaciones/${tipo}/${id_cliente}/${estado}`);
  }

  getForwaders(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/forwaders`);
  }

  deleteFile(pdf: string): Observable<any> {
    return this.http.delete(`${URL_SERVICIOS}/vehiculo/eliminar_pdf/${pdf}`);
  }

  getPdfs(placa: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/pdfs/${placa}`);
  }
  
}
