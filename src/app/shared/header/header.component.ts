
import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/service.index';
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import Swal from 'sweetalert2';
//am4core.useTheme(am4themes_dark);
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    chartTheme:any;
    public usuario!: Usuario;
    color: string='light';
    header: string='lg';
    theme!:string;
    

    constructor( @Inject(DOCUMENT) private _document:any, public usuarioService: UsuarioService) {
      this.usuario = usuarioService.usuario;
    }

  ngOnInit(): void {
    this.session()
  }

  session(){
    let sessionTimer = setTimeout(()=> {
      Swal.fire({

        text: 'Su sesión acabar de expirar!. Vuelva a ingresar al sistema para continuar.',
        icon: 'warning',
        confirmButtonColor: '#D63330',
        confirmButtonText: 'Aceptar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.logout();
        } 
      });  
    }, 15500000
    );
  }

  themeColor(){
    this.color=== 'light' ? this.color='dark' : this.color='light';
    //if(this.color=== 'light') {  this.chartTheme=am4core.useTheme(am4themes_dark); this.chart.dispose();} else {this.chartTheme=``; this.chart.dispose();};
    this.color=== 'light' ? this.theme='assets/theme/lara-light-blue/theme.css' : this.theme='assets/theme/bootstrap4-dark-blue/theme.css';
    this._document.getElementById('webPage').setAttribute('data-bs-theme',this.color);
    this._document.getElementById('theme-css').setAttribute('href',this.theme);
  }

  headerSize(){
    //ref.classList.remove('working') en for
    //link.classList.add('working')
    this.header=== 'lg' ? this.header='sm' : this.header='lg';
    this._document.getElementById('webPage').setAttribute('data-sidebar-size',this.header);
  }


  logout() {
    this.usuarioService.logout();
  }

}
