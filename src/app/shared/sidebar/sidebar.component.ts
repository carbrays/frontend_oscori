import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { UsuarioService } from 'src/app/services/service.index';
declare function init_plugins():any;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  constructor(public _sidebar: SidebarService,private usuarioService: UsuarioService){

  }

  ngOnInit(): void {
    // console.log(this._sidebar.menu[0].submenu);
    init_plugins(); 
   }

}
