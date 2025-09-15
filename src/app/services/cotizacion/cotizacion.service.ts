import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { clearStorage } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

  constructor(private http: HttpClient) {}

  getCotizaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/cotizaciones`);
  }

  insertarCotizacion(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/cotizacion/crear_cotizacion`, data);
  }

  editarCotizacion(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/cotizacion/editar_cotizacion/${id}`, data);
  }

  eliminarCotizacion(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/cotizacion/eliminar_cotizacion/${id}`, body);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/clientes`);
  }

  getForwaders(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/forwaders`);
  }

  getMercancia(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/mercancias`);
  }

  getNaviera(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/navieras`);
  }

  getCiudad(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/ciudades`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cotizacion/vehiculos`);
  }

  subirPdf(formData: FormData): Observable<any> {
  return this.http.post(`${URL_SERVICIOS}/cotizacion/subir_pdf`, formData);
}

  insertarCliente(cliente: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/cliente/crear_cliente`, cliente);
  }

  insertarForwader(forwader: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/forwader/crear_forwarder`, forwader);
  }

}