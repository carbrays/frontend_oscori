import { Component, OnInit } from '@angular/core';
import { VehiculosService } from 'src/app/services/vehiculos/vehiculos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos-seguimiento',
  templateUrl: './vehiculos_seguimiento.component.html',
  styleUrls: ['./vehiculos_seguimiento.component.css']
})
export class VehiculosSeguimientoComponent implements OnInit {

  vehiculos: any[] = [];
  vehiculoSeleccionado: any = {};
  verVehiculos = true;
  verOpciones = false;
  verMantenimientos = false;
  verReparaciones = false;
  verRevisiones = false;

  opciones = [
    {
      titulo: 'MANTENIMIENTO',
      icono: 'bi bi-gear-fill',
      color: '#007bff'
    },
    {
      titulo: 'REPARACIÓN',
      icono: 'bi bi-tools',
      color: '#28a745'
    },
    {
      titulo: 'REVISIÓN',
      icono: 'bi bi-clipboard-check-fill',
      color: '#ffc107'
    }
  ];

  constructor(private vehiculoService: VehiculosService) { }

  ngOnInit(): void {
    this.obtenerListado();
  }

  obtenerListado(): void {
    this.vehiculoService.getVehiculosPropios().subscribe({
      next: (data) => this.vehiculos = data,
      error: (err) => {
        console.error('Error al obtener vehículos', err);
        Swal.fire('Error', 'No se pudieron cargar los vehículos', 'error');
      }
    });
  }

  seleccionarVehiculo(vehiculo: any): void {
    this.vehiculoSeleccionado = { ...vehiculo };
    this.verVehiculos = false;
    this.verOpciones = true;
  }

  onCardClick(opcion: any) {
    console.log('Card seleccionada:', opcion.titulo);
    // Aquí puedes navegar con routerLink o ejecutar otra acción
  }

  
}

