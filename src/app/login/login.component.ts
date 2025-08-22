import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as Notiflix from 'notiflix';
import Swal from 'sweetalert2';
import { UsuarioService } from '../services/service.index';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
tipo: string='password';
constructor( @Inject(DOCUMENT) private _document:any, public router: Router, public _usuarioService: UsuarioService){}

ngOnInit(){
}

passwordInput(){
  this.tipo=== 'password' ? this.tipo='text' : this.tipo='password';
  this._document.getElementById('password-input').setAttribute('type',this.tipo);
}


ingresar(forma: NgForm){
  Notiflix.Loading.standard('Cargando..');
  this._usuarioService.login(forma.value)
    .subscribe(resp =>
      {
        if (localStorage.getItem('rol')=='0'){
          Notiflix.Loading.remove();
          this.router.navigate(['/cod-asignar'])
        } else {
          Notiflix.Loading.remove();
          Swal.fire({
              title: '¡Bienvenid@!',
              text: 'Has iniciado sesión correctamente.',
              icon: 'success'
            })
          this.router.navigate(['/dashboard'])
        }
      }, (err) => {
        Notiflix.Loading.remove();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debe ingresar un  usuario y contraseña valida.',
          showConfirmButton: true,
          customClass: {
            confirmButton: 'btn btn-primary w-xs mt-2',
          },
          buttonsStyling: false,
          showCloseButton: true      
        });
      }
  );


}
}
