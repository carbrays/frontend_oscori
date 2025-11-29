import { Component, OnInit } from '@angular/core';
import { VehiculosService } from 'src/app/services/vehiculos/vehiculos.service';
import Swal from 'sweetalert2';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  popupMantenimiento = false;
  popupReparacion = false;
  popupRevision = false;
  popupDetalles = false;
  popupDetalle = false;

  mantenimientos: any[] = [];
  reparaciones: any[] = [];
  revisiones: any[] = [];

  mantenimientoSeleccionado: any = {};
  reparacionSeleccionada: any = {};
  revisionSeleccionada: any = {};

  detallesMantenimiento: any[] = [];
  detalleSeleccionado: any = {};

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

  tituloDialogPDF: string = '';
  mostrarDialogPDF: boolean = false;

  pdfs: any[] = [];

  carpetaSeleccionada: string = '';
  idSeleccionado: number = 0;
  tipoSeleccionado: string = '';

  mostrarPDF = false;
  mostrarImagen: boolean = false;

  pdfSeleccionadoURL: string = '';
  imagenSeleccionadaURL: string = '';

  fechaSeleccionada: Date = new Date();
  viajes: {
    id_distancia: number,
    consignatario: string,
    ciudad_origen: string,
    ciudad_destino: string,
    fecha_llegada: Date,
    fecha_carga: Date,
    km_central_origen: number,
    km_origen_destino: number,
    km_destino_central: number,
    km_total: number
  }[] = [];

  totalViajes: number = 0;
  viajesArica: number = 0;
  viajesIquique: number = 0;
  kmTotal: number = 0;
  kmArica: number = 0;
  kmIquique: number = 0;

  viajes_Arica: any[] = [];
  viajes_Iquique: any[] = [];

  viajesDialog: boolean = false;
  viajesSeleccionados: any[] = [];
  tituloViajesDialog: string = '';

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
    this.fechaSeleccionada = new Date("2025-01-01");
    this.buscar();
    this.verVehiculos = false;
    this.verOpciones = true;
  }

  onCardClick(opcion: any) {
    console.log('Card seleccionada:', opcion.titulo);
    switch (opcion.titulo) {
      case 'MANTENIMIENTO':
        this.obtenerMantenimientos();
        break;
      case 'REPARACIÓN':
        this.obtenerReparaciones();
        break;
      case 'REVISIÓN':
        this.obtenerRevisiones();
        break;
      default:
        console.warn('Opción no reconocida:', opcion.titulo);
    }
    this.verOpciones = false;
  }

  obtenerMantenimientos(): void {
    console.log('Vehículo seleccionado para mantenimientos:', this.vehiculoSeleccionado);
    this.vehiculoService.getMantenimientos(this.vehiculoSeleccionado.id_vehiculo).subscribe({
      next: (data) => {
        this.mantenimientos = data;
        console.log('Mantenimientos obtenidos:', this.mantenimientos);
        this.verOpciones = false;
        this.verMantenimientos = true;
      },
      error: (err) => {
        console.error('Error al obtener mantenimientos', err);
        Swal.fire('Error', 'No se pudieron cargar los mantenimientos', 'error');
      }
    });
  }

  abrirNuevoMantenimiento(): void {
    this.mantenimientoSeleccionado = {
      id_mantenimiento: null,
      id_vehiculo: this.vehiculoSeleccionado.id_vehiculo,
      tipo: '',
      fecha: new Date(), // Fecha actual por defecto
      lugar: '',
      costo: 0,
      km: null,
      fecha_siguiente: null,
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date(),
      usumod: null,
      fecmod: null
    };
    this.popupMantenimiento = true;
  }

  guardarMantenimiento() {
    if (this.mantenimientoSeleccionado.id_mantenimiento) {
      // Editar mantenimiento existente
      this.vehiculoService.editarMantenimiento(this.mantenimientoSeleccionado).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Mantenimiento actualizado correctamente', 'success');
          this.popupMantenimiento = false;
          this.obtenerMantenimientos();
        },
        error: (err) => {
          console.error('Error al actualizar mantenimiento', err);
          Swal.fire('Error', 'No se pudo actualizar el mantenimiento', 'error');
        }
      });
    } else {
      // Crear nuevo mantenimiento
      this.vehiculoService.insertarMantenimiento(this.mantenimientoSeleccionado).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Mantenimiento creado correctamente', 'success');
          this.popupMantenimiento = false;
          this.obtenerMantenimientos();
        },
        error: (err) => {
          console.error('Error al crear mantenimiento', err);
          Swal.fire('Error', 'No se pudo crear el mantenimiento', 'error');
        }
      });
    }
  }

  editarMantenimiento(mantenimiento: any): void {
    this.mantenimientoSeleccionado = { ...mantenimiento, fecha_llegada: mantenimiento.fecha_llegada ? new Date(mantenimiento.fecha_llegada) : null, fecha_siguiente: mantenimiento.fecha_siguiente ? new Date(mantenimiento.fecha_siguiente) : null };
    this.popupMantenimiento = true;
  }

  eliminarMantenimiento(mantenimiento: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminar mantenimiento: ${mantenimiento.tipo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculoService.eliminarMantenimiento(mantenimiento.id_mantenimiento).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El mantenimiento ha sido eliminado.', 'success');
            this.obtenerMantenimientos();
          },
          error: (err) => {
            console.error('Error al eliminar mantenimiento', err);
            Swal.fire('Error', 'No se pudo eliminar el mantenimiento', 'error');
          }
        });
      }
    });
  }

  obtenerDetallesMantenimientos(mantenimiento: any): void {
    this.vehiculoService.getDetallesMantenimientos(mantenimiento.id_mantenimiento).subscribe({
      next: (data) => {
        this.mantenimientoSeleccionado = { ...mantenimiento };
        this.detallesMantenimiento = data;
        this.popupDetalles = true;
      },
      error: (err) => {
        console.error('Error al obtener detalles de mantenimientos', err);
        Swal.fire('Error', 'No se pudieron cargar los detalles del mantenimiento', 'error');
      }
    });
  }

  abrirNuevoDetalleMantenimiento(): void {
    this.detalleSeleccionado = {
      id_detalle: null,
      id_mantenimiento: this.mantenimientoSeleccionado?.id_mantenimiento, // 👈 se asocia al mantenimiento actual
      pieza: '',
      descripcion: '',
      tipo: '',
      cantidad: 0,
      unidad: '',
      costo: 0,
      fecha_siguiente: null,
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date(),
      usumod: null,
      fecmod: null
    };
    this.popupDetalle = true; // 👈 popup específico para detalles
  }

  guardarDetalleMantenimiento() {
    console.log('Guardando detalle de mantenimiento:', this.detalleSeleccionado);
    if (this.detalleSeleccionado.id_detalle) {
      // Editar detalle de mantenimiento existente
      this.vehiculoService.editarDetalleMantenimiento(this.detalleSeleccionado).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Detalle de mantenimiento actualizado correctamente', 'success');
          this.popupDetalle = false;
          this.obtenerDetallesMantenimientos(this.mantenimientoSeleccionado.id_mantenimiento);
        },
        error: (err) => {
          console.error('Error al actualizar detalle de mantenimiento', err);
          Swal.fire('Error', 'No se pudo actualizar el detalle del mantenimiento', 'error');
        }
      });
    } else {
      // Crear nuevo detalle de mantenimiento
      this.vehiculoService.insertarDetalleMantenimiento(this.detalleSeleccionado).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Detalle de mantenimiento creado correctamente', 'success');
          this.popupDetalle = false;
          this.obtenerDetallesMantenimientos(this.mantenimientoSeleccionado.id_mantenimiento);
        },
        error: (err) => {
          console.error('Error al crear detalle de mantenimiento', err);
          Swal.fire('Error', 'No se pudo crear el detalle del mantenimiento', 'error');
        }
      });
    }
  }

  editarDetalleMantenimiento(detalle: any): void {
    this.detalleSeleccionado = { ...detalle, fecha_siguiente: detalle.fecha_siguiente ? new Date(detalle.fecha_siguiente) : null };
    this.popupDetalle = true;
  }

  eliminarDetalleMantenimiento(detalle: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminar detalle de mantenimiento: ${detalle.tipo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculoService.eliminarDetalleMantenimiento(detalle.id_mantenimiento).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El detalle de mantenimiento ha sido eliminado.', 'success');
            this.obtenerMantenimientos();
          },
          error: (err) => {
            console.error('Error al eliminar detalle de mantenimiento', err);
            Swal.fire('Error', 'No se pudo eliminar el detalle del mantenimiento', 'error');
          }
        });
      }
    });
  }

  obtenerReparaciones(): void {
    this.vehiculoService.getReparaciones(this.vehiculoSeleccionado.id_vehiculo).subscribe({
      next: (data) => {
        this.reparaciones = data;
        this.verOpciones = false;
        this.verReparaciones = true;
      },
      error: (err) => {
        console.error('Error al obtener reparaciones', err);
        Swal.fire('Error', 'No se pudieron cargar las reparaciones', 'error');
      }
    });
  }

  abrirNuevaReparacion(): void {
    this.reparacionSeleccionada = {
      id_reparacion: null,
      id_vehiculo: this.vehiculoSeleccionado.id_vehiculo,
      pieza: '',
      descripcion: '',
      tipo: '',
      fecha: new Date(),
      lugar: '',
      costo: null,
      km: null,
      fec_siguiente: null,
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date()
    };
    this.popupReparacion = true;
  }

  guardarReparacion() {
    if (this.reparacionSeleccionada.id_reparacion) {
      // Editar reparación existente
      this.vehiculoService.editarReparacion(this.reparacionSeleccionada).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Reparación actualizada correctamente', 'success');
          this.popupReparacion = false;
          this.obtenerReparaciones();
        },
        error: (err) => {
          console.error('Error al actualizar reparación', err);
          Swal.fire('Error', 'No se pudo actualizar la reparación', 'error');
        }
      });
    } else {
      // Crear nueva reparación
      this.vehiculoService.insertarReparacion(this.reparacionSeleccionada).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Reparación creada correctamente', 'success');
          this.popupReparacion = false;
          this.obtenerReparaciones();
        },
        error: (err) => {
          console.error('Error al crear reparación', err);
          Swal.fire('Error', 'No se pudo crear la reparación', 'error');
        }
      });
    }
  }

  editarReparacion(reparacion: any): void {
    this.reparacionSeleccionada = { ...reparacion, fecha: reparacion.fecha ? new Date(reparacion.fecha) : null };
    this.popupReparacion = true;
  }
  eliminarReparacion(reparacion: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminar reparación: ${reparacion.tipo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculoService.eliminarReparacion(reparacion.id_reparacion).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La reparación ha sido eliminada.', 'success');
            this.obtenerReparaciones();
          },
          error: (err) => {
            console.error('Error al eliminar reparación', err);
            Swal.fire('Error', 'No se pudo eliminar la reparación', 'error');
          }
        });
      }
    });
  }

  obtenerRevisiones(): void {
    this.vehiculoService.getRevisiones(this.vehiculoSeleccionado.id_vehiculo).subscribe({
      next: (data) => {
        this.revisiones = data;
        this.verOpciones = false;
        this.verRevisiones = true;
      },
      error: (err) => {
        console.error('Error al obtener revisiones', err);
        Swal.fire('Error', 'No se pudieron cargar las revisiones', 'error');
      }
    });
  }

  abrirNuevaRevision(): void {
    this.revisionSeleccionada = {
      id_revision: null,
      id_vehiculo: this.vehiculoSeleccionado.id_vehiculo,
      tipo: '',
      pieza: '',
      fecha: new Date(),
      accion: '',
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date()
    };
    this.popupRevision = true;
  }

  guardarRevision() {
    if (this.revisionSeleccionada.id_revision) {
      // Editar revisión existente
      this.vehiculoService.editarRevision(this.revisionSeleccionada).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Revisión actualizada correctamente', 'success');
          this.popupRevision = false;
          this.obtenerRevisiones();
        },
        error: (err) => {
          console.error('Error al actualizar revisión', err);
          Swal.fire('Error', 'No se pudo actualizar la revisión', 'error');
        }
      });
    } else {
      // Crear nueva revisión
      this.vehiculoService.insertarRevision(this.revisionSeleccionada).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Revisión creada correctamente', 'success');
          this.popupRevision = false;
          this.obtenerRevisiones();
        },
        error: (err) => {
          console.error('Error al crear revisión', err);
          Swal.fire('Error', 'No se pudo crear la revisión', 'error');
        }
      });
    }
  }

  editarRevision(revision: any): void {
    this.revisionSeleccionada = { ...revision, fecha: revision.fecha_llegada ? new Date(revision.fecha_llegada) : null };
    this.popupRevision = true;
  }
  eliminarRevision(revision: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminar revisión: ${revision.tipo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculoService.eliminarRevision(revision.id_revision).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La revisión ha sido eliminada.', 'success');
            this.obtenerRevisiones();
          },
          error: (err) => {
            console.error('Error al eliminar revisión', err);
            Swal.fire('Error', 'No se pudo eliminar la revisión', 'error');
          }
        });
      }
    });
  }

  abrirSelectorArchivo(carpeta: string, id: any, tipo: any) {

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';

    input.onchange = (event: any) => {
      this.onFileSelected(event, carpeta, id, tipo);
    };

    input.click();
  }

  onFileSelected(event: Event, carpeta: string, id: any, tipo: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // ✅ Validación: solo PDFs o imágenes
    if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      Swal.fire('Error', 'Tipo de archivo no permitido. Solo se permiten PDFs e imágenes.', 'error');
      input.value = '';
      return;
    }

    // 🔹 Detectar extensión original
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // 🔹 Pedir al usuario un nuevo nombre antes de confirmar
    Swal.fire({
      title: 'Renombrar archivo',
      input: 'text',
      inputLabel: `Escribe el nuevo nombre para el archivo (sin .${extension})`,
      inputValue: file.name.replace(`.${extension}`, ''), // quitar extensión original
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      preConfirm: (nuevoNombre) => {
        if (!nuevoNombre || nuevoNombre.trim() === '') {
          Swal.showValidationMessage('Debes ingresar un nombre válido');
        }
        return nuevoNombre.trim();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        let nuevoNombre = result.value;
        nuevoNombre = nuevoNombre.replace(/\s+/g, "_"); // reemplazar espacios

        Swal.fire({
          title: '¿Estás seguro?',
          text: `¿Deseas subir el archivo con el nombre: "${nuevoNombre}.${extension}"?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, subir',
          cancelButtonText: 'No, cancelar'
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            const formData = new FormData();

            // 🔹 Crear un nuevo File con el nombre editado y su extensión original
            const nuevoArchivo = new File(
              [file],
              `${id}-${tipo}-${nuevoNombre}.${extension}`,
              { type: file.type }
            );

            formData.append('archivo', nuevoArchivo);

            axios.post(`${URL_SERVICIOS}/vehiculo/subir_pdf/${carpeta}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
              .then(response => {
                Swal.fire('¡Subido!', 'El archivo se subió correctamente.', 'success');
                this.obtenerPdfs(carpeta, id, tipo);
                switch (carpeta) {
                  case 'mantenimiento':
                    this.obtenerMantenimientos();
                    break;
                  case 'reparacion':
                    this.obtenerReparaciones();
                    break;
                  case 'revision':
                    this.obtenerRevisiones();
                    break;
                }
              })
              .catch(error => {
                console.error('Error al subir el archivo', error);
                Swal.fire('Error', 'Error al subir el archivo. Intenta nuevamente.', 'error');
              });
          } else {
            input.value = '';
          }
        });
      } else {
        input.value = '';
      }
    });
  }

  obtenerPdfs(carpeta: string, id: number, tipo: string): void {
    this.vehiculoService.getPdfs(carpeta, id, tipo).subscribe({
      next: data => {
        this.pdfs = data;
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de PDFs.', 'error')
    });
  }

  verPdfs(carpeta: string, id: number, tipo: string) {
    this.idSeleccionado = id;
    this.tipoSeleccionado = tipo;
    this.carpetaSeleccionada = carpeta;
    this.tituloDialogPDF = carpeta.toUpperCase() + ' - ' + tipo.toUpperCase();
    this.mostrarDialogPDF = true;
    this.obtenerPdfs(carpeta, id, tipo);
  }

  eliminarPDF(carpeta: string, pdf: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el archivo "${pdf}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((confirmResult) => {
      if (confirmResult.isConfirmed) {
        this.vehiculoService.deleteFile(carpeta, pdf).subscribe({
          next: (res) => {
            console.log(res);
            Swal.fire(
              'Eliminado',
              'El archivo se eliminó correctamente.',
              'success'
            );
            this.obtenerPdfs(carpeta, this.idSeleccionado, this.tipoSeleccionado);
            switch (carpeta) {
              case 'mantenimiento':
                this.obtenerMantenimientos();
                break;
              case 'reparacion':
                this.obtenerReparaciones();
                break;
              case 'revision':
                this.obtenerRevisiones();
                break;
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Error al eliminar archivo.', 'error');
          }
        });
      }
    });
  }

  verPDF(carpeta: string, nombre: any) {
    const url = `${URL_SERVICIOS}/vehiculo/verPdf/${carpeta}/${nombre}`;

    const extension = nombre.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      this.pdfSeleccionadoURL = url;
      this.mostrarPDF = true;
    } else {
      this.imagenSeleccionadaURL = url;
      this.mostrarImagen = true;
    }

  }

  buscar(): void {
    console.log(this.vehiculoSeleccionado.id_vehiculo, ' Fecha seleccionada:', this.fechaSeleccionada);
    const fecha = this.formatFecha(this.fechaSeleccionada);

    this.vehiculoService.getViajes(this.vehiculoSeleccionado.id_vehiculo, fecha).subscribe({
      next: (data) => {
        console.log('Viajes obtenidos:', data);
        this.viajes = data.map((viaje) => ({
          id_distancia: viaje.id_distancia,
          consignatario: viaje.consignatario,
          ciudad_origen: viaje.ciudad_origen,
          ciudad_destino: viaje.ciudad_destino,
          fecha_llegada: viaje.fecha_llegada,
          fecha_carga: viaje.fecha_carga,
          km_central_origen: viaje.km_central_origen,
          km_origen_destino: viaje.km_origen_destino,
          km_destino_central: viaje.km_destino_central,
          km_total: viaje.km_total
        }));
        this.totalViajes = this.viajes.length;

        this.viajesArica = this.viajes.filter(v => v.ciudad_origen === 'ARICA').length;
        this.viajesIquique = this.viajes.filter(v => v.ciudad_origen === 'IQUIQUE').length;

        this.kmTotal = Number(
          this.viajes.reduce((sum, v) => sum + Number(v.km_total), 0).toFixed(2)
        );

        this.kmArica = Number(
          this.viajes
            .filter(v => v.ciudad_origen === 'ARICA')
            .reduce((sum, v) => sum + Number(v.km_total), 0)
            .toFixed(2)
        );

        this.kmIquique = Number(
          this.viajes
            .filter(v => v.ciudad_origen === 'IQUIQUE')
            .reduce((sum, v) => sum + Number(v.km_total), 0)
            .toFixed(2)
        );

        this.viajes_Arica = this.viajes.filter(v => v.ciudad_origen === 'ARICA');
        this.viajes_Iquique = this.viajes.filter(v => v.ciudad_origen === 'IQUIQUE');
      },
      error: (err) => {
        console.error('Error al obtener viajes', err);
        Swal.fire('Error', 'No se pudieron cargar los viajes', 'error');
      }
    });
  }

  abrirViajes(ciudad: string): void {
    this.viajesDialog = true;
    switch (ciudad) {
      case 'ARICA':
        this.tituloViajesDialog = 'Viajes ARICA';
        this.viajesSeleccionados = this.viajes_Arica;
        console.log('Viajes desde ARICA:', this.viajes_Arica);
        break;
      case 'IQUIQUE':
        this.tituloViajesDialog = 'Viajes IQUIQUE';
        this.viajesSeleccionados = this.viajes_Iquique;
        console.log('Viajes desde IQUIQUE:', this.viajes_Iquique);
        break;
      default:
        this.tituloViajesDialog = 'Viajes';
        this.viajesSeleccionados = this.viajes;
        console.warn('Ciudad no reconocida:', ciudad);
    }
  }

  formatFecha(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatFecha2(fecha: any): string {
    if (!fecha) return '';

    const d = new Date(fecha);

    if (isNaN(d.getTime())) return ''; // Por si es inválida

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  exportarExcel() {
    if (!this.viajesSeleccionados || this.viajesSeleccionados.length === 0) {
      return;
    }

    // Prepara datos para el Excel
    const datos = this.viajesSeleccionados.map((v, index) => ({
      '#': index + 1,
      'Consignatario': v.consignatario,
      'Ciudad Origen': v.ciudad_origen,
      'Ciudad Destino': v.ciudad_destino,
      'Fecha Carga': this.formatFecha2(v.fecha_carga),
      'Fecha Llegada': this.formatFecha2(v.fecha_llegada),
      'KM Central - Origen': v.km_central_origen,
      'KM Origen - Destino': v.km_origen_destino,
      'KM Destino - Central': v.km_destino_central,
      'KM Total': v.km_total
    }));

    // Crear hoja
    const worksheet = XLSX.utils.json_to_sheet(datos);

    // Crear libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Viajes');

    // Nombre del archivo
    const fecha = this.formatFecha(this.fechaSeleccionada) ?? 'sin_fecha';
    const titulo = this.tituloViajesDialog ?? 'viajes';
    const placa = this.vehiculoSeleccionado?.placa ?? 'vehiculo';
    const nombreArchivo = `${placa}_${titulo}_${fecha}.xlsx`;

    // Guardar
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, nombreArchivo);
  }
}

