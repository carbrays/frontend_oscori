
import { Component, NgZone, OnInit, Input, OnDestroy } from '@angular/core';

import 'lodash';
import Swal from 'sweetalert2';

import { UsuarioService } from '../../services/usuario/usuario.service';
import { Table } from 'primeng/table';
import { now } from 'moment';
import { NgForm } from '@angular/forms';

declare var _:any;

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  usuarios: any;
  popupVisible = false;
  modoEdicion = false;
  usuarioSeleccionado: any = {};
  tituloPopup: string = 'Usuario';

  opcionesCargo = [
  { label: 'Chofer', value: 'CHOFER' },
  { label: 'Administrativo', value: 'ADMINISTRATIVO' }
  ];

  mresumen: any;

  constructor(private usuarioService: UsuarioService, private zone: NgZone) { }

  ngOnInit() {
    this.obtenerListado();
  }

  editarUsuario(usuario: any, form: NgForm) {
    this.usuarioSeleccionado = { ...usuario, licencia_vencimiento: usuario.licencia_vencimiento ? new Date(usuario.licencia_vencimiento) : null, 
      fecha_inicio: usuario.fecha_inicio ? new Date(usuario.fecha_inicio) : null
     };
    this.tituloPopup = 'Editar Usuario';
    this.popupVisible = true;
    this.modoEdicion = true;
    // setTimeout(() => {
    //   form.resetForm(); 
    // });
  }

  eliminarUsuario(usuario: any) {
    Swal.fire({
          title: `¿Estás seguro de eliminar a ${usuario.nombre}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then(result => {
          if (result.isConfirmed) {
            this.usuarioService.eliminarUsuario(usuario.id_usuario).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter((u: { id_usuario: any; }) => u.id_usuario !== usuario.id_usuario);
          console.log('Usuario eliminado correctamente');
        },
        error: err => {
          console.error('Error al eliminar usuario:', err);
          alert('No se pudo eliminar el usuario.');
        }
      });
          }
        });
    
  }

  obtenerListado() {
      return this.usuarioService.getUsuario().subscribe(data => {
        this.usuarios = data;
      })
  }

  guardarCambios(form: NgForm) {
    if (form.invalid) {
    Object.values(form.controls).forEach(control => control.markAsTouched());

    // Agregar animación de vibración a los campos inválidos
    Object.keys(form.controls).forEach(controlName => {
      const el = document.querySelector(`[name="${controlName}"]`);
      if (el && form.controls[controlName].invalid) {
        el.classList.add('vibrar');
        setTimeout(() => el.classList.remove('vibrar'), 500);
      }
    });

    return;
  }
    
    console.log(this.modoEdicion);
     if (this.modoEdicion) {
    const id = this.usuarioSeleccionado.id_usuario;
    this.usuarioService.editarUsuario(id, this.usuarioSeleccionado).subscribe({
      next: () => {
        this.popupVisible = false;
        this.obtenerListado();
        Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
      },
      error: (err: any) => {
        Swal.fire('Error', 'No se pudo actualizar.', 'error');
      }
    });
  } else {
    this.usuarioService.insertarUsuario(this.usuarioSeleccionado).subscribe({
      next: () => {
        this.popupVisible = false;
        this.obtenerListado();
        console.log('Usuario insertado correctamente');
        Swal.fire('Guardado', 'Vehículo insertado correctamente', 'success');
      },
      error: (err: any) => {
        console.error('Error al insertar:', err);
        Swal.fire('Error', 'No se pudo insertar el vehículo.', 'error');
      }
    });
  }
  }

  abrirNuevoUsuario(form: NgForm) {
  this.usuarioSeleccionado = {
    login: '',
    password: '',
    nombre: '',
    paterno: '',
    materno: '',
    ci: '',
    direccion: '',
    cargo: '',
    rol: 0,
    telefono: '',
    telefono_chile: '',
    correo: '',
    persona_ref: '',
    telefono_ref: '',
    licencia_categoria: '',
    licencia_vencimiento: null,
    fecha_inicio: null,
    usucre: localStorage.getItem('login')
  };
console.log(this.usuarioSeleccionado);
  this.tituloPopup = 'Nuevo Usuario';
  this.popupVisible = true;
  this.modoEdicion = false;
  // setTimeout(() => {
  //   form.resetForm();
  // });
}

numeros(event: any, campo: string) {
  const valor = event.target.value;
  const soloNumeros = valor.replace(/[^0-9]/g, '');
  event.target.value = soloNumeros;
  this.usuarioSeleccionado[campo] = soloNumeros;
}

esFechaVencida(fechaStr: string | Date): boolean {
  if (!fechaStr) return false;
  const hoy = new Date();
  const fecha = new Date(fechaStr);
  
  // Ajusta horas a 0 para comparar solo fechas (sin tiempo)
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  return fecha < hoy;
}

validateForm(): boolean {
    // Implementa validaciones necesarias
    return true; // Devuelve false si hay errores en el formulario
  }

}
