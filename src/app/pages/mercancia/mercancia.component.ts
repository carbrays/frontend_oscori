import { Component, OnInit } from '@angular/core';
import { MercanciaService } from 'src/app/services/mercancias/mercancia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mercancia',
  templateUrl: './mercancia.component.html',
  styleUrls: ['./mercancia.component.css']
})
export class MercanciaComponent implements OnInit {

  mercancias: any[] = [];
  mercanciaSeleccionada: any = {};
  popupVisible = false;
  modoEdicion = false;
  tituloPopup = 'Mercancía';

  estados = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Anulado', value: 'ANULADO' }
  ];

  constructor(private mercanciaService: MercanciaService) {}

  ngOnInit(): void {
    this.obtenerListado();
  }

  obtenerListado(): void {
    this.mercanciaService.getMercancias().subscribe({
      next: (data) => this.mercancias = data,
      error: (err) => {
        console.error('Error al obtener mercancías', err);
        Swal.fire('Error', 'No se pudieron cargar las mercancías', 'error');
      }
    });
  }

  abrirNuevaMercancia(): void {
    this.mercanciaSeleccionada = {
      mercancia: '',
      descripcion: '',
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date()
    };
    this.tituloPopup = 'Nuevo Mercancía';
    this.popupVisible = true;
    this.modoEdicion = false;
  }

  editarMercancia(mercancia: any): void {
    this.mercanciaSeleccionada = { ...mercancia };
    this.tituloPopup = 'Editar Mercancía';
    this.popupVisible = true;
    this.modoEdicion = true;
  }

  eliminarMercancia(mercancia: any): void {
    Swal.fire({
      title: `¿Eliminar la mercancía con ID "${mercancia.id_mercancia}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.mercanciaService.eliminarMercancia(mercancia.id_mercancia).subscribe({
          next: () => {
            this.mercancias = this.mercancias.filter(m => m.id_mercancia !== mercancia.id_mercancia);
            Swal.fire('Eliminado', 'Mercancía eliminada correctamente.', 'success');
          },
          error: err => {
            console.error('Error al eliminar mercancía:', err);
            Swal.fire('Error', 'No se pudo eliminar la mercancía.', 'error');
          }
        });
      }
    });
  }

  guardarCambios(): void {
    if (this.modoEdicion) {
      this.mercanciaSeleccionada.usumod = localStorage.getItem('login');
      this.mercanciaSeleccionada.fecmod = new Date();
      this.mercanciaService.editarMercancia(this.mercanciaSeleccionada.id_mercancia, this.mercanciaSeleccionada).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Actualizado', 'Mercancía actualizada correctamente', 'success');
        },
        error: err => {
          console.error('Error al actualizar mercancía:', err);
          Swal.fire('Error', 'No se pudo actualizar.', 'error');
        }
      });
    } else {
      this.mercanciaService.insertarMercancia(this.mercanciaSeleccionada).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Guardado', 'Mercancía insertada correctamente', 'success');
        },
        error: err => {
          console.error('Error al insertar mercancía:', err);
          Swal.fire('Error', 'No se pudo insertar la mercancía.', 'error');
        }
      });
    }
  }
  estaDisponible(mercancia: any): string {
    console.log('Mercancía:', mercancia.despachos_en_proceso);
  return mercancia.despachos_en_proceso === 'LIBRE' ? 'fila-libre' : '';
}
}

