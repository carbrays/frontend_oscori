import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  menu:any =[
    /* {
      titulo: 'Dashboard',
      icono:'ri-dashboard-2-line',
      submenu: [
        { titulo: 'Dashboard', url: '/dashboard'},
        { titulo: 'Progress', url: '/progress'},
      ]
    } */
  ];
  

  cargarMenu(){
    const dato = localStorage.getItem('menu');
    //Solo entra si no es nulo. 
    if(dato) this.menu=JSON.parse(dato) || [];
    //ejemplo de resolución.
    //else mostrarMensajeService.mostrarError()
  }
}
