import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { GuardarPostulante } from '../../interfaces/guardarpostulante.interface';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {

  constructor(private http: HttpClient) {}

  getPostulantes(depto: any, escuela: any, sexo: any, centro: any): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/reporte/${depto}/${escuela}/${sexo}/${centro}`);
  }

  getPostulante(id:any): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/listarPostulante/${id}`);
  }

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/listarDeptos`);
  }

  getEscuelas(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/listarEscuelas`);
  }

  getCentros(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/listarCentros`);
  }

  createPostulante(postulante: GuardarPostulante) {
    return this.http.post(`${URL_SERVICIOS}/dashboard/postulante`, postulante);
  }

  updatePostulante(postulante: GuardarPostulante) {
    return this.http.post(`${URL_SERVICIOS}/dashboard/updatePostulante`, postulante);
  }
  
}
