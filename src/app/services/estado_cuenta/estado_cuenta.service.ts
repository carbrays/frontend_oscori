import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class EstadoCuentaService {

  constructor(private http: HttpClient) { }

  listarEstados() {
    return this.http.get<any[]>(`${URL_SERVICIOS}/estado_cuenta/estados_cuenta`);
  }

  crearEstadoCuenta(data: any) {
    return this.http.post(`${URL_SERVICIOS}/estado_cuenta/crear_estado_cuenta`, data);
  }

  editarEstadoCuenta(id: number, data: any) {
    return this.http.put(`${URL_SERVICIOS}/estado_cuenta/editar_estado_cuenta/${id}`, data);
  }

  eliminarEstadoCuenta(id: number) {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/estado_cuenta/eliminar_estado_cuenta/${id}`, body);
  }

  listarGastos(id_rendicion: number) {
    return this.http.get<any[]>(`${URL_SERVICIOS}/estado_cuenta/estado_cuenta_gastos/${id_rendicion}`);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/estado_cuenta/clientes`);
  }
  
}
