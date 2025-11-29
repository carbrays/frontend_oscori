import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { clearStorage } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class Despachos_ExpService {

  constructor(private http: HttpClient) { }

  getDespachos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos_exp/despachos`);
  }

  insertarDespacho(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/despachos_exp/crear_despacho`, data);
  }

  editarDespacho(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/despachos_exp/editar_despacho/${id}`, data);
  }

  editarEstadoDespacho(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/despachos_exp/editar_estado_despacho/${id}`, data);
  }

  eliminarDespacho(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/despachos_exp/eliminar_despacho/${id}`, body);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos_exp/clientes`);
  }

  getMercancia(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos_exp/mercancias`);
  }

  getNaviera(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos_exp/navieras`);
  }

  getCiudad(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos_exp/ciudades`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos_exp/vehiculos`);
  }

  getPdfs(id_despacho: number, pdf: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/despachos_exp/pdfs/${id_despacho}/${pdf}`);
  }

  subirPdf(formData: FormData): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/despachos_exp/subir_pdf`, formData);
  }

  deleteFile(pdf: string): Observable<any> {
    return this.http.delete(`${URL_SERVICIOS}/despachos_exp/eliminar_pdf/${pdf}`);
  }

}
