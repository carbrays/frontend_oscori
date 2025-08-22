import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../services/sidebar.service';
import { PrimeNGConfig } from 'primeng/api';

declare function init_plugins():any; //para llamar funciones externas
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  constructor(private sidebarService: SidebarService, private primengConfig: PrimeNGConfig){}

  ngOnInit(): void {
   this.primengConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['DO','LU','MA','MI','JU','VI','SA'],
      monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      today: 'Hoy',
      clear: 'Limpiar',
    }); 
   init_plugins(); 
   this.sidebarService.cargarMenu();
  }
}
