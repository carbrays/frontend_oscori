import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'moment/locale/es';
import { CodificacionService } from 'src/app/services/service.index';

@Component({
  selector: 'app-cod-asignar',
  templateUrl: './cod-asignar.component.html',
  styleUrls: ['./cod-asignar.component.css']
})
export class CodAsignarComponent {
  directorio: any;
  currentYear: number=0;
  constructor(private _service:CodificacionService, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this._service.listaDirectorio(this.currentYear).subscribe((resp: any)=>{  
      this.directorio = resp;
    });
  }


  verificar(i: number){
    
    this.router.navigate( ['/cod-seleccionar',this.directorio[i].id_directorio,this.directorio[i].nit] );
  }
  
}
