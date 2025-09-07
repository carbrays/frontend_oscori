import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class ContenedorService {

  constructor(private http: HttpClient) {}

  getContenedores(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/contenedores`);
  }

  insertarContenedor(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/contenedor/crear`, data);
  }

  editarContenedor(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/contenedor/editar_contenedor/${id}`, data);
  }

  editarEstadoContenedor(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/contenedor/editar_estado_contenedor/${id}`, data);
  }

  eliminarContenedor(id: number): Observable<any> {
    const body = {
      estado_actual: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/contenedor/eliminar_contenedor/${id}`, body);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/clientes`);
  }

  getMercancia(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/mercancias`);
  }

   getCiudad(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/ciudades`);
  }

   getNaviera(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/navieras`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/vehiculos`);
  }

  getGastosContenedor(id_contenedor: number, nombreGasto: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/gastos/${id_contenedor}/${nombreGasto}`);
  }

  insertarGasto(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/contenedor/crear_gasto`, data);
  }

  editarGasto(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/contenedor/editar_gasto/${id}`, data);
  }

  eliminarGasto(id: number, id_contenedor: number, tipo: string): Observable<any> {
    const body = {
      estado_actual: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/contenedor/eliminar_gasto/${id}/${id_contenedor}/${tipo}`, body);
  }

  getDevolucionesContenedor(id_contenedor: number): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/devoluciones/${id_contenedor}`);
  }

  insertarDevolucion(data: any): Observable<any> {
    return this.http.post(`${URL_SERVICIOS}/contenedor/crear_devolucion`, data);
  }

  editarDevolucion(id: number, data: any): Observable<any> {
    return this.http.put(`${URL_SERVICIOS}/contenedor/editar_devolucion/${id}`, data);
  }

  eliminarDevolucion(id: number, id_contenedor: number): Observable<any> {
    const body = {
      estado_actual: 'INACTIVO',
      usumod: localStorage.getItem('login'),
      fecmod: new Date()
    };
    return this.http.put(`${URL_SERVICIOS}/contenedor/eliminar_devolucion/${id}/${id_contenedor}`, body);
  }
  getGastosDeuda(): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/gastos_deuda`);
  }
  getImagenes(id_contenedor: number): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/imagenes/${id_contenedor}`);
  }

  getPdfs(id_contenedor: number, pdf: string): Observable<any[]> {
    return this.http.get<any[]>(`${URL_SERVICIOS}/contenedor/pdfs/${id_contenedor}/${pdf}`);
  }
  
  subirPdf(formData: FormData): Observable<any> {
  return this.http.post(`${URL_SERVICIOS}/contenedor/subir_pdf`, formData);
}

deleteFile(pdf: string): Observable<any> {
    return this.http.delete(`${URL_SERVICIOS}/contenedor/eliminar_pdf/${pdf}`);
  }
}
