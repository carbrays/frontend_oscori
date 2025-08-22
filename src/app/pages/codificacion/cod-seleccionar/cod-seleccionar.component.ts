import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'lodash';
import { CodificacionService } from 'src/app/services/service.index';
import { GastosModel } from '../../../interfaces/gastos.interface';
import { RegistroForm } from '../../../interfaces/registro.interface';
declare var _:any;


@Component({
  selector: 'app-cod-seleccionar',
  templateUrl: './cod-seleccionar.component.html',
  styleUrls: ['./cod-seleccionar.component.css'],
})
export class CodSeleccionarComponent {
  selectedOption: string | null = null;
  registro: RegistroForm = {
    razon_social: '',
    nit: '',
    rotulo_comercial: '',
    departamento: '',
    ciudad: '',
    zona: '',
    calle: '',
    numero: '',
    entre_calles: '',
    edificio: '',
    piso: '',
    numero_oficina: '',
    telefono: '',
    fax: '',
    email: '',
    pagina: '',
    actividad_principal: '',
    tipo_sector: '',
    otro: '',
    login: ''
  };
  gastosFinal: GastosModel[] = [];
  gastosUn: any;
  selectedCategory: any = null;
  justifyOptions: any[] = [
    { icon: 'ri-edit-fill', name: 'Producto 1', justify: 'Justify', disabled: true, posicion: 0 },
    { icon: 'ri-edit-fill', name: 'Producto 2', justify: 'Justify', disabled: true, posicion: 1 },
    { icon: 'ri-edit-fill', name: 'Producto 3', justify: 'Justify', disabled: true, posicion: 2 },
    { icon: 'ri-edit-fill', name: 'Producto 4', justify: 'Justify', disabled: true, posicion: 3 },
    { icon: 'ri-edit-fill', name: 'Producto 5', justify: 'Justify', disabled: true, posicion: 4 },
    { icon: 'ri-edit-fill', name: 'Producto 6', justify: 'Justify', disabled: true, posicion: 5 },
    { icon: 'ri-edit-fill', name: 'Producto 7', justify: 'Justify', disabled: true, posicion: 6 },
    { icon: 'ri-edit-fill', name: 'Producto 8', justify: 'Justify', disabled: true, posicion: 7 },
    { icon: 'ri-edit-fill', name: 'Producto 9', justify: 'Justify', disabled: true, posicion: 8 },
    { icon: 'ri-edit-fill', name: 'Producto 10',justify: 'Justify', disabled: true, posicion: 9 },
  ];
  categories: any[] = [
    { name: 'Minería Mediana', key: 1 },
    { name: 'Minería Chica', key: 2 },
    { name: 'Comercializadora de Minerales', key: 3 },
    { name: 'Otro', key: 4 }
  ];
  gastos: any[] = [
    { name: 'MINERAL', key: 1 },
    { name: 'METAL', key: 2 },
    { name: 'COMPLEJO', key: 3 }
  ];
  tabla: any[] = [
    { name: '1. Flete', titulo: 'flete', key: 1 },
    { name: '2. Seguro', titulo: 'seguro', key: 2 },
    { name: '3. Embarque en puerto y destino', titulo: 'enbarque', key: 3 },
    { name: '4. Pesaje, muestreo y ensayo', titulo: 'pesaje', key: 4 },
    { name: '5. Fundición', titulo: 'fundicion', key: 5 },
    { name: '6. Refinación', titulo: 'refinacion', key: 6 },
    { name: '7. Castigo e impurezas', titulo: 'castigo', key: 7 },
    { name: '8. Merma', titulo: 'merma', key: 8 },
    { name: '9. Tratamiento', titulo: 'tratamiento', key: 9 },
    { name: '10. Otro (especificar)', titulo: 'otro', key: 10 },
    { name: 'A. TOTAL GASTO', titulo: 'total', key: 11 },
    { name: 'B. Valor Oficial Exportado ($us)', titulo: 'valor', key: 12 },
    { name: 'C. Calcular la Relación  A/B', titulo: 'calculo', key: 13 },
    { name: 'OBSERVACIONES POR TRIMESTRE:', titulo: 'observacion_trimestre', key: 14 },
    { name: 'OBSERVACIONES GENERALES:', titulo: 'observacion_general', key: 15 }
  ];
  incidencias: any[] = [
    { name: 'INFORMACIÓN COMPLETA', key: 1 },
    { name: 'PARCIALES', key: 2 },
    { name: 'CERRADO TEMPORAL ', key: 3 },
    { name: 'CERRADO DEFINITIVO', key: 4 },
    { name: 'RECHAZO', key: 5 },
    { name: 'SIN MOVIMIENTO', key: 6 },
    { name: 'CAMBIO DE ACTIVIDAD ', key: 7 },
    { name: 'FUSIONADA', key: 8 },
    { name: 'PENDIENTE', key: 9 },
    { name: 'NO UBICADO ', key: 10 }
  ];
  incidencia: any;
  sw=0;
  dw=0;
  informante: string='';
  cargo: string='';
  currentYear: number=0;
  idDirectorio: number=0;
  constructor(private _service:CodificacionService,private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this._service.datoEmpresa(this.activatedRoute.snapshot.params.nit).subscribe((resp: any)=>{
      this.registro=resp[0];
      this.registro.tipo_sector = JSON.parse(this.registro.tipo_sector)
      if (this.registro.tipo_sector==null) {
        this.sw=0;
      } else {
        const valor = this.registro.tipo_sector.find((res: any)=>res.name=='Otro');
        if (valor!=undefined){
          this.sw=1;
        } else {
          this.sw=0;
        }
      }
      this.idDirectorio=resp[0].id_directorio;
      this._service.datoGastos(this.idDirectorio,this.currentYear).subscribe((resp: any)=>{
        if(resp.length>0){
          this.informante=resp[0].informante;
          this.cargo=resp[0].cargo;
          this.gastosFinal=resp[0].datos;
          for (const key in this.gastosFinal) {
             this.justifyOptions[key].disabled = false;
          }
          this.justifyOptions = [...this.justifyOptions];
        }
      })
    });
  }
  
  onOptionClick(e: any){
    const id = e.value.posicion;
    this.gastosUn = this.gastosFinal[id];
    this.dw=1;
  }

  finalizar(){
    
  }
}
