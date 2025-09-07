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

  filtroPlaca: string = '';
  filtroMarca: string = '';
  filtroModelo: string = '';
  filtroFabricacion: string = '';
  filtroTipo: string = '';
  filtroColor: string = '';
  filtroChasis: string = '';
  filtroMotor: string = '';
  filtroCarga: string = '';
  filtroVolumen: string = '';
  filtroCombustible: string = '';
  filtroKilometraje: string = '';
  filtroEstado: string = '';

  constructor(private vehiculoService: VehiculosService) { }

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

  get vehiculosFiltrados() {
    return this.vehiculos.filter(v => {
      const placaStr = v.placa?.toString().toLowerCase() || '';
      const marcaStr = v.marca?.toString().toLowerCase() || '';
      const modeloStr = v.modelo?.toString().toLowerCase() || '';
      const fabricacionStr = v.fabricacion?.toString().toLowerCase() || '';
      const tipoStr = v.tipo_vehiculo?.toString().toLowerCase() || '';
      const colorStr = v.color?.toString().toLowerCase() || '';
      const chasisStr = v.nro_chasis?.toString().toLowerCase() || '';
      const motorStr = v.nro_motor?.toString().toLowerCase() || '';
      const cargaStr = v.capacidad_carga_kg?.toString().toLowerCase() || '';
      const volumenStr = v.volumen_carga_m3?.toString().toLowerCase() || '';
      const combustibleStr = v.tipo_combustible?.toString().toLowerCase() || '';
      const kmStr = v.kilometraje?.toString().toLowerCase() || '';
      const estadoStr = v.despachos_en_proceso?.toString().toLowerCase() || '';

      return (
        placaStr.includes(this.filtroPlaca.toLowerCase()) &&
        marcaStr.includes(this.filtroMarca.toLowerCase()) &&
        modeloStr.includes(this.filtroModelo.toLowerCase()) &&
        fabricacionStr.includes(this.filtroFabricacion.toLowerCase()) &&
        tipoStr.includes(this.filtroTipo.toLowerCase()) &&
        colorStr.includes(this.filtroColor.toLowerCase()) &&
        chasisStr.includes(this.filtroChasis.toLowerCase()) &&
        motorStr.includes(this.filtroMotor.toLowerCase()) &&
        cargaStr.includes(this.filtroCarga.toLowerCase()) &&
        volumenStr.includes(this.filtroVolumen.toLowerCase()) &&
        combustibleStr.includes(this.filtroCombustible.toLowerCase()) &&
        kmStr.includes(this.filtroKilometraje.toLowerCase()) &&
        estadoStr.includes(this.filtroEstado.toLowerCase())
      );
    });
  }

  limpiarFiltros() {
    this.filtroPlaca = '';
    this.filtroMarca = '';
    this.filtroModelo = '';
    this.filtroFabricacion = '';
    this.filtroTipo = '';
    this.filtroColor = '';
    this.filtroChasis = '';
    this.filtroMotor = '';
    this.filtroCarga = '';
    this.filtroVolumen = '';
    this.filtroCombustible = '';
    this.filtroKilometraje = '';
    this.filtroEstado = '';
  }
}

