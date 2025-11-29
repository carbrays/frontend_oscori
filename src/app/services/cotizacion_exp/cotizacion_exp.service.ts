import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { clearStorage } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class Cotizacion_ExpService {

  constructor(private http: HttpClient) {}

  getCotizaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion_exp/cotizaciones`);
  }

  insertarCotizacion(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/cotizacion_exp/crear_cotizacion`, data);
  }

  editarCotizacion(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/cotizacion_exp/editar_cotizacion/${id}`, data);
  }

  eliminarCotizacion(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/cotizacion_exp/eliminar_cotizacion/${id}`, body);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion_exp/clientes`);
  }

  getForwaders(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion_exp/forwaders`);
  }

  getMercancia(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion_exp/mercancias`);
  }

  getNaviera(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion_exp/navieras`);
  }

  getCiudad(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion_exp/ciudades`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion_exp/vehiculos`);
  }

  subirPdf(formData: FormData): Observable<any> {
  return this.http.post(`${URL_SERVICIOS}/cotizacion_exp/subir_pdf`, formData);
}

  insertarCliente(cliente: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/cliente/crear_cliente`, cliente);
  }

  insertarForwader(forwader: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/forwader/crear_forwarder`, forwader);
  }

}