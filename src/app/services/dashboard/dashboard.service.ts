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

  getUsuario() {
    return this.http.get(`${URL_SERVICIOS}/usuario/usuarios`);
  }

  eliminarUsuario(id_usuario: number): Observable<any> {
  const body = {
    estado: 'INACTIVO',
    usumod: 'prueba',
    fecmod: new Date()
  };
  return this.http.put(`${URL_SERVICIOS}/usuario/eliminar/${id_usuario}`, body);
}

  editarUsuario(id_usuario: number, datos: any): Observable<any> {
  return this.http.put(`${URL_SERVICIOS}/usuario/editar/${id_usuario}`, datos);
}

insertarUsuario(usuario: any): Observable<any> {
  return this.http.post(`${URL_SERVICIOS}/usuario/crear_usuario`, usuario);
}

  getTotal(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/total`);
  }

  getTotalDeptoAprobado(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/totalDeptoAprobado`);
  }

  gettotalDeptoReprobado(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/dashboard/totalDeptoReprobado`);
  }
  
}
