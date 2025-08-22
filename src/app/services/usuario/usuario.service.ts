import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';
import { Usuario } from 'src/app/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  usuario!: Usuario;

  constructor(public http: HttpClient,private router: Router) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get uid():number {
    return this.usuario.id_usuario;
  }

   validarToken(): Observable<boolean> {
    return this.http.get(`${ URL_SERVICIOS }/login/renew`, {
      headers: {
        'token': this.token
      }
    }).pipe(
      map((resp: any) => {
        this.usuario = new Usuario(0, 0, resp.login, '', resp.login, resp.rol, 'serie');
        this.guardarLocalStorage(resp.token, resp.login, resp.rol);
        return true;
      }),
      catchError(error => of(false))
    );

  }

   guardarLocalStorage(token: string, login: any, rol: any){
    localStorage.setItem('login', login);
    localStorage.setItem('rol', rol);
    localStorage.setItem('token', token);
  }

  login(usuario: Usuario) {
    return this.http.post(`${ URL_SERVICIOS}/login/signin`, usuario)
    .pipe(
      tap( (resp: any) => {
        this.guardarLocalStorage(resp.token, resp.login, resp.rol);
      })
    );
  }

  logout() {
    localStorage.removeItem('login');
    localStorage.removeItem('rol');
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

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
}
