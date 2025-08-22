import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { clearStorage } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class DespachosService {

  constructor(private http: HttpClient) {}

  getDespachos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/despachos`);
  }

  insertarDespacho(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/despachos/crear_despacho`, data);
  }

  editarDespacho(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/despachos/editar_despacho/${id}`, data);
  }

  editarEstadoDespacho(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/despachos/editar_estado_despacho/${id}`, data);
  }

  eliminarDespacho(id: number, id_contenedor: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/despachos/eliminar_despacho/${id}/${id_contenedor}`, body);
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

  getPdfs(id_despacho: number, pdf: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos/pdfs/${id_despacho}/${pdf}`);
  }

  subirPdf(formData: FormData): Observable<any> {
  return this.http.post(`${URL_SERVICIOS}/despachos/subir_pdf`, formData);
}

}
