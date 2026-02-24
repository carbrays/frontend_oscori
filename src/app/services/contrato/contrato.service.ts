import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class ContratoService {

  constructor(private http: HttpClient) { }

  listarContratos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contrato/contratos`);
  }

  // ===============================
  // OBTENER CONTRATO POR ID (PDF / EDICIÓN)
  // ===============================
  obtenerContrato(id: number): Observable<any> {
    return this.http.get<any>(`${URL_SERVICIOS}/contrato/contratos/${id}`);
  }

  // ===============================
  // CREAR CONTRATO
  // ===============================
  crearContrato(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/contrato/crear_contrato`, data);
  }

  // ===============================
  // EDITAR CONTRATO
  // ===============================
  editarContrato(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/contrato/editar_contrato/${id}`, data);
  }

  // ===============================
  // DESACTIVAR CONTRATO (BORRADO LÓGICO)
  // ===============================
  eliminarContrato(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login')
    };
    return this.http.put(`${URL_SERVICIOS}/contrato/eliminar_contrato/${id}`, body);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contrato/clientes`);
  }
  
  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contrato/vehiculos`);
  }
}
