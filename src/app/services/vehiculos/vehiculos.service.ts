import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {

  constructor(private http: HttpClient) {}

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/vehiculos`);
  }

  insertarVehiculo(vehiculo: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/vehiculo/crear_vehiculo`, vehiculo);
  }

  editarVehiculo(id: number, vehiculo: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/vehiculo/editar_vehiculo/${id}`, vehiculo);
  }

  eliminarVehiculo(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/vehiculo/eliminar_vehiculo/${id}`, body);
  }
}
