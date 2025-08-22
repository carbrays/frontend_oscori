import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import 'moment/locale/es';
import { CodificacionService, UsuarioService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';
import { GuardarForm } from '../../../interfaces/guardar.interface';
import { Persona } from '../../../models/persona.model';
@Component({
  selector: 'app-cod-verificacion',
  templateUrl: './cod-verificacion.component.html',
  styleUrls: ['./cod-verificacion.component.css']
})
export class CodVerificacionComponent {
  personas: any;
  referencias: any;
  referencia: any;
  firmas: Persona[] = [];
  persona: any;
  firma: any
  carnet?: number;
  idCargo: number = 0;
  cargo?: string;
  unidad?: string;
  direccion?: string;
  carnetF?: number;
  cargoF?: string;
  unidadF?: string;
  direccionF?: string;
  fechaActual: Date = new Date();
  numero: string = '';
  asunto: string = '';
  contenido: string = '';
  cc: string = '';
  guardarForm?: GuardarForm;
  datos: any;
  datosFirma: any;
  idFuncionario: number = 0;
  idFirma: number = 0;
  fechaFormateada: string ='';
  idRol =  localStorage.getItem('rol') ?? '';
  idCategoria = localStorage.getItem('categoria') ?? '';
  display: boolean = false;
  es = {
    firstDayOfWeek: 1,
    dayNames: [ "domingo","lunes","martes","miércoles","jueves","viernes","sábado" ],
    dayNamesShort: [ "dom","lun","mar","mié","jue","vie","sáb" ],
    dayNamesMin: [ "D","L","M","X","J","V","S" ],
    monthNames: [ "enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre" ],
    monthNamesShort: [ "ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic" ],
    today: 'Hoy',
    clear: 'Borrar'
  }
  sw = this.activatedRoute.snapshot.params.id;
  constructor(private _codificacionService:CodificacionService, private _usuarioService: UsuarioService, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.idFuncionario = this.activatedRoute.snapshot.params.idFuncionario;
    this.idFirma = this.activatedRoute.snapshot.params.idFirma;
    this._codificacionService.personas(this.idCategoria).subscribe(resp=>{
      this.personas=resp;
      this.persona = this.personas.find((resp:any)=>resp.llave==this.idFuncionario);
      this.seleccionar();
      this._codificacionService.personas(this.idCategoria).subscribe((resp: any)=>{
        this.firmas=resp;
        this.firma = this.firmas.find((resp:any)=>resp.llave==this.idFirma);
        this.seleccionarFirma()
        this._codificacionService.referencias(this.idCategoria,'21').subscribe(resp=>{
          this.referencias=resp;
          this._codificacionService.registroId(this.activatedRoute.snapshot.params.idRegistro).subscribe(resp=>{
            this.cargo=resp[0].cargo_funcionario;
            this.cargoF=resp[0].cargo_firma;
            this.numero = resp[0].numero;
            this.referencia = this.referencias.find((res: any)=>res.referencia==resp[0].referencia);
            this.asunto = resp[0].asunto;
            this.contenido = resp[0].contenido;
            this.cc = resp[0].cc;
            this.fechaFormateada = resp[0].fecha;
          });  
        });
      });
    });
  }

  fecha(){
    this.display=true;
  }

  selecionarFecha(){
    this.display=false;
    this.fechaFormateada = 'La Paz, '+moment(this.fechaActual,"DD/MM/YYYY").format('DD [de] MMMM [de] YYYY').toString();
  }


  seleccionar() {
    this.datos=this.persona;
    this.carnet=undefined;
    this.cargo='';
    this.unidad='';
    this.direccion='';
    this.carnet=this.persona.ci;
    this.cargo=this.persona.cargo;
    this.unidad=this.persona.unidad;
    this.direccion=this.persona.direccion;
  }

  seleccionarFirma(){
    this.datosFirma = this.firma;
    this.carnetF=undefined;
    this.cargoF='';
    this.unidadF='';
    this.direccionF='';
    this.carnetF=this.firma.ci;
    this.cargoF=this.firma.cargo;
    this.unidadF=this.firma.unidad;
    this.direccionF=this.firma.direccion;
  }

  guardar(){
    let sw=0;
    this.persona==undefined && sw==0?sw=1:'';
    this.referencia==undefined && sw==0?sw=2:'';
    this.asunto=='' && sw==0?sw=3:'';
    this.contenido=='' && sw==0?sw=4:'';
    this.cc=='' && sw==0?sw=5:'';
    this.firma==undefined && sw==0?sw=6:'';
    if (sw==0 ) {
      this.guardarForm = {
        id_registro: this.activatedRoute.snapshot.params.idRegistro,
        id_funcionario: this.persona.llave,
        funcionario: this.persona.nombre,
        apellido: this.persona.apellido,
        puesto: this.cargo,
        fecha: this.fechaFormateada.toString() ?? '',
        numero: this.numero,
        id_referenciamemos: this.referencia.id_referencia,
        id_funcionario_firma: this.firma.llave,
        funcionario_firma: this.firma.nombre,
        puesto_firma: this.cargoF,
        asunto: this.asunto,
        contenido: this.contenido,
        cc: this.cc,
        usucre: localStorage.getItem('id') ?? '',
        categoria: this.idCategoria
      }
      this._codificacionService.modificar(this.guardarForm).subscribe((resp:any)=>{
        Swal.fire({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          icon: 'success',
          timer: 4000,
          title: resp.respuesta
        }).then(()=>{
          this.router.navigate( ['/cod-seleccionar'] );
        });
      })
    } else {
      switch (sw) {
        case 1:
          this.mensaje('Debe registrar a la persona que esta dirigida el memorandum');
          break;
        case 2:
          this.mensaje('Debe registrar la referncia del memorandum');
          break;
        case 3:
          this.mensaje('Debe registrar el asunto del memorandum');
          break;
        case 4:
          this.mensaje('Debe registrar el contenido del memorandum');
          break;
        case 5:
          this.mensaje('Debe registrar la copia del memorandum');
          break;
        default:
          this.mensaje('Debe registrar quien esta realizando el memorandum');
      }
    }
  }

  cancelar(){
    this.router.navigate( ['/cod-seleccionar'] );
  }

  mensaje(mensaje: string) {
    Swal.fire({
      toast: true,
      position: 'center',
      showConfirmButton: false,
      icon: 'error',
      timer: 600,
      title: mensaje
    })
  }
}
