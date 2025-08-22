import { Component } from '@angular/core';
import { CodificacionService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adm-usuarios',
  templateUrl: './adm-usuarios.component.html',
  styleUrls: ['./adm-usuarios.component.css']
})
export class AdmUsuariosComponent {
  personas: any;
  persona: any;
  registros: any;
  roles: any;
  datos = [
    { "categoria": "ADMIN"},
    { "categoria": "RRHH"},
    { "categoria": "USA"},
  ]
  constructor(private _codificacionService:CodificacionService) {}

  ngOnInit() {
    this._codificacionService.personas(localStorage.getItem('categoria') ?? '').subscribe(resp=>{
      this.personas=resp;
      this._codificacionService.firmas(localStorage.getItem('categoria') ?? '').subscribe(
        (resp: any)=>{
          this.registros=resp;
          this._codificacionService.roles().subscribe(
            (resp: any)=>{
              this.roles=resp;
            })    
        })
    });
  }

  seleccionar(){
    this.persona.usucre = localStorage.getItem('id') ?? '';
    this.persona.categoria = localStorage.getItem('categoria') ?? ''
    this._codificacionService.crearUsuario(this.persona).subscribe(
      (resp: any)=>{
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Se creo el usuario debe asignarle un rol para completar el registro",
          showConfirmButton: false,
          timer: 1500
        }).then(()=>{
          this._codificacionService.firmas(localStorage.getItem('categoria') ?? '').subscribe(
            (resp: any)=>{
              this.registros=resp;
            })
        });
        
      }) 
  }

  updateUsuario(datos: any){
    datos.estado='ELABORADO';
    console.log(datos)
    this._codificacionService.updateUsuario(datos).subscribe(
      (resp: any)=>{
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Se concluyo el registro del usuario",
          showConfirmButton: false,
          timer: 1500
        }).then(()=>{
          this._codificacionService.firmas(localStorage.getItem('categoria') ?? '').subscribe(
            (resp: any)=>{
              this.registros=resp;
            })
        });
      }) 
  }

  eliminarUsuario(datos: any){
    datos.estado='ANULADO';
    this._codificacionService.updateUsuario(datos).subscribe(
      (resp: any)=>{
        this._codificacionService.firmas(localStorage.getItem('categoria') ?? '').subscribe(
          (resp: any)=>{
            this.registros=resp;
          })
      }) 
  }
}
