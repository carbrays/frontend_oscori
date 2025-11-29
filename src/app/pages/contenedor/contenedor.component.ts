import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ContenedorService } from 'src/app/services/contenedor/contenedor.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as htmlToImage from 'html-to-image';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contenedor',
  templateUrl: './contenedor.component.html',
  styleUrls: ['./contenedor.component.css']
})

export class ContenedoresComponent implements OnInit {

  @ViewChild('reciboPreview', { static: false }) reciboPreview!: ElementRef;

  URL = URL_SERVICIOS;
  contenedores: any[] = [];
  contenedorSeleccionado: any = {};
  popupVisible = false;
  modoEdicion = false;
  mostrarGastos = false;
  mostrarImagen = false;
  mostrarDevolucion = false;
  mostrarDialogVariosPDF = false;
  mostrarDialogPDF = false;

  tituloMostrarGastos = '';
  tituloPopup = 'Contenedor';

  ciudades: { label: string; value: number }[] = [];
  navieras: { label: string; value: number }[] = [];
  mercancias: { label: string; value: number }[] = [];
  clientes: { label: string; value: number }[] = [];
  clientesFiltro: { label: string; value: number }[] = [];
  vehiculos: { label: string; value: number }[] = [];

  estados = [
    { label: 'EN OFICINA', value: 'EN OFICINA' },
    { label: 'EN PUERTO', value: 'EN PUERTO' },
    { label: 'PLANIFICADO', value: 'PLANIFICADO' },
    { label: 'CARGADO', value: 'CARGADO' },
    { label: 'DESCARGADO', value: 'DESCARGADO' },
    { label: 'ENTREGADO', value: 'ENTREGADO' },
    { label: 'EN GARAJE', value: 'EN GARAJE' },
    { label: 'DEVOLVIENDO', value: 'DEVOLVIENDO' },
    { label: 'DEVUELTO', value: 'DEVUELTO' }
  ];

  filtroContenedor: string = '';
  filtroVencimiento: string = '';
  filtroCliente: string = '';
  filtroMercancia: string = '';
  filtroTipoContenedor: string = '';
  filtroTamano: string = '';
  filtroAno: string = '';
  filtroTipo: string = '';
  filtroNaviera: string = '';
  filtroCategoria: string = '';
  filtroCiudadOrigen: string = '';
  filtroCiudadDestino: string = '';
  filtroEstadoContenedor: string = '';
  filtroFechaLlegada: string = '';
  filtroFechaLimite: string = '';
  filtroEstado: string = '';
  filtroFechaDevolucion: string = '';
  filtroUbicacionDevolucion: string = '';
  filtroDias: string = '';
  filtroObservaciones: string = '';
  filtroBlMadre: string = '';
  filtroDeuda: string = '';

  opcionesVencimiento = [
    { label: 'Todos', value: '' },
    { label: 'Vencidos', value: 'fecha-vencida' },
    { label: 'Por vencer', value: 'fecha-pre-vencida' },
    { label: 'Devueltos', value: 'fecha-devuelto' }
  ];

  opcionesDeudas = [
    { label: 'Todos', value: '' },
    { label: 'ESTIBAJE', value: 'deuda_estibaje' },
    { label: 'GRUAJE', value: 'deuda_grua' },
    { label: 'MONTACARGA', value: 'deuda_montacarga' },
    { label: 'URBANO', value: 'deuda_urbano' },
    { label: 'TRASBORDO', value: 'deuda_trasbordo' },
    { label: 'LAVADO', value: 'deuda_lavado' }
  ]

  tipo_contenedor = [
    { label: 'DRY', value: 'DRY' },
    { label: 'ESTANDAR', value: 'ESTANDAR' },
    { label: 'HIGH CUBE', value: 'HIGH CUBE' },
    { label: 'REEFER', value: 'REEFER' },
    { label: 'OPEN TOP', value: 'OPEN TOP' },
    { label: 'FLAT RACK', value: 'FLAT RACK' },
    { label: 'TANK', value: 'TANK' }
  ];

  estado_contenedor = [
    { label: 'BUENO', value: 'BUENO' },
    { label: 'REGULAR', value: 'REGULAR' },
    { label: 'MALO', value: 'MALO' }
  ];

  modalidad_pago = [
    { label: 'AL CONTADO', value: 'AL CONTADO' },
    { label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' },
    { label: 'QR', value: 'QR' }
  ];

  ordenAscendente: boolean = true;

  gastos: any[] = [];
  devoluciones: any[] = [];
  gastosDeuda: any[] = [];
  pdfs: any[] = [];

  tiposGasto = [
    { id: 'ESTIBAJE', nombre: 'ESTIBAJE' },
    { id: 'GRUAJE', nombre: 'GRUAJE' },
    { id: 'MONTACARGA', nombre: 'MONTACARGA' },
    { id: 'URBANO', nombre: 'URBANO' },
    { id: 'TRASBORDO', nombre: 'TRASBORDO' },
    { id: 'LAVADO', nombre: 'LAVADO' },
    { id: 'REPARACION_CONTENEDOR', nombre: 'REPARACION_CONTENEDOR' }
  ];

  mostrarTabla = true;

  imagenSeleccionada: any = null;

  imagenSeleccionadaURL: string = '';
  mostrarDialogImagen: boolean = false;

  imagenes: any[] = [];

  pdfSeleccionadoURL: string = '';

  imagenesContenedor = [
    { key: 'IZQUIERDA', label: 'Izquierda' },
    { key: 'DERECHA', label: 'Derecha' },
    { key: 'PUERTA', label: 'Puerta' },
    { key: 'PRECINTO', label: 'Precinto' },
    { key: 'ADENTRO', label: 'Adentro' },
    { key: 'PLAQUETA', label: 'Plaqueta' },
    { key: 'CONTENEDOR_VACIO', label: 'Contenedor vacío' },
    { key: 'DESCARGUIO', label: 'Descarguío' }
  ];

  loading = false;

  generando: boolean = false;

  imagenOriginal: any = '';
  imagenRecortada: any = '';
  cropperVisible: boolean = false;
  archivoOriginal: File | null = null;
  contenedorActual: any = null;
  nombreActual: string = '';

  mostrarVistaPreviaRecibo = false;
  gastoSeleccionado: any = {};
  pdfSrc: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;

  clienteSeleccionado: any = null;
  clientesFiltrados: any[] = [];
  opcionesClientes: { label: string; value: number }[] = [];

  contenedor: any = null;
  contenedorFiltrados: any[] = [];
  opcionesContenedores: String[] = [];

  constructor(private contenedorService: ContenedorService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.obtenerListado();
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerMercancias();
    this.obtenerClientes();
    this.obtenerVehiculos();
    this.obtenerGastosDeuda();
  }


  alternarVista() {
    this.mostrarTabla = !this.mostrarTabla;
  }

  obtenerListado(): void {
    this.contenedorService.getContenedores().subscribe({
      next: data => {
        this.contenedores = data;
        this.verificarFechas();
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de contenedores.', 'error')
    });
  }

  get contenedoresFiltrados() {
    return this.contenedores.filter(contenedor => {
      const contenedorStr = contenedor.numero_contenedor?.toLowerCase() || '';
      const vencimientoStr = this.estiloFila(contenedor.fecha_limite, contenedor.estado).toLowerCase();
      const clienteStr = this.getClienteNombre(contenedor.id_cliente)?.toLowerCase() || '';
      const blMadreStr = contenedor.bl_madre?.toLowerCase() || '';
      const mercanciaStr = this.getMercanciaNombre(contenedor.id_mercancia)?.toLowerCase() || '';
      const tipoContenedorStr = contenedor.tipo_contenedor?.toLowerCase() || '';
      const tamanoStr = contenedor.tamano?.toLowerCase() || '';
      const anoStr = contenedor.ano?.toString() || '';
      const tipoStr = contenedor.tipo?.toLowerCase() || '';
      const navieraStr = this.getNavieraNombre(contenedor.id_naviera)?.toLowerCase() || '';
      const categoriaStr = contenedor.categoria?.toLowerCase() || '';
      const ciudadOrigenStr = this.getCiudadNombre(contenedor.id_ciudad_origen)?.toLowerCase() || '';
      const ciudadDestinoStr = this.getCiudadNombre(contenedor.id_ciudad_destino)?.toLowerCase() || '';
      const estadoContenedorStr = contenedor.estado_contenedor?.toLowerCase() || '';
      const fechaLlegadaStr = contenedor.fecha_llegada ? new Date(contenedor.fecha_llegada).toISOString().slice(0, 10) : '';
      const fechaLimiteStr = contenedor.fecha_limite ? new Date(contenedor.fecha_limite).toISOString().slice(0, 10) : '';
      const estadoStr = contenedor.estado?.toLowerCase() || '';
      const fechaDevolucionStr = contenedor.fecha_devolucion ? new Date(contenedor.fecha_devolucion).toISOString().slice(0, 10) : '';
      const ubicacionDevolucionStr = contenedor.ubicacion_devolucion?.toLowerCase() || '';
      const diasStr = contenedor.dias?.toString() || '';
      const observacionesStr = contenedor.observaciones?.toLowerCase() || '';
      let deudaStr = true;
      if (this.filtroDeuda) {
        deudaStr = contenedor[this.filtroDeuda] && contenedor[this.filtroDeuda] > 0;
      }

      return (
        contenedorStr.includes(this.filtroContenedor.toLowerCase()) &&
        vencimientoStr.includes(this.filtroVencimiento.toLowerCase()) &&
        clienteStr.includes(this.filtroCliente.toLowerCase()) &&
        blMadreStr.includes(this.filtroBlMadre.toLowerCase()) &&
        mercanciaStr.includes(this.filtroMercancia.toLowerCase()) &&
        tipoContenedorStr.includes(this.filtroTipoContenedor.toLowerCase()) &&
        tamanoStr.includes(this.filtroTamano.toLowerCase()) &&
        anoStr.includes(this.filtroAno.toLowerCase()) &&
        tipoStr.includes(this.filtroTipo.toLowerCase()) &&
        navieraStr.includes(this.filtroNaviera.toLowerCase()) &&
        categoriaStr.includes(this.filtroCategoria.toLowerCase()) &&
        ciudadOrigenStr.includes(this.filtroCiudadOrigen.toLowerCase()) &&
        ciudadDestinoStr.includes(this.filtroCiudadDestino.toLowerCase()) &&
        estadoContenedorStr.includes(this.filtroEstadoContenedor.toLowerCase()) &&
        fechaLlegadaStr.includes(this.filtroFechaLlegada.toLowerCase()) &&
        fechaLimiteStr.includes(this.filtroFechaLimite.toLowerCase()) &&
        estadoStr.includes(this.filtroEstado.toLowerCase()) &&
        fechaDevolucionStr.includes(this.filtroFechaDevolucion.toLowerCase()) &&
        ubicacionDevolucionStr.includes(this.filtroUbicacionDevolucion.toLowerCase()) &&
        diasStr.includes(this.filtroDias.toLowerCase()) &&
        observacionesStr.includes(this.filtroObservaciones.toLowerCase()) &&
        deudaStr
      );
    });
  }


  obtenerCiudades(): void {
    this.contenedorService.getCiudad().subscribe({
      next: (data) => {
        this.ciudades = data.map((ciudad) => ({
          label: ciudad.ciudad,
          value: ciudad.id_ciudad,
        }));
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
      },
    });
  }

  getCiudadNombre(id: number): string {
    const ciudad = this.ciudades.find((c) => c.value === id);
    return ciudad ? ciudad.label : 'Sin nombre';
  }

  obtenerNavieras(): void {
    this.contenedorService.getNaviera().subscribe({
      next: (data) => {
        this.navieras = data.map((naviera) => ({
          label: naviera.nombre_comercial,
          value: naviera.id_naviera,
        }));
      },
      error: (err) => {
        console.error('Error al cargar navieras:', err);
      },
    });
  }
  getNavieraNombre(id: number): string {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.label : 'Sin nombre';
  }

  obtenerMercancias(): void {
    this.contenedorService.getMercancia().subscribe({
      next: (data) => {
        this.mercancias = data.map((mercancia) => ({
          label: mercancia.mercancia,
          value: mercancia.id_mercancia,
        }));
      },
      error: (err) => {
        console.error('Error al cargar mercancías:', err);
      },
    });
  }
  getMercanciaNombre(id: number): string {
    const mercancia = this.mercancias.find((m) => m.value === id);
    return mercancia ? mercancia.label : 'Sin nombre';
  }

  obtenerClientes(): void {
    this.contenedorService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((cliente) => ({
          label: cliente.nombre_comercial,
          value: cliente.id_cliente,
        }));
        console.log('Clientes cargados:', '************');
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      },
    });
  }
  getClienteNombre(id: number): string {

    const cliente = this.clientes.find((c) => c.value === id);

    return cliente ? cliente.label : 'Sin nombre';
  }

  obtenerVehiculos(): void {
    this.contenedorService.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = data.map((vehiculo) => ({
          label: vehiculo.nombre_vehiculo,
          value: vehiculo.id_vehiculo,
        }));
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
      },
    });
  }
  getVehiculoNombre(id: number): string {
    const vehiculo = this.vehiculos.find((v) => v.value === id);
    return vehiculo ? vehiculo.label : 'Sin nombre';
  }

  ordenarDatos() {
    this.contenedores.sort((a, b) => {
      const valorA = a.id_despacho; // Cambia 'campoOrdenar' al campo real
      const valorB = b.id_despacho;

      if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
      if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });

    this.ordenAscendente = !this.ordenAscendente; // Cambia orden para próximo clic
  }

  get registrosFiltrados() {
    return this.contenedores.filter(reg => {
      const estilo = this.estiloFila(reg.fecha_limite, reg.estado);
      if (!this.filtroVencimiento) return true;
      return estilo === this.filtroVencimiento;
    });
  }

  limpiarFiltros() {
    this.filtroContenedor = '';
    this.filtroBlMadre = '';
    this.filtroVencimiento = '';
    this.filtroCliente = '';
    this.filtroMercancia = '';
    this.filtroTipoContenedor = '';
    this.filtroTamano = '';
    this.filtroAno = '';
    this.filtroTipo = '';
    this.filtroNaviera = '';
    this.filtroCategoria = '';
    this.filtroCiudadOrigen = '';
    this.filtroCiudadDestino = '';
    this.filtroEstadoContenedor = '';
    this.filtroFechaLlegada = '';
    this.filtroFechaLimite = '';
    this.filtroEstado = '';
    this.filtroFechaDevolucion = '';
    this.filtroUbicacionDevolucion = '';
    this.filtroDias = '';
    this.filtroObservaciones = '';
    this.filtroDeuda = '';
  }

  abrirNuevoContenedor(): void {
    this.contenedorSeleccionado = {
      id_naviera: null,
      numero_contenedor: '',
      tipo_contenedor: '',
      tamano: '',
      ano: null,
      id_categoria: null,
      id_ciudad_origen: null,
      estado_actual: '',
      observaciones: '',
      usucre: localStorage.getItem('login'),
      feccre: new Date(),
      verificado: false,
      ano_plaqueta: null,
      fecha_devolucion: null,
      ubicacion_devolucion: '',
      tiene_estibaje: false,
      tiene_gruaje: false,
      tiene_montacarga: false,
      tiene_urbano: false,
      tiene_trasbordo: false,
      tiene_lavado: false,
      tiene_reparacion_contenedor: false,
      fecha_devolucion_naviera: null
    };
    this.popupVisible = true;
    this.modoEdicion = false;
    this.tituloPopup = 'Nuevo Contenedor';
  }

  editarContenedor(contenedor: any): void {
    this.contenedorSeleccionado = {
      ...contenedor, fecha_devolucion: contenedor.fecha_devolucion ? new Date(contenedor.fecha_devolucion) : null,
      fecha_devolucion_naviera: contenedor.fecha_devolucion_naviera ? new Date(contenedor.fecha_devolucion_naviera) : null
    };
    this.popupVisible = true;
    this.modoEdicion = true;
    this.tituloPopup = 'Editar Contenedor';
  }

  eliminarContenedor(contenedor: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el contenedor "${contenedor.numero_contenedor}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.contenedorService.eliminarContenedor(contenedor.id_contenedor).subscribe({
          next: () => {
            this.obtenerListado();
            Swal.fire('Eliminado', 'Contenedor eliminado correctamente.', 'success');
          },
          error: err => Swal.fire('Error', 'No se pudo eliminar el contenedor.', 'error')
        });
      }
    });
  }

  guardarCambios(): void {
    if (this.modoEdicion) {
      this.contenedorSeleccionado.usumod = localStorage.getItem('login');
      this.contenedorSeleccionado.fecmod = new Date();
      console.log('Contenedor a actualizar:', this.contenedorSeleccionado);
      this.contenedorService.editarContenedor(this.contenedorSeleccionado.id_contenedor, this.contenedorSeleccionado).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Actualizado', 'Contenedor actualizado correctamente.', 'success');
        },
        error: err => Swal.fire('Error', 'No se pudo actualizar el contenedor.', 'error')
      });
    } else {
      this.contenedorService.insertarContenedor(this.contenedorSeleccionado).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Guardado', 'Contenedor creado correctamente.', 'success');
        },
        error: err => Swal.fire('Error', 'No se pudo crear el contenedor.', 'error')
      });
    }
  }

  esFechaVencida(fechaStr: string | Date): boolean {
    if (!fechaStr) return false;
    const hoy = new Date();
    const fecha = new Date(fechaStr);

    // Ajusta horas a 0 para comparar solo fechas (sin tiempo)
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    return fecha < hoy;
  }

  estiloFila(fechaStr: string | Date, estado: string): string {
    if (!fechaStr) return '';
    const hoy = new Date();
    const fechaLimite = new Date(fechaStr);

    // Ajustar para ignorar la hora y comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaLimite.setHours(0, 0, 0, 0);

    const diferenciaDias = Math.floor((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0 && estado !== 'DEVUELTO') {
      return 'fecha-vencida'; // Ya venció
    } else if (diferenciaDias <= 7 && estado !== 'DEVUELTO') {
      return 'fecha-pre-vencida'; // Está por vencer
    } else if (estado === 'DEVUELTO') {
      return 'fecha-devuelto'; // No aplica estilo
    }
    return 'contenedor';
  }

  //2 SEMANAS

  calcularDiasRestantes(fechaLimite: string): number {
    const hoy = new Date();
    const limite = new Date(fechaLimite);

    hoy.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);

    const diff = Math.floor((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  verificarFechas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const alertas: string[] = [];

    // Para los próximos 7 días
    for (let i = 7; i >= 1; i--) {
      const fechaComparar = new Date(hoy);
      fechaComparar.setDate(hoy.getDate() + i);

      const proximos = this.contenedores.filter(v => {
        const limite = new Date(v.fecha_limite);
        limite.setHours(0, 0, 0, 0);
        return limite.getTime() === fechaComparar.getTime() && v.estado != 'DEVUELTO';
      });

      if (proximos.length > 0) {
        let detalles = proximos.map(v => `• ${this.getClienteNombre(v.id_cliente)} - ${v.numero_contenedor} - vence el ${new Date(v.fecha_limite).toLocaleDateString()}`).join('\n');
        alertas.push(`🚨 Faltan ${i} día(s):\n${detalles}`);
      }
    }

    // Para vencidos
    const vencidos = this.contenedores.filter(v => {

      const limite = new Date(v.fecha_limite);
      limite.setHours(0, 0, 0, 0);
      return limite.getTime() < hoy.getTime() && v.estado != 'DEVUELTO';
    });

    if (vencidos.length > 0) {
      let detalles = vencidos.map(v => `• ${this.getClienteNombre(v.id_cliente)} - ${v.numero_contenedor} - venció el ${new Date(v.fecha_limite).toLocaleDateString()}`).join('\n');
      alertas.push(`❌ VENCIDOS:\n${detalles}`);
    }

    if (alertas.length > 0) {
      const mensaje = alertas.join('\n\n');
      Swal.fire({
        icon: 'warning',
        title: 'Alerta de Fechas',
        html: `<pre style="text-align:left;white-space:pre-wrap;">${mensaje}</pre>`,
        confirmButtonText: 'Cerrar',
        customClass: {
          popup: 'swal-wide'
        }
      });
    }
  }

  // generarClientesUnicos() {
  //   const idsEnContenedores = new Set(this.clientes.map(d => d.id_cliente));

  //   this.clientesFiltro = this.clientes
  //     .filter(c => idsEnContenedores.has(c.value))
  //     .map(c => ({ label: c.label, value: c.value }));
  // }

  numeros(event: any, campo: string) {
    const valor = event.target.value;

    // Permite números y UN solo punto decimal
    const soloNumeros = valor.replace(/[^0-9.]/g, '');

    // Evitar más de un punto decimal
    const partes = soloNumeros.split('.');
    let valorFinal = partes[0];
    if (partes.length > 1) {
      valorFinal += '.' + partes[1].slice(0, 10); // Limita decimales opcional
    }

    event.target.value = valorFinal;
    this.contenedorSeleccionado[campo] = valorFinal;
  }

  guardarEstadoContenedor(contenedor: any, nuevoEstado: any): void {
    console.log('Nuevo estado seleccionado:', nuevoEstado);
    this.contenedorSeleccionado = { ...contenedor };
    this.contenedorSeleccionado.estado = nuevoEstado;
    this.contenedorSeleccionado.usumod = localStorage.getItem('login');
    this.contenedorSeleccionado.fecmod = new Date();
    this.contenedorService
      .editarEstadoContenedor(
        this.contenedorSeleccionado.id_contenedor,
        this.contenedorSeleccionado
      )
      .subscribe({
        next: () => {
          this.popupVisible = false;
          Swal.fire(
            'Actualizado',
            'Contenedor actualizado correctamente.',
            'success'
          );
        },
        error: (err) =>
          Swal.fire('Error', 'No se pudo actualizar el contenedor.', 'error'),
      });
  }

  verGasto(contenedor: any, gasto: any): void {
    this.contenedorSeleccionado = contenedor;
    this.obtenerGastos(gasto.nombre);
    this.mostrarGastos = true;
    this.tituloMostrarGastos = `${gasto.nombre}`;

  }

  obtenerGastos(nombreGasto: string): void {
    this.contenedorService.getGastosContenedor(this.contenedorSeleccionado.id_contenedor, nombreGasto).subscribe({
      next: data => {
        this.gastos = data;
        this.gastos.forEach(gasto => {
          gasto.fecha_pago = new Date(gasto.fecha_pago);
        });
        console.log('Gastos cargados:', this.gastos);
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de gastos.', 'error')
    });
  }

  agregarGasto(): void {
    this.gastos.push({
      id_contenedor_gasto: null,
      id_contenedor: this.contenedorSeleccionado.id_contenedor,
      tipo: this.tituloMostrarGastos,
      lugar: null,
      monto: '',
      cancelado: false,
      estado: 'ACTIVO',
      fecha_pago: null,
      modalidad_pago: '',
      persona_pago: ''
    });
  }

  guardarGasto(): void {
    const incompletos = this.gastos.filter(g => !g.lugar || !g.monto);

    if (incompletos.length > 0) {
      Swal.fire(
        'Advertencia',
        'Debes llenar al menos Lugar y Monto en todos los gastos antes de guardar, caso contrario borre los vacíos',
        'warning'
      );
      return;
    }

    const requests = this.gastos.map(gasto => {
      if (gasto.id_contenedor_gasto) {
        return this.contenedorService.editarGasto(gasto.id_contenedor_gasto, gasto);
      } else {
        return this.contenedorService.insertarGasto(gasto);
      }
    });

    forkJoin(requests).subscribe({
      next: (resultados: any) => {
        this.gastos = this.gastos.map((g, i) => ({
          ...g,
          id_contenedor_gasto: resultados[i].gasto.id_contenedor_gasto
        }));
        this.subirComprobantes();

        this.mostrarGastos = false;
        this.obtenerListado();
        Swal.fire('Éxito', 'Todos los gastos fueron guardados correctamente.', 'success');
      },
      error: () => {
        Swal.fire('Error', 'Ocurrió un problema al guardar los gastos.', 'error');
      }
    });
  }

  eliminarGasto(index: number) {
    const gasto = this.gastos[index];
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el gasto?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        if (gasto.id_contenedor_gasto) {
          this.contenedorService.eliminarGasto(gasto.id_contenedor_gasto, this.contenedorSeleccionado.id_contenedor, gasto.tipo).subscribe({
            next: () => {
              this.gastos.splice(index, 1);
              this.obtenerListado();
              Swal.fire('Eliminado', 'Gasto eliminado correctamente.', 'success');
            },
            error: err => Swal.fire('Error', 'No se pudo eliminar el gasto.', 'error')
          });
        } else {
          this.gastos.splice(index, 1);
        }
      }
    });
  }

  verImagenes(contenedor: any): void {
    this.contenedorSeleccionado = contenedor;
    this.mostrarImagen = true;
    this.obtenerImagenes();
  }

  verImagen(nombre: any) {
    this.imagenSeleccionadaURL = `${URL_SERVICIOS}/contenedor/verImagen/${nombre}`;
    console.log('Imagen URL:', this.imagenSeleccionadaURL);
    this.mostrarDialogImagen = true;
  }

  abrirSelectorImagen(contenedor: any, nombre: string): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg'; // ✅ Ahora acepta JPG y PNG

    input.onchange = (event: any) => {
      this.onFileSelected(event, contenedor, nombre);
    };

    input.click();
  }

  onFileSelected(event: Event, contenedor: any, nombre: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // ✅ Validar que sea imagen
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      Swal.fire('Error', 'Debe seleccionar una imagen válida (JPG o PNG).', 'error');
      input.value = '';
      return;
    }

    this.archivoOriginal = file;
    this.contenedorActual = contenedor;
    this.nombreActual = nombre;

    this.imagenOriginal = null;
    this.imagenOriginal = event;
    this.cropperVisible = true;
  }

  imageCropped(event: any) {
    this.imagenRecortada = event.objectUrl || null;
    console.log('Imagen recortada:', this.imagenRecortada);
  }

  cerrarCropper() {
    this.cropperVisible = false;
    this.imagenRecortada = '';
    this.imagenOriginal = '';
  }

  guardarImagenRecortada() {
    console.log('Guardando imagen recortada...' + this.imagenRecortada + ' archivo: ' + this.archivoOriginal);
    if (!this.archivoOriginal || !this.imagenRecortada) return;

    const c = this.contenedorActual;
    const nombre = this.nombreActual;

    const extension = this.archivoOriginal.type === 'image/png' ? 'png' : 'jpg';
    const nuevoNombre = `${c.id_contenedor}-${nombre}.${extension}`;

    Swal.fire({
      title: '¿Confirmar recorte?',
      text: `¿Deseas subir la imagen recortada como "${nuevoNombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, subir',
      cancelButtonText: 'Cancelar'
    }).then(async confirmResult => {
      if (confirmResult.isConfirmed) {
        let blob: Blob;

        if (this.imagenRecortada.startsWith('data:image')) {
          // ✅ Es Base64
          blob = this.base64ToBlob(this.imagenRecortada);
        } else {
          // ✅ Es ObjectURL
          const response = await fetch(this.imagenRecortada);
          blob = await response.blob();
        }
        const nuevoArchivo = new File([blob], nuevoNombre, { type: this.archivoOriginal!.type });

        const formData = new FormData();
        formData.append('archivo', nuevoArchivo);
        formData.append('id_contenedor', c.id_contenedor.toString());
        formData.append('nombre', nombre);

        axios.post(`${URL_SERVICIOS}/contenedor/subir_imagen`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
          .then(() => {
            Swal.fire('¡Subido!', 'La imagen se subió correctamente.', 'success');
            this.cerrarCropper();
            this.obtenerImagenes();
            this.obtenerListado();
          })
          .catch(err => {
            console.error('Error al subir imagen', err);
            Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
          });
      }
    });
  }

  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  verDevoluciones(contenedor: any): void {
    this.contenedorSeleccionado = contenedor;
    this.obtenerDevoluciones();
    this.mostrarDevolucion = true;

  }

  obtenerDevoluciones(): void {
    this.contenedorService.getDevolucionesContenedor(this.contenedorSeleccionado.id_contenedor).subscribe({
      next: data => {
        this.devoluciones = data;
        this.devoluciones.forEach(devolucion => {
          devolucion.fecha_devolucion = new Date(devolucion.fecha_devolucion);
        });
        console.log('Devoluciones obtenidas:', this.devoluciones);
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de devoluciones.', 'error')
    });
  }

  agregarDevolucion(): void {
    this.devoluciones.push({
      id_contenedor_devolucion: null,
      id_contenedor: this.contenedorSeleccionado.id_contenedor,
      id_vehiculo: null,
      urbano: false,
      fecha_devolucion: null,
      estado: 'ACTIVO'
    });
  }

  guardarDevolucion(): void {
    const incompletos = this.devoluciones.filter(d => !d.id_vehiculo || !d.fecha_devolucion);

    if (incompletos.length > 0) {
      Swal.fire(
        'Advertencia',
        'Debes llenar los datos, caso contrario borre los vacíos',
        'warning'
      );
      return;
    }

    const requests = this.devoluciones.map(devolucion => {
      if (devolucion.id_contenedor_devolucion) {
        return this.contenedorService.editarDevolucion(devolucion.id_contenedor_devolucion, devolucion);
      } else {
        return this.contenedorService.insertarDevolucion(devolucion);
      }
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.mostrarDevolucion = false;
        this.obtenerListado();
        Swal.fire('Éxito', 'Todos los devoluciones fueron guardados correctamente.', 'success');
      },
      error: () => {
        Swal.fire('Error', 'Ocurrió un problema al guardar los devoluciones.', 'error');
      }
    });
  }

  eliminarDevolucion(index: number) {
    const devolucion = this.devoluciones[index];
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la devolución?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        if (devolucion.id_contenedor_devolucion) {
          this.contenedorService.eliminarDevolucion(devolucion.id_contenedor_devolucion, this.contenedorSeleccionado.id_contenedor).subscribe({
            next: () => {
              this.devoluciones.splice(index, 1);
              this.obtenerListado();
              Swal.fire('Eliminado', 'Devolución eliminada correctamente.', 'success');
            },
            error: err => Swal.fire('Error', 'No se pudo eliminar la devolución.', 'error')
          });
        } else {
          this.devoluciones.splice(index, 1);
        }
      }
    });
  }

  asignarCategoria(): void {
    const ano = Number(this.contenedorSeleccionado.ano);
    const naviera = (this.getNavieraNombre(this.contenedorSeleccionado.id_naviera) || '').toUpperCase();
    if (!ano) { this.contenedorSeleccionado.id_categoria = ''; return; }

    const CY = new Date().getFullYear(); // p.ej. 2025

    // Rangos dinámicos
    const isA = ano >= (CY - 1) && ano <= CY;       // 2024–2025 (hoy)
    const isB = ano >= (CY - 3) && ano <= (CY - 2); // 2022–2023
    const isC = ano >= (CY - 14) && ano <= (CY - 4);// 2011–2021
    const isCraft = ano <= (CY - 15);                   // <= 2010

    if (naviera === 'MAERSK') {
      if (isA) this.contenedorSeleccionado.id_categoria = 'S-M "A"';
      else if (isB) this.contenedorSeleccionado.id_categoria = 'K "B"';
      else if (isC) this.contenedorSeleccionado.id_categoria = 'E "C"';
      else if (isCraft) this.contenedorSeleccionado.id_categoria = 'Q "craft"';
      else this.contenedorSeleccionado.id_categoria = 'Desconocido';
    } else {
      if (isA) this.contenedorSeleccionado.id_categoria = 'A';
      else if (isB) this.contenedorSeleccionado.id_categoria = 'B';
      else if (isC) this.contenedorSeleccionado.id_categoria = 'C';
      else if (isCraft) this.contenedorSeleccionado.id_categoria = 'CRAFT';
      else this.contenedorSeleccionado.id_categoria = 'Desconocido';
    }
  }

  obtenerGastosDeuda(): void {
    this.contenedorService.getGastosDeuda().subscribe({
      next: data => {
        this.gastosDeuda = data;
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de contenedores.', 'error')
    });
  }

  obtenerImagenes(): void {
    this.contenedorService.getImagenes(this.contenedorSeleccionado.id_contenedor).subscribe({
      next: data => {
        this.imagenes = data.map((x: any) => x.nombre);
        console.log('Imágenes obtenidas:', this.imagenes);
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de imágenes.', 'error')
    });
  }

  existe(nombre: string): boolean {
    if (!this.imagenes || this.imagenes.length === 0) return false;

    const existe = this.imagenes.some(img => img.includes(nombre));
    return existe;
  }

  getImagen(nombre: string): string | null {
    const encontrada = this.imagenes.find(img => img.includes(nombre));
    return encontrada || null;
  }

  verPdfs(contenedor: any, documento: any) {
    this.mostrarDialogVariosPDF = true;
    this.contenedorSeleccionado = contenedor;
    this.obtenerPdfs(documento);
  }

  obtenerPdfs(nombrePdf: string): void {
    this.contenedorService.getPdfs(this.contenedorSeleccionado.id_contenedor, nombrePdf).subscribe({
      next: data => {
        this.pdfs = data;
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de PDFs.', 'error')
    });
  }

  abrirSelectorArchivo(contenedor: any) {

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';

    input.onchange = (event: any) => {
      this.onFileSelectedPDF(event, contenedor, 'EIR');
    };

    input.click();
  }

  verPDF(nombre: any) {
    this.pdfSeleccionadoURL = `${URL_SERVICIOS}/contenedor/verPdf/${nombre}`; // ajusta a tu ruta real
    console.log('PDF URL:', this.pdfSeleccionadoURL);
    this.mostrarDialogPDF = true;
  }

  onFileSelectedPDF(event: Event, contenedor: any, documento: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      Swal.fire('Error', 'Debe seleccionar un archivo PDF válido.', 'error');
      input.value = '';
      return;
    }

    // 🔹 Pedir al usuario un nuevo nombre antes de confirmar
    Swal.fire({
      title: 'Renombrar archivo',
      input: 'text',
      inputLabel: 'Escribe el nuevo nombre para el archivo (sin .pdf)',
      inputValue: file.name.replace('.pdf', ''), // por defecto el nombre original
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
        nuevoNombre = nuevoNombre.replace(/\.pdf$/, "");
        nuevoNombre = nuevoNombre.replace(/\s+/g, "_");

        Swal.fire({
          title: '¿Estás seguro?',
          text: `¿Deseas subir el archivo con el nombre: "${nuevoNombre}.pdf"?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, subir',
          cancelButtonText: 'No, cancelar'
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            const formData = new FormData();

            // 🔹 Crear un nuevo File con el nombre editado
            const nuevoArchivo = new File(
              [file],
              `${contenedor.id_contenedor}-${documento}-${nuevoNombre}.pdf`,
              { type: file.type }
            );

            formData.append('archivo', nuevoArchivo);
            formData.append('id_despacho', contenedor.id_contenedor.toString());
            formData.append('documento', documento.toString());

            axios.post(`${URL_SERVICIOS}/contenedor/subir_pdf`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
              .then(response => {
                Swal.fire('¡Subido!', 'El archivo se subió correctamente.', 'success');
                this.obtenerPdfs(documento);
                this.obtenerListado();
              })
              .catch(error => {
                console.error('Error al subir el PDF', error);
                Swal.fire('Error', 'Error al subir el archivo PDF. Intenta nuevamente.', 'error');
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

  eliminarPDF(pdf: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el archivo "${pdf}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((confirmResult) => {
      if (confirmResult.isConfirmed) {
        this.contenedorService.deleteFile(pdf).subscribe({
          next: (res) => {
            console.log(res);
            Swal.fire(
              'Eliminado',
              'El archivo se eliminó correctamente.',
              'success'
            );

            this.obtenerPdfs('EIR');
            this.obtenerListado();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Error al eliminar archivo.', 'error');
          }
        });
      }
    });
  }

  generarPDF(contenedor: any, tipo: 'CARGUIO' | 'DESCARGUIO' | 'DEVOLUCION') {
    this.loading = true;

    const filtros: Record<typeof tipo, string[]> = {
      CARGUIO: ["IZQUIERDA", "DERECHA", "PUERTA", "PRECINTO", "PLAQUETA"],
      DESCARGUIO: ["DESCARGUIO"],
      DEVOLUCION: ["IZQUIERDA", "DERECHA", "PUERTA", "ADENTRO", "PLAQUETA"]
    };

    const logo = 'assets/images/logo.png';
    const hojaMembrete = 'assets/images/membretado.jpg';
    const empresa = 'TRANSPORTES OSCORI';
    const cliente = {
      contenedor: contenedor.numero_contenedor,
      fecha: new Date().toLocaleDateString(),
      cliente: this.getClienteNombre(contenedor.id_cliente),
      asignacionCarga: this.getVehiculoNombre(contenedor.id_asignacion_vehiculo_carga),
      ano: contenedor.ano,
      tamano: contenedor.tamano
    };

    // Filtrar imágenes válidas según tipo
    const imagenesC1 = this.imagenes
      .filter(img => filtros[tipo].some(f => img.toUpperCase().includes(f)))
      .map(img => {
        const encontrado = filtros[tipo].find(f => img.toUpperCase().includes(f)) || img;
        return {
          url: `${URL_SERVICIOS}/contenedor/verImagen/${img}`,
          label: encontrado
        };
      });

    if (imagenesC1.length === 0) {
      this.loading = false;
      Swal.fire('Error', 'No tienes imagenes aun', 'error');
      return;
    }

    // Convertir imágenes a base64
    Promise.allSettled(
      imagenesC1.map(async c => {
        const dataUrl = await this.getBase64ImageFromURL(c.url);
        return { label: c.label, dataUrl };
      })
    ).then(results => {
      const imagenesOk = results
        .filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value.dataUrl)
        .map(r => (r as PromiseFulfilledResult<{ label: string; dataUrl: string }>).value);

      // Convertir logo a base64
      this.getBase64ImageFromURL(hojaMembrete).then(logoBase64 => {
        const docDefinition: any = {
          pageMargins: [40, 100, 40, 50],
          background: function (currentPage: number) {
            return {
              image: logoBase64,
              width: 595,
              height: 842
            };
          },
          content: [
            // { image: logoBase64, width: 100, alignment: 'center', margin: [0, 0, 0, 10] },
            // { text: empresa, style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },

            {
              table: {
                widths: ['40%', '60%'],
                body: [
                  [
                    {
                      text: [
                        { text: 'Contenedor: ', bold: true },
                        { text: cliente.contenedor }
                      ]
                    },
                    {
                      text: [
                        { text: tipo === 'DEVOLUCION' ? '' : 'Cliente: ', bold: true },
                        { text: tipo === 'DEVOLUCION' ? '' : cliente.cliente }
                      ]
                    }
                  ],
                  [
                    {
                      text: [
                        { text: 'Fecha: ', bold: true },
                        { text: cliente.fecha }
                      ]
                    },
                    {
                      text: [
                        { text: tipo === 'DEVOLUCION' ? 'Año Contenedor: ' : 'Placa: ', bold: true },
                        { text: tipo === 'DEVOLUCION' ? cliente.ano : cliente.asignacionCarga.split('-')[0] || 'SP' }
                      ]
                    }
                  ],
                  [
                    {
                      text: [
                        { text: '' }
                      ]
                    },
                    {
                      text: [
                        { text: tipo === 'DEVOLUCION' ? '' : 'Conductor: ', bold: true },
                        { text: tipo === 'DEVOLUCION' ? '' : cliente.asignacionCarga.split('-')[1] || '' }
                      ]
                    }
                  ],
                ]
              },
              layout: 'noBorders',
              margin: [0, 0, 0, 0]
            },
            imagenesOk.length
              ? this.chunkImages(imagenesOk, 2).map(row => {
                return {
                  stack: row.map(cell =>
                    cell.dataUrl
                      ? {
                        stack: [
                          // { image: cell.dataUrl, width: 240, height: 190, alignment: 'center', margin: [0, 4, 0, 0] },
                          { image: cell.dataUrl, fit: [520, 300], alignment: 'center', margin: [0, 0, 0, 0] },
                          //                           { 
                          //   image: cell.dataUrl,          
                          //   alignment: 'center', 
                          //   margin: [0, 4, 0, 0] 
                          // },
                          { text: cell.label, bold: true, alignment: 'center', margin: [0, 0, 0, 5] }

                        ],
                        margin: [0, 0, 0, 0]
                      }
                      : { text: '' }
                  )
                };
              })
              : { text: 'Sin imágenes disponibles.', italics: true, alignment: 'center' }

          ],
          styles: {
            header: { fontSize: 18, bold: true },
            subheader: { fontSize: 12, margin: [0, 2, 0, 2] }
          }
        };
        const placa = this.getVehiculoNombre(contenedor.id_asignacion_vehiculo_carga).split(' - ')[0] || 'SP';
        if (tipo === 'DEVOLUCION') {
          pdfMake.createPdf(docDefinition).download(`${contenedor.numero_contenedor}_${contenedor.ano}_${contenedor.tamano}_${tipo}.pdf`);
        } else {
          pdfMake.createPdf(docDefinition).download(`${contenedor.numero_contenedor}_${this.getClienteNombre(contenedor.id_cliente)}_${placa}_${tipo}.pdf`);
        }
      });
    }).finally(() => (this.loading = false));
  }

  /** Carga una imagen (misma-origin o CORS habilitado) y devuelve dataURL base64 */
  getBase64ImageFromURL_logo(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = err => reject(err);
      img.src = url;
    });
  }

  /** Carga una imagen (misma-origin o CORS habilitado), la comprime y devuelve dataURL base64 */
  /** Optimiza imagen: redimensiona y comprime sin perder mucha calidad */
  getBase64ImageFromURL(
    url: string,
    maxWidth = 1200,   // más ancho = mejor calidad
    maxHeight = 900,   // proporción adecuada para horizontal
    quality = 0.85     // 0.85 mantiene buena nitidez sin pesar demasiado
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        let { width, height } = img;

        // Redimensionar proporcionalmente si es muy grande
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width *= scale;
          height *= scale;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Mejora la nitidez del escalado (suavizado)
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Convertir a JPEG con buena calidad
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = err => reject(err);
      img.src = url;
    });
  }

  getBase64ImageFromURL2(
    url: string,
    maxWidth = 800,  // ancho máximo permitido
    maxHeight = 800, // alto máximo permitido
    quality = 0.75   // calidad JPEG (0–1)
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let { width, height } = img;

        // 🔸 Mantener proporciones según orientación
        const aspectRatio = width / height;

        if (width > height) {
          // Imagen horizontal
          if (width > maxWidth) {
            height = Math.round(maxWidth / aspectRatio);
            width = maxWidth;
          }
        } else {
          // Imagen vertical o cuadrada
          if (height > maxHeight) {
            width = Math.round(maxHeight * aspectRatio);
            height = maxHeight;
          }
        }

        // 🔹 Crear canvas con nuevo tamaño
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        // 🔸 Convertir a JPEG comprimido
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = err => reject(err);
      img.src = url;
    });
  }




  /** Divide un array en filas de `size` elementos (para la tabla) */
  chunkImages<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      const chunk = arr.slice(i, i + size);
      while (chunk.length < size) {
        // Rellenar con objeto vacío si faltan celdas
        chunk.push({} as T);
      }
      res.push(chunk);
    }
    return res;
  }

  async generarImagenContenedor(contenedor: any, index: number) {
    const element = document.getElementById(`contenedor-${index}`);
    if (!element) return;

    this.generando = true;

    element.classList.add('modo-captura');

    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 0.95 });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `contenedor_${contenedor.id_contenedor}.png`;
      link.click();
    } catch (err) {
      console.error("Error al generar imagen", err);
    } finally {
      element.classList.remove('modo-captura');
      this.generando = false;
    }
  }

  subirComprobante(gasto: any) {

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';

    input.onchange = (event: any) => {
      this.onFileSubirComprobante(event, gasto);
    };

    input.click();
  }

  async generarComprobante(gasto: any) {
    this.gastoSeleccionado = gasto;
    const docDefinition: any = {
      content: [
        { text: 'RECIBO DE PAGO', style: 'titulo', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: this.tituloMostrarGastos, alignment: 'center', margin: [0, 0, 0, 20] },
        {
          table: {
            widths: ['40%', '60%'],
            body: [
              ['Cliente:', gasto.persona_pago || ''],
              ['Monto:', gasto.monto ? `${gasto.monto} BOB` : ''],
              ['Fecha:', gasto.fecha_pago ? new Date(gasto.fecha_pago).toLocaleDateString() : new Date().toLocaleDateString()],
              ['Lugar:', gasto.lugar ? this.getCiudadNombre(gasto.lugar) : '']
            ]
          },
          layout: 'noBorders'
        }
      ],
      styles: {
        titulo: { fontSize: 16, bold: true }
      }
    };

    // 🔹 Generar el PDF y mostrarlo en un iframe seguro
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
      this.pdfBlob = blob; // ✅ Guardamos el blob original
      const blobUrl = URL.createObjectURL(blob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      this.mostrarVistaPreviaRecibo = true;
    });
  }

  subirReciboPDF() {
    if (!this.pdfBlob) {
      Swal.fire('Error', 'No hay archivo PDF generado.', 'error');
      return;
    }

    const file = new File([this.pdfBlob], 'recibo_pago.pdf', { type: 'application/pdf' });

    // 🔹 Simula la selección del archivo
    this.gastoSeleccionado.archivo = file;

    Swal.fire('Éxito', 'Archivo seleccionado', 'success');
    this.mostrarVistaPreviaRecibo = false;

    console.log('Archivo listo:', this.gastoSeleccionado.archivo);

    // Si quieres subirlo automáticamente:
    // this.subirArchivoGasto(this.gastoSeleccionado);
  }





  onFileSubirComprobante(event: any, gasto: any): void {
    console.log('Evento de archivo:', event);
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // ✅ Validación: solo PDFs o imágenes
    if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      Swal.fire('Error', 'Tipo de archivo no permitido. Solo se permiten PDFs e imágenes.', 'error');
      input.value = '';
      return;
    }

    if (event.target.files.length > 0) {
      gasto.archivo = file;
      Swal.fire('Éxito', 'Archivo seleccionado.', 'success');
    }
  }

  subirComprobantes(): void {
    const uploads = this.gastos
      .filter(g => g.archivo)
      .map((gasto, index) => {
        const extension = gasto.archivo.name.split('.').pop()?.toLowerCase() || '';
        console.log(`Subiendo archivo para gasto index ${gasto.id_contenedor_gasto}:`, extension);
        const nuevoArchivo = new File(
          [gasto.archivo],
          `${gasto.id_contenedor_gasto}.${extension}`,
          { type: gasto.archivo.type }
        );
        const formData = new FormData();
        formData.append('archivo', nuevoArchivo);
        formData.append('id_despacho', gasto.id_contenedor.toString());
        formData.append('documento', gasto.id_contenedor_gasto.toString());

        axios.post(`${URL_SERVICIOS}/contenedor/subir_pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
          .then(response => {
            Swal.fire('¡Subido!', 'El archivo se subió correctamente.', 'success');
            // this.obtenerPdfs(documento);
            this.obtenerListado();
          })
          .catch(error => {
            console.error('Error al subir el PDF', error);
            Swal.fire('Error', 'Error al subir el archivo PDF. Intenta nuevamente.', 'error');
          });
      });

    if (uploads.length > 0) {
      forkJoin(uploads).subscribe({
        next: () => console.log('Archivos subidos correctamente'),
        error: () => console.log('Error al subir archivos')
      });
    }
  }

  verComprobante(nombre: any) {
    const url = `${URL_SERVICIOS}/contenedor/verPdf/${nombre}`;

    const extension = nombre.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      this.pdfSeleccionadoURL = url;
      this.mostrarDialogPDF = true;
    } else {
      this.imagenSeleccionadaURL = url;
      this.mostrarDialogImagen = true;
    }
  }

  getDeuda(label: any): void {
    this.filtroDeuda = this.opcionesDeudas.find(op => op.label === label)?.value ?? '';
  }

  filtrarClientes(event: any) {
    if (this.opcionesClientes.length === 0) {
      const idsclientes = new Set(this.contenedores.map(d => d.id_cliente));
      this.opcionesClientes = this.clientes.filter(c => idsclientes.has(c.value));
    }

    const query = event.query.toLowerCase();
    this.clientesFiltrados = this.opcionesClientes.filter(c =>
      c.label.toLowerCase().includes(query)
    );
  }
  filtrarContenedores(event: any) {
    // Solo llenar una vez
    if (this.opcionesContenedores.length === 0 && this.contenedores?.length > 0) {
      // Convertimos todo a string y filtramos los nulos o vacíos
      this.opcionesContenedores = this.contenedores
        .map(d => d?.numero_contenedor ? String(d.numero_contenedor) : '')
        .filter(c => c.trim() !== '');
    }

    const query = event.query ? event.query.toLowerCase() : '';

    this.contenedorFiltrados = this.opcionesContenedores.filter(c =>
      c?.toLowerCase().includes(query)
    );
  }

}
