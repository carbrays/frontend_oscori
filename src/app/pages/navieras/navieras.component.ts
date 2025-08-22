import { Component, OnInit } from '@angular/core';
import { NavierasService } from 'src/app/services/navieras/navieras.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navieras',
  templateUrl: './navieras.component.html',
  styleUrls: ['./navieras.component.css']
})
export class NavierasComponent implements OnInit {

  navieras: any[] = [];
  navieraSeleccionada: any = {};
  popupVisible = false;
  modoEdicion = false;
  tituloPopup = 'Naviera';

  constructor(private navieraService: NavierasService) {}

  ngOnInit(): void {
    this.obtenerListado();
  }

  obtenerListado(): void {
    this.navieraService.getNavieras().subscribe({
      next: (data) => this.navieras = data,
      error: (err) => {
        console.error('Error al obtener navieras', err);
        Swal.fire('Error', 'No se pudieron cargar las navieras', 'error');
      }
    });
  }

  abrirNuevaNaviera(): void {
    this.navieraSeleccionada = {
  nombre_comercial: '',
  razon_social: '',
  pais_origen: '',
  sitio_web: '',
  telefono_contacto: '',
  correo_contacto: '',
  direccion: '',
  representante: '',
  observaciones: '',
  dias: null,
  usucre: localStorage.getItem('login') || 'admin',
  feccre: new Date()
};

    this.tituloPopup = 'Nueva Naviera';
    this.popupVisible = true;
    this.modoEdicion = false;
  }

  editarNaviera(naviera: any): void {
    this.navieraSeleccionada = { ...naviera };
    this.tituloPopup = 'Editar Naviera';
    this.popupVisible = true;
    this.modoEdicion = true;
  }

  guardarCambios(): void {
    if (this.modoEdicion) {
      this.navieraSeleccionada.usumod = localStorage.getItem('login');
      this.navieraSeleccionada.fecmod = new Date();
      this.navieraService.editarNaviera(this.navieraSeleccionada.id_naviera, this.navieraSeleccionada).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Actualizado', 'Naviera actualizada correctamente', 'success');
        },
        error: err => {
          console.error('Error al actualizar naviera:', err);
          Swal.fire('Error', 'No se pudo actualizar.', 'error');
        }
      });
    } else {
      this.navieraService.insertarNaviera(this.navieraSeleccionada).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Guardado', 'Naviera insertada correctamente', 'success');
        },
        error: err => {
          console.error('Error al insertar naviera:', err);
          Swal.fire('Error', 'No se pudo insertar la naviera.', 'error');
        }
      });
    }
  }
  estaDisponible(naviera: any): string {
    console.log('Naviera:', naviera.despachos_en_proceso);
  return naviera.despachos_en_proceso === 'LIBRE' ? 'fila-libre' : '';
}
}

