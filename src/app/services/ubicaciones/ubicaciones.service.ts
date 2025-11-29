import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class UbicacionesService {

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

  getVehiculosPropios(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/vehiculos_propios`);
  }

  getUbicacionesVehiculo(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/ubicaciones/${id}`);
  }

  getMantenimientos(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/mantenimientos/${id}`);
  }

  insertarMantenimiento(mantenimiento: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/vehiculo/crear_mantenimiento`, mantenimiento);
  }

  editarMantenimiento(mantenimiento: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/vehiculo/editar_mantenimiento/${mantenimiento.id_mantenimiento}`, mantenimiento);
  }

  eliminarMantenimiento(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/vehiculo/eliminar_mantenimiento/${id}`, body);
  }

  getDetallesMantenimientos(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/mantenimiento_detalles/${id}`);
  }

  insertarDetalleMantenimiento(detalle: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/vehiculo/crear_mantenimiento_detalle`, detalle);
  }

  editarDetalleMantenimiento(detalle: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/vehiculo/editar_mantenimiento_detalle/${detalle.id_detalle}`, detalle);
  }

  eliminarDetalleMantenimiento(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/vehiculo/eliminar_mantenimiento_detalle/${id}`, body);
  }

  getReparaciones(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/reparaciones/${id}`);
  }

  insertarReparacion(reparacion: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/vehiculo/crear_reparacion`, reparacion);
  }

  editarReparacion(reparacion: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/vehiculo/editar_reparacion/${reparacion.id_reparacion}`, reparacion);
  }

  eliminarReparacion(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/vehiculo/eliminar_reparacion/${id}`, body);
  }

  getRevisiones(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/vehiculo/revisiones/${id}`);
  }

  insertarRevision(revision: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/vehiculo/crear_revision`, revision);
  }

  editarRevision(revision: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/vehiculo/editar_revision/${revision.id_revision}`, revision);
  }

  eliminarRevision(id: number): Observable<any> {
    const body = {
      estado: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/vehiculo/eliminar_revision/${id}`, body);
  }
  
}
