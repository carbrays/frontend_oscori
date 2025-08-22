import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';
@Injectable({
  providedIn: 'root'
})
export class CodificacionService {

  constructor(private http: HttpClient) {}


  private crearArreglo(heroesObj: any) {
    const heroes: any[] = [];
    Object.keys(heroesObj).forEach(key => {
      const heroe: any = heroesObj[key];
      heroe.id = key;
      heroes.push(heroe);
    });
    return heroes;
  }

  validar(id: number, estado: string) {
    return this.http.get(`${URL_SERVICIOS}/asignacionNuevo/validar/${id}/${estado}/${localStorage.getItem('login')}`).pipe(
      map(this.crearArreglo));
  }

  nombreCatalogo(id: number) {
    return this.http.get(`${URL_SERVICIOS}/asignacionNuevo/nombreCatalogo/${id}`).pipe(
      map(this.crearArreglo));
  }

  catalogoCodificacion(catalogo: string, respuesta: string, codigo: string) {
    const enviar = catalogo+'|'+respuesta+'|'+codigo;
    return this.http.get(`${URL_SERVICIOS}/asignacionNuevo/catalogoCodificacion/${enviar}`).pipe(
      map(this.crearArreglo));
  }

  updateCodigo(datos: any, id: number,codigo: string) {
    const enviar = {
      pregunta: id,
      codigo: codigo,
      id_asignacion: datos.id_asignacion,
      correlativo: datos.correlativo,
      usuario: localStorage.getItem('login'),
      estado: localStorage.getItem('rol') === '24' ? 'CODIFICADO' : 'VERIFICADO'
    }
    return this.http.put(`${URL_SERVICIOS}/asignacionNuevo/updateCodigo`, JSON.stringify(enviar)).subscribe();
  }

  obtenerVariables(asignacion: number, correlativo: number, pregunta: number){
    return this.http.get(`${URL_SERVICIOS}/asignacionNuevo/obtenerVariables/${asignacion}/${correlativo}/${pregunta}`).pipe(
      map(this.crearArreglo));
  }
  
  maximo(id: string) {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/maximo/${id}`).pipe(
      map(this.crearArreglo));
  }

  personas(id: string) {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/personas/${id}`);
  }

  personaId(id: number) {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/personaId/${id}`).pipe(
      map(this.crearArreglo));
  }

  firmas(id: string) {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/firmas/${id}`).pipe(
      map(this.crearArreglo));
  }

  referencias(categoria: string, rol: string) {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/referencias/${categoria}/${rol}`).pipe(
      map(resp => { return resp; }));
  }

  guardar(datos: any) {
    return this.http.post(`${URL_SERVICIOS}/monitoreo/guardar`, JSON.stringify(datos));
  }

  crearUsuario(datos: any) {
    return this.http.post(`${URL_SERVICIOS}/monitoreo/crearUsuario`, JSON.stringify(datos));
  }

  updateUsuario(datos: any) {
    return this.http.put(`${URL_SERVICIOS}/monitoreo/updateUsuario`, JSON.stringify(datos));
  }

  modificar(datos: any) {
    return this.http.put(`${URL_SERVICIOS}/monitoreo/modificar`, JSON.stringify(datos));
  }

  registro(id: string,persona: string, categoria: string) {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/registros/${id}/${persona}/${categoria}`).pipe(
      map(this.crearArreglo));
  }


  roles() {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/roles`).pipe(
      map(this.crearArreglo));
  }

  registroId(id: number) {
    return this.http.get(`${URL_SERVICIOS}/monitoreo/registroId/${id}`).pipe(
      map(this.crearArreglo));
  }

  listaDirectorio(gestion: number) {
    return this.http.get(`${URL_SERVICIOS}/dashboard/listaDirectorio/${gestion}`);
  }

  nandina() {
    return this.http.get(`${URL_SERVICIOS}/dashboard/nandina`);
  }

  datoEmpresa(id: string) {
    return this.http.get(`${URL_SERVICIOS}/dashboard/datoEmpresa/${id}`);
  }

  datoGastos(id: number,gestion: number) {
    return this.http.get(`${URL_SERVICIOS}/dashboard/datoGastos/${id}/${gestion}`);
  }    

  updateEmpresa(datos: any) {
    return this.http.post(`${URL_SERVICIOS}/dashboard/updateEmpresa`,JSON.stringify(datos));
  }

  updateGastos(datos: any) {
    return this.http.post(`${URL_SERVICIOS}/dashboard/updateGastos`,JSON.stringify(datos));
  }
}
