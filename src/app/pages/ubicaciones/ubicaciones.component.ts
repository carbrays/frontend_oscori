import { Component, OnInit } from '@angular/core';
import { VehiculosService } from 'src/app/services/vehiculos/vehiculos.service';
import Swal from 'sweetalert2';

import * as L from 'leaflet';
import { UbicacionesService } from 'src/app/services/ubicaciones/ubicaciones.service';

interface Punto {
  lat: number;
  lng: number;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.css']
})
export class UbicacionesComponent implements OnInit {

  vehiculos: any[] = [];
  vehiculoSeleccionado: any = {};

  ubicaciones: any[] = [];

  map!: L.Map;
  agregarPuntoActivo = false;
  mostrarFormulario = false;
  puntoTemp: Punto = { lat: 0, lng: 0, titulo: '', descripcion: '' };
  puntos: Punto[] = [];

  constructor(private ubicacionesService: UbicacionesService) { }

  ngOnInit(): void {
    this.obtenerListado();
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map').setView([ -16.5, -68.1 ], 5); // Bolivia por defecto

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.agregarPuntoActivo) {
        this.puntoTemp.lat = e.latlng.lat;
        this.puntoTemp.lng = e.latlng.lng;
        this.mostrarFormulario = true;
      }
    });

    // Renderizar puntos existentes (si hay)
    this.renderPuntos();
  }

  obtenerListado(): void {
      this.ubicacionesService.getVehiculosPropios().subscribe({
        next: (data) => this.vehiculos = data,
        error: (err) => {
          console.error('Error al obtener vehículos', err);
          Swal.fire('Error', 'No se pudieron cargar los vehículos', 'error');
        }
      });
    }

    seleccionarVehiculo(vehiculo: any): void {
    this.vehiculoSeleccionado = { ...vehiculo };
    this.obtenerUbicacionesVehiculo(vehiculo.id_vehiculo);
  }

  obtenerUbicacionesVehiculo(id: number): void {
      this.ubicacionesService.getUbicacionesVehiculo(id).subscribe({
        next: (data) => {this.ubicaciones = data
          const latlngs = data.map(p => [p.latitud, p.longitud]);

        // Dibujar puntos (marcadores)
        latlngs.forEach(([lat, lng]) => {
          L.marker([lat, lng]).addTo(this.map);
        });

        // Dibujar polilínea
        L.polyline(latlngs, { color: 'blue' }).addTo(this.map);

        // Centrar el mapa en la polilínea
        this.map.fitBounds(latlngs as any);
        }
        ,
        error: (err) => {
          console.error('Error al obtener ubicaciones', err);
          Swal.fire('Error', 'No se pudieron cargar las ubicaciones', 'error');
        }
      });
    }

  activarAgregarPunto(): void {
    this.agregarPuntoActivo = true;
    alert('Haga clic en el mapa para agregar un punto.');
  }

  guardarPunto(): void {
    this.puntos.push({ ...this.puntoTemp });
    this.renderPunto(this.puntoTemp);
    this.puntoTemp = { lat: 0, lng: 0, titulo: '', descripcion: '' };
    this.mostrarFormulario = false;
    this.agregarPuntoActivo = false;
  }

  cancelarPunto(): void {
    this.puntoTemp = { lat: 0, lng: 0, titulo: '', descripcion: '' };
    this.mostrarFormulario = false;
    this.agregarPuntoActivo = false;
  }

  renderPuntos(): void {
    this.puntos.forEach(p => this.renderPunto(p));
  }

  renderPunto(punto: Punto): void {
    const marker = L.marker([punto.lat, punto.lng]).addTo(this.map);
    marker.bindPopup(`<b>${punto.titulo}</b><br>${punto.descripcion}`);
  }
}

