import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class RendicionService {

  constructor(private http: HttpClient) { }

  listarRendiciones() {
    return this.http.get<any[]>(`${URL_SERVICIOS}/rendicion/rendiciones`);
  }

  crearRendicion(data: any) {
    return this.http.post(`${URL_SERVICIOS}/rendicion/crear_rendicion`, data);
  }

  editarRendicion(id: number, data: any) {
    return this.http.put(`${URL_SERVICIOS}/rendicion/editar_rendicion/${id}`, data);
  }
  eliminarRendicion(id: number) {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/rendicion/eliminar_rendicion/${id}`, body);
  }

  listarGastos(id_rendicion: number) {
    return this.http.get<any[]>(`${URL_SERVICIOS}/rendicion/rendicion_gastos/${id_rendicion}`);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/rendicion/clientes`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/rendicion/vehiculos`);
  }

  getCiudad(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/rendicion/ciudades`);
  }

}
