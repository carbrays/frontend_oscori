import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de todos los clientes
   */
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/cliente/clientes`);
  }

  /**
   * Insertar nuevo cliente
   */
  insertarCliente(cliente: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/cliente/crear_cliente`, cliente);
  }

  /**
   * Editar cliente por ID
   */
  editarCliente(id_cliente: number, cliente: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/cliente/editar_cliente/${id_cliente}`, cliente);
  }

  /**
   * Eliminar (desactivar) cliente por ID
   */
  eliminarCliente(id_cliente: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/cliente/eliminar_cliente/${id_cliente}`, body);
  }
}
