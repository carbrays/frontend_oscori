import { Component, OnInit } from '@angular/core';
import { VehiculosService } from 'src/app/services/vehiculos/vehiculos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {

  vehiculos: any[] = [];
  vehiculoSeleccionado: any = {};
  popupVisible = false;
  modoEdicion = false;
  tituloPopup = 'Vehículo';

  estados = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Anulado', value: 'ANULADO' }
  ];

  constructor(private vehiculoService: VehiculosService) {}

  ngOnInit(): void {
    this.obtenerListado();
  }

  obtenerListado(): void {
    this.vehiculoService.getVehiculos().subscribe({
      next: (data) => this.vehiculos = data,
      error: (err) => {
        console.error('Error al obtener vehículos', err);
        Swal.fire('Error', 'No se pudieron cargar los vehículos', 'error');
      }
    });
  }

  abrirNuevoVehiculo(): void {
    this.vehiculoSeleccionado = {
      placa: '',
      marca: '',
      modelo: '',
      fabricacion: '',
      tipo_vehiculo: '',
      color: '',
      nro_chasis: '',
      nro_motor: '',
      capacidad_carga_kg: null,
      volumen_carga_m3: null,
      tipo_combustible: '',
      kilometraje: null,
      foto: '',
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date()
    };
    this.tituloPopup = 'Nuevo Vehículo';
    this.popupVisible = true;
    this.modoEdicion = false;
  }

  editarVehiculo(vehiculo: any): void {
    this.vehiculoSeleccionado = { ...vehiculo };
    this.tituloPopup = 'Editar Vehículo';
    this.popupVisible = true;
    this.modoEdicion = true;
  }

  eliminarVehiculo(vehiculo: any): void {
    Swal.fire({
      title: `¿Eliminar el vehículo con placa "${vehiculo.placa}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.vehiculoService.eliminarVehiculo(vehiculo.id_vehiculo).subscribe({
          next: () => {
            this.vehiculos = this.vehiculos.filter(v => v.id_vehiculo !== vehiculo.id_vehiculo);
            Swal.fire('Eliminado', 'Vehículo eliminado correctamente.', 'success');
          },
          error: err => {
            console.error('Error al eliminar vehículo:', err);
            Swal.fire('Error', 'No se pudo eliminar el vehículo.', 'error');
          }
        });
      }
    });
  }

  guardarCambios(): void {
    if (this.modoEdicion) {
      this.vehiculoSeleccionado.usumod = localStorage.getItem('login');
      this.vehiculoSeleccionado.fecmod = new Date();
      this.vehiculoService.editarVehiculo(this.vehiculoSeleccionado.id_vehiculo, this.vehiculoSeleccionado).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Actualizado', 'Vehículo actualizado correctamente', 'success');
        },
        error: err => {
          console.error('Error al actualizar vehículo:', err);
          Swal.fire('Error', 'No se pudo actualizar.', 'error');
        }
      });
    } else {
      this.vehiculoService.insertarVehiculo(this.vehiculoSeleccionado).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Guardado', 'Vehículo insertado correctamente', 'success');
        },
        error: err => {
          console.error('Error al insertar vehículo:', err);
          Swal.fire('Error', 'No se pudo insertar el vehículo.', 'error');
        }
      });
    }
  }
  estaDisponible(vehiculo: any): string {
    console.log('Vehículo:', vehiculo.despachos_en_proceso);
  return vehiculo.despachos_en_proceso === 'LIBRE' ? 'fila-libre' : '';
}
}

