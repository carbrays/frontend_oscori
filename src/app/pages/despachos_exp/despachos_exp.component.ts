import { Component, OnInit } from '@angular/core';
import { Despachos_ExpService } from 'src/app/services/despachos_exp/despachos_exp.service';
import Swal from 'sweetalert2';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';

import * as htmlToImage from 'html-to-image';

interface ObservacionItem {
  id_despacho: number;
  cliente: string;
  detalle: string[]; // lista de mensajes específicos
}

interface ObservacionGrupo {
  titulo: string;
  items: ObservacionItem[];
}

@Component({
  selector: 'app-despachos_exp',
  templateUrl: './despachos_exp.component.html',
  styleUrls: ['./despachos_exp.component.css'],
})
export class Despachos_ExpComponent implements OnInit {

  observacionesAgrupadas: ObservacionGrupo[] = [];
  mostrarDialogObservaciones: boolean = false;

  despachos: any[] = [];
  despachoSeleccionado: any = {};
  popupVisible = false;
  modoEdicion = false;
  tituloPopup = 'Despacho';

  ciudades: { label: string; value: number }[] = [];
  navieras: { label: string; value: number; dias: number }[] = [];
  clientes: { label: string; value: number }[] = [];
  clientesFiltro: { label: string; value: number }[] = [];
  vehiculos: { label: string; value: number }[] = [];

  tipo_carga = [
    { label: 'DESCONSOLIDADO', value: 'DESCONSOLIDADO' },
    { label: 'CARGA SUELTA', value: 'CARGA_SUELTA' },
    { label: 'CONTENEDOR', value: 'CONTENEDOR' },
  ];

  documentosRequeridosArica = [
    { id: 'MIC_CRT', nombre: 'MIC-CRT' },
  ];

  documentosRequeridosIquique = [
    { id: 'MIC_CRT', nombre: 'MIC-CRT' },
  ];

  estados = [
    { label: 'EN OFICINA', value: 'EN OFICINA' },
    { label: 'PLANIFICADO', value: 'PLANIFICADO' },
    { label: 'DEVUELTO', value: 'DEVUELTO' }
  ];

  pdfSeleccionado: File | null = null;

  archivosPDF: File[] = [];

  clienteSeleccionado: any = null;
  mercanciaSeleccionada: any = null;
  contenedorSeleccionado: any = null;
  tipoCargaSeleccionada: any = null;
  tamanoSeleccionado: any = null;
  navieraSeleccionada: any = null;
  origenSeleccionado: any = null;
  destinoSeleccionado: any = null;
  asignacionCargaSeleccionada: any = null;
  estadoSeleccionado: any = null;

  filtroCliente: string = '';
  filtroMercancia: string = '';
  filtroCrt: string = '';
  filtroContenedor: string = '';
  filtroTipoCarga: string = '';
  filtroTamano: string = '';
  filtroPeso: string = '';
  filtroNaviera: string = '';
  filtroOrigen: string = '';
  filtroDestino: string = '';
  filtroAsignacionCarga: string = '';
  filtroFechaCarga: string = '';
  filtroFechaDescarga: string = '';
  filtroEstado: string = '';

  clientesFiltrados: any[] = [];
  mercanciasFiltradas: any[] = [];
  contenedoresFiltrados: any[] = [];
  tiposCargaFiltrados: any[] = [];
  tamanosFiltrados: any[] = [];
  navierasFiltradas: any[] = [];
  origenesFiltrados: any[] = [];
  destinosFiltrados: any[] = [];
  asignacionesCargaFiltradas: any[] = [];
  estadosFiltrados: any[] = [];

  ordenAscendente: boolean = true;

  mostrarDialogPDF = false;
  mostrarDialogImagen: boolean = false;
  mostrarDialogVariosPDF = false;
  pdfSeleccionadoURL: string = '';
  documentoActual: any = null;
  tituloDialogVariosPDF = '';
  documentoSeleccionado: any = null;

  imagenSeleccionadaURL: string = '';

  pdfs: any[] = [];

  mostrarTabla = true;

  actualizar = false;

  opcionesClientes: { label: string; value: number }[] = [];
  opcionesMercancias: String[] = [];
  opcionesContenedores: String[] = [];
  opcionesTipoCarga: { label: string; value: string }[] = [];
  opcionesTamano: String[] = [];
  opcionesNaviera: { label: string; value: number }[] = [];
  opcionesOrigen: { label: string; value: number }[] = [];
  opcionesDestino: { label: string; value: number }[] = [];
  opcionesAsignacionCarga: String[] = [];
  opcionesEstado: { label: string; value: string }[] = [];

  generando: boolean = false;

  bloquearContenedor = false;
  bloquearTamano = false;

  constructor(private despachoService: Despachos_ExpService) { }

  ngOnInit(): void {
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerClientes();
    this.obtenerVehiculos();
    this.obtenerListado();
  }

  alternarVista() {
    this.mostrarTabla = !this.mostrarTabla;
  }

  get despachosFiltrados() {
    return this.despachos.filter(d => {
      const clienteStr = this.getClienteNombre(d.id_cliente)?.toLowerCase() || '';
      const mercanciaStr = d.mercancia?.toLowerCase() || '';
      const crtStr = d.crt?.toLowerCase() || '';
      const contenedorStr = d.numero_contenedor?.toLowerCase() || '';
      const tipoCargaStr = d.tipo_carga?.toLowerCase() || '';
      const tamanoStr = d.tamano?.toLowerCase() || '';
      const pesoStr = d.peso_kg?.toString() || '';
      const navieraStr = this.getNavieraNombre(d.id_naviera)?.toLowerCase() || '';
      const origenStr = this.getCiudadNombre(d.id_ciudad_origen)?.toLowerCase() || '';
      const destinoStr = this.getCiudadNombre(d.id_ciudad_destino)?.toLowerCase() || '';
      const asignacionCargaStr = this.getVehiculoNombre(d.id_asignacion_vehiculo_carga)?.toLowerCase() || '';
      const fechaCargaStr = d.fecha_carga ? new Date(d.fecha_carga).toISOString().split('T')[0] : '';
      const fechaDescargaStr = d.fecha_descarga ? new Date(d.fecha_descarga).toISOString().split('T')[0] : '';
      const estadoStr = d.estado?.toLowerCase() || '';

      return (
        clienteStr.includes(this.filtroCliente.toLowerCase()) &&
        mercanciaStr.includes(this.filtroMercancia.toLowerCase()) &&
        crtStr.includes(this.filtroCrt.toLowerCase()) &&
        contenedorStr.includes(this.filtroContenedor.toLowerCase()) &&
        tipoCargaStr.includes(this.filtroTipoCarga.toLowerCase()) &&
        tamanoStr.includes(this.filtroTamano.toLowerCase()) &&
        pesoStr.includes(this.filtroPeso.toString()) &&
        navieraStr.includes(this.filtroNaviera.toLowerCase()) &&
        origenStr.includes(this.filtroOrigen.toLowerCase()) &&
        destinoStr.includes(this.filtroDestino.toLowerCase()) &&
        asignacionCargaStr.includes(this.filtroAsignacionCarga.toLowerCase()) &&
        fechaCargaStr.includes(this.filtroFechaCarga) &&
        fechaDescargaStr.includes(this.filtroFechaDescarga) &&
        estadoStr.includes(this.filtroEstado.toLowerCase())
      );
    });
  }
  filtrarClientes(event: any) {
    if (this.opcionesClientes.length === 0) {
      const idsclientes = new Set(this.despachos.map(d => d.id_cliente));
      this.opcionesClientes = this.clientes.filter(c => idsclientes.has(c.value));
    }

    const query = event.query.toLowerCase();
    this.clientesFiltrados = this.opcionesClientes.filter(c =>
      c.label.toLowerCase().includes(query)
    );
  }

  filtrarMercancias(event: any) {
    if (this.opcionesMercancias.length === 0 && this.despachos?.length > 0) {

      const lista = this.despachos
        .map(d => d?.mercancia ? String(d.mercancia).trim() : '')
        .filter(c => c !== '');

      // Eliminar repetidos
      this.opcionesMercancias = [...new Set(lista)];
    }

    const query = event.query ? event.query.toLowerCase() : '';

    this.mercanciasFiltradas = this.opcionesMercancias.filter(c =>
      c.toLowerCase().includes(query)
    );
  }

  filtrarContenedores(event: any) {
    // Solo llenar una vez
    if (this.opcionesContenedores.length === 0 && this.despachos?.length > 0) {
      // Convertimos todo a string y filtramos los nulos o vacíos
      this.opcionesContenedores = this.despachos
        .map(d => d?.numero_contenedor ? String(d.numero_contenedor) : '')
        .filter(c => c.trim() !== '');
    }

    const query = event.query ? event.query.toLowerCase() : '';

    this.contenedoresFiltrados = this.opcionesContenedores.filter(c =>
      c?.toLowerCase().includes(query)
    );
  }
  filtrarTiposCarga(event: any) {
    if (this.opcionesTipoCarga.length === 0) {
      const idsTiposCarga = new Set(this.despachos.map(d => d.tipo_carga));
      this.opcionesTipoCarga = this.tipo_carga.filter(m => idsTiposCarga.has(m.value));
    }
    console.log(this.opcionesTipoCarga);

    const query = event.query.toLowerCase();
    this.tiposCargaFiltrados = this.opcionesTipoCarga.filter(m =>
      m.label.toLowerCase().includes(query)
    );
  }
  filtrarTamanos(event: any) {
    if (this.opcionesTamano.length === 0 && this.despachos?.length > 0) {
      // Convertimos todo a string, filtramos nulos o vacíos y quitamos duplicados
      const todas = this.despachos
        .map(d => d?.tamano ? String(d.tamano).trim() : '')
        .filter(c => c !== '');
      this.opcionesTamano = [...new Set(todas)]; // distinct
    }

    const query = (event.query || '').toLowerCase();

    this.tamanosFiltrados = this.opcionesTamano.filter(c =>
      c.toLowerCase().includes(query)
    );
  }
  filtrarNavieras(event: any) {
    if (this.opcionesNaviera.length === 0) {
      const idsNavieras = new Set(this.despachos.map(d => d.id_naviera));
      this.opcionesNaviera = this.navieras.filter(m => idsNavieras.has(m.value));
    }

    const query = event.query.toLowerCase();
    this.navierasFiltradas = this.opcionesNaviera.filter(m =>
      m.label.toLowerCase().includes(query)
    );
  }
  filtrarOrigenes(event: any) {
    if (this.opcionesOrigen.length === 0) {
      const idsOrigenes = new Set(this.despachos.map(d => d.id_ciudad_origen));
      this.opcionesOrigen = this.ciudades.filter(c => idsOrigenes.has(c.value));
    }

    const query = event.query.toLowerCase();
    this.origenesFiltrados = this.opcionesOrigen.filter(c =>
      c.label.toLowerCase().includes(query)
    );
  }
  filtrarDestinos(event: any) {
    if (this.opcionesDestino.length === 0) {
      const idsDestinos = new Set(this.despachos.map(d => d.id_ciudad_destino));
      this.opcionesDestino = this.ciudades.filter(c => idsDestinos.has(c.value));
    }

    const query = event.query.toLowerCase();
    this.destinosFiltrados = this.opcionesDestino.filter(c =>
      c.label.toLowerCase().includes(query)
    );
  }

  filtrarAsignacionesCarga(event: any) {
    if (this.opcionesAsignacionCarga.length === 0 && this.despachos?.length > 0) {
      // Obtenemos nombres de vehículos, filtramos vacíos y quitamos duplicados
      const todas = this.despachos
        .map(d => {
          const nombre = this.getVehiculoNombre(d.id_asignacion_vehiculo_carga);
          return nombre ? String(nombre).trim() : '';
        })
        .filter(c => c !== '');
      this.opcionesAsignacionCarga = [...new Set(todas)]; // distinct
    }

    const query = (event.query || '').toLowerCase();

    this.asignacionesCargaFiltradas = this.opcionesAsignacionCarga.filter(c =>
      c.toLowerCase().includes(query)
    );
  }
  filtrarEstados(event: any) {
    if (this.opcionesEstado.length === 0) {
      const estadosUnicos = new Set(this.despachos.map(d => d.estado));
      this.opcionesEstado = Array.from(estadosUnicos).map(e => ({ label: e, value: e }));
    }

    const query = event.query.toLowerCase();
    this.estadosFiltrados = this.opcionesEstado.filter(e =>
      e.label.toLowerCase().includes(query)
    );
  }

  ordenarDatos() {
    this.despachos.sort((a, b) => {
      const valorA = a.id_despacho; // Cambia 'campoOrdenar' al campo real
      const valorB = b.id_despacho;

      if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
      if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });

    this.ordenAscendente = !this.ordenAscendente; // Cambia orden para próximo clic
  }

  limpiarFiltros() {
    this.filtroCliente = '';
    this.filtroMercancia = '';
    this.filtroContenedor = '';
    this.filtroTipoCarga = '';
    this.filtroTamano = '';
    this.filtroPeso = '';
    this.filtroNaviera = '';
    this.filtroOrigen = '';
    this.filtroDestino = '';
    this.filtroAsignacionCarga = '';
    this.filtroFechaCarga = '';
    this.filtroFechaDescarga = '';
    this.filtroEstado = '';
  }

  isVencido(fecha: string | Date): boolean {
    const hoy = new Date();
    const limite = new Date(fecha);
    // Comparamos solo fechas sin horas
    return limite.getTime() < hoy.setHours(0, 0, 0, 0);
  }

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
    this.despachoSeleccionado[campo] = valorFinal;
  }

  verPdfs(despacho: any, documento: any) {
    this.tituloDialogVariosPDF = documento.nombre;
    this.mostrarDialogVariosPDF = true;
    this.documentoSeleccionado = documento;
    this.despachoSeleccionado = despacho;
    this.obtenerPdfs(documento.id);
  }

  verPdfsDAM(despacho: any) {
    const doc_pago_dam = { id: 'PAGO_DAM', nombre: 'PAGO DAM' };
    this.tituloDialogVariosPDF = doc_pago_dam.nombre;
    this.mostrarDialogVariosPDF = true;
    this.documentoSeleccionado = doc_pago_dam;
    this.despachoSeleccionado = despacho;
    this.obtenerPdfs(doc_pago_dam.id);
  }

  abrirSelectorArchivo(despacho: any) {

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';

    input.onchange = (event: any) => {
      this.onFileSelected(event, despacho, this.documentoSeleccionado);
    };

    input.click();
  }

  verPDF(nombre: any) {
    const url = `${URL_SERVICIOS}/despachos_exp/verPdf/${nombre}`;

    const extension = nombre.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      this.pdfSeleccionadoURL = url;
      this.mostrarDialogPDF = true;
    } else {
      this.imagenSeleccionadaURL = url;
      this.mostrarDialogImagen = true;
    }

    // this.pdfSeleccionadoURL = `${URL_SERVICIOS}/despachos_exp/verPdf/${nombre}`; // ajusta a tu ruta real

    // console.log('PDF URL:', this.pdfSeleccionadoURL);
    // this.mostrarDialogPDF = true;
  }

  subirArchivosDespacho(idDespacho: number) {
    this.archivosPDF.forEach(async (archivo, index) => {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('id_despacho', idDespacho.toString());

      try {
        const respuesta = await axios.post(
          `${URL_SERVICIOS}/despachos_exp/subir_pdf`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log('Archivo subido correctamente', respuesta.data);
      } catch (error) {
        console.error('Error al subir el PDF', error);
      }
    });
  }

  obtenerListado(): void {
    this.despachoService.getDespachos().subscribe({
      next: (data) => {
        this.despachos = data;
        // this.mostrarObservacionesDespachos();
        // this.armarObservacionesAccordion();
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de despachos.', 'error'),
    });
  }

  obtenerCiudades(): void {
    this.despachoService.getCiudad().subscribe({
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
    this.despachoService.getNaviera().subscribe({
      next: (data) => {
        this.navieras = data.map((naviera) => ({
          label: naviera.nombre_comercial,
          value: naviera.id_naviera,
          dias: naviera.dias,
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

  getNavieraDias(id: number): number {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.dias : 20;
  }

  obtenerClientes(): void {
    this.despachoService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((cliente) => ({
          label: cliente.nombre_comercial,
          value: cliente.id_cliente,
        }));
        this.generarClientesUnicos();
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
    this.despachoService.getVehiculos().subscribe({
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
  getVehiculoPlaca(id: number): string {
    const vehiculo = this.vehiculos.find((v) => v.value === id);
    return vehiculo ? vehiculo.label.split('-')[0] : '';
  }

  abrirNuevoDespacho(): void {
    this.despachoSeleccionado = {
      id_cliente: null,
      mercancia: null,
      crt: '',
      numero_contenedor: '',
      tipo_carga: '',
      tamano: '',
      peso_kg: '',
      id_naviera: null,
      fecha_carga: null,
      fecha_descarga: null,
      fecha_stack: null,
      id_ciudad_origen: null,
      id_ciudad_destino: null,
      id_asignacion_vehiculo_carga: null,
      estado: 'EN OFICINA',
      usucre: localStorage.getItem('login'),
      feccre: new Date(),
      id_preasignacion_vehiculo_carga: null,
      despacho_agencia: '',
      despacho_nombre: '',
      despacho_telefono: ''
    };
    this.popupVisible = true;
    this.modoEdicion = false;
    this.tituloPopup = 'Nuevo Despacho';
  }

  editarDespacho(despacho: any): void {
    this.actualizar = true;

    this.despachoSeleccionado = {
      ...despacho,
      fecha_carga: despacho.fecha_carga ? new Date(despacho.fecha_carga) : null,
      fecha_descarga: despacho.fecha_descarga ? new Date(despacho.fecha_descarga) : null,
      fecha_stack: despacho.fecha_stack ? new Date(despacho.fecha_stack) : null
    };

    this.popupVisible = true;
    this.modoEdicion = true;
    this.tituloPopup = 'Editar Despacho';
    this.actualizar = false;
  }

  eliminarDespacho(despacho: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el despacho "${despacho.id_despacho}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.despachoService.eliminarDespacho(despacho.id_despacho).subscribe({
          next: () => {
            this.obtenerListado();
            Swal.fire(
              'Eliminado',
              'Despacho eliminado correctamente.',
              'success'
            );
          },
          error: (err) =>
            Swal.fire('Error', 'No se pudo eliminar el despacho.', 'error'),
        });
      }
    });
  }

  guardarCambios(): void {
    console.log('Guardando cambios:', this.despachoSeleccionado);
    if (this.modoEdicion) {
      this.despachoSeleccionado.usumod = localStorage.getItem('login');
      this.despachoSeleccionado.fecmod = new Date();

      this.despachoService
        .editarDespacho(
          this.despachoSeleccionado.id_despacho,
          this.despachoSeleccionado
        )
        .subscribe({
          next: () => {
            this.popupVisible = false;
            this.obtenerListado();
            Swal.fire(
              'Actualizado',
              'Despacho actualizado correctamente.',
              'success'
            );
          },
          error: (err) =>
            Swal.fire('Error', 'No se pudo actualizar el despacho.', 'error'),
        });
    } else {
      this.despachoService
        .insertarDespacho(this.despachoSeleccionado)
        .subscribe({
          next: (res) => {
            const idDespachoGuardado = res.id_despacho;

            if (this.archivosPDF.length > 0) {
              this.subirArchivosDespacho(idDespachoGuardado);
            }
            this.popupVisible = false;
            this.obtenerListado();
            Swal.fire('Guardado', 'Despacho creado correctamente.', 'success');
          },
          error: (err) =>
            Swal.fire('Error', 'No se pudo crear el despacho.', 'error'),
        });
    }
  }

  estiloFila(despacho: any): string {
    let mensaje = '';

    if (!despacho.estado) return '';
    if (despacho.estado === 'CULMINADO') {
      return 'despacho-culminado'; // Culminado
    }

    //VERIFICA PDFS
    if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
      mensaje = 'PDFs no subidos';
    }

    if (mensaje != '') {
      return 'despacho-faltante';
    } else if (despacho.estado === 'PLANIFICADO') {
      return 'despacho-planificado';
    }
    return 'despacho';
  }

  observacionDespacho(despacho: any): string {
    const mensajes: string[] = [];
    if (despacho.estado === 'CULMINADO') {
      return '';
    } else {

      //VERIFICA PDFS
      if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
        mensajes.push('PDFs no subidos');

      }
      return mensajes.join(', ');
    }
  }

  mostrarObservacionesDespachos() {
    const alertas: string[] = [];

    for (const despacho of this.despachosFiltrados) {
      if (despacho.estado === 'CULMINADO') continue;

      const mensajes: string[] = [];
      // Verifica PDFs
      if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
        mensajes.push('• PDFs no subidos');
      }

      // Si tiene mensajes, lo añadimos a alertas
      if (mensajes.length > 0) {
        const cliente = this.getClienteNombre(despacho.id_cliente) || 'Cliente desconocido';
        const detalle = `🚨 Despacho ${despacho.id_despacho} - ${cliente}\n${mensajes.join('\n')}`;
        alertas.push(detalle);
      }
    }

    // Mostrar si hay alertas
    if (alertas.length > 0) {
      const mensajeFinal = alertas.join('\n\n');
      Swal.fire({
        icon: 'warning',
        title: 'Observaciones de Despachos',
        html: `<pre style="text-align:left;white-space:pre-wrap;">${mensajeFinal}</pre>`,
        confirmButtonText: 'Cerrar',
        customClass: {
          popup: 'swal-wide'
        }
      });
    }
  }

  armarObservacionesAccordion() {
    const gruposMap: { [key: string]: ObservacionItem[] } = {
      '📎 PDFs no subidos': []
    };

    for (const despacho of this.despachosFiltrados) {

      if (despacho.estado === 'CULMINADO') continue;

      const cliente = this.getClienteNombre(despacho.id_cliente) || 'Sin nombre';

      // Verifica PDFs
      if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
        gruposMap['📎 PDFs no subidos'].push({
          id_despacho: despacho.id_despacho,
          cliente,
          detalle: ['PDFs no subidos']
        });
      }
      this.mostrarDialogObservaciones = true;
    }

    // Transformar a array para Accordion
    this.observacionesAgrupadas = Object.keys(gruposMap)
      .map(titulo => ({
        titulo,
        items: gruposMap[titulo]
      }))
      .filter(grupo => grupo.items.length > 0); // eliminar grupos vacíos
  }

  generarClientesUnicos() {
    const idsEnDespachos = new Set(this.despachos.map(d => d.id_cliente));

    this.clientesFiltro = this.clientes
      .filter(c => idsEnDespachos.has(c.value))
      .map(c => ({ label: c.label, value: c.value }));
  }

  onFileSelected(event: Event, despacho: any, documento: any) {
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
              `${despacho.id_despacho}-${documento.id}-${nuevoNombre}.${extension}`,
              { type: file.type }
            );

            formData.append('archivo', nuevoArchivo);
            formData.append('id_despacho', despacho.id_despacho.toString());
            formData.append('documento', documento.id.toString());

            axios.post(`${URL_SERVICIOS}/despachos_exp/subir_pdf`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
              .then(response => {
                Swal.fire('¡Subido!', 'El archivo se subió correctamente.', 'success');
                this.obtenerPdfs(documento.id);
                this.obtenerListado();
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
        this.despachoService.deleteFile(pdf).subscribe({
          next: (res) => {
            console.log(res);
            Swal.fire(
              'Eliminado',
              'El archivo se eliminó correctamente.',
              'success'
            );
            this.obtenerPdfs(this.documentoSeleccionado.id);
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

  exportarDespachosPDF() {
    const content: any[] = [];

    this.despachosFiltrados.forEach((d, i) => {
      // Determinar color de fondo por estado
      let bgColor = '#ffffff'; // despacho normal
      const estilo = this.estiloFila(d);
      if (estilo === 'despacho-culminado') bgColor = '#d7f8da';
      if (estilo === 'despacho-observado') bgColor = '#f8f5d7';
      if (estilo === 'despacho-faltante') bgColor = '#ffe5e5';

      // Construcción de filas (simulando ngIf)
      const col1: any[] = [];
      const col2: any[] = [];

      col1.push({ text: `Cliente: ${this.getClienteNombre(d.id_cliente)}`, style: 'cardTitle' });
      col2.push({ text: `Estado: ${d.estado || '-'}`, style: 'cardText' });

      if (d.tipo_carga) col1.push({ text: `Tipo Carga: ${d.tipo_carga}`, style: 'cardText' });
      if (d.numero_contenedor) col2.push({ text: `Contenedor: ${d.numero_contenedor}`, style: 'cardText' });

      if (d.tamano) col1.push({ text: `Tamaño: ${d.tamano}`, style: 'cardText' });
      if (d.id_naviera) col2.push({ text: `Naviera: ${this.getNavieraNombre(d.id_naviera)}`, style: 'cardText' });

      if (d.peso_kg) col1.push({ text: `Peso (kg): ${d.peso_kg}`, style: 'cardText' });

      if (d.mercancia) col1.push({ text: `Mercancía: ${d.mercancia}`, style: 'cardText' });
      if (d.crt) col2.push({ text: `CRT: ${d.crt}`, style: 'cardText' });

      if (d.id_ciudad_origen) col1.push({ text: `Origen: ${this.getCiudadNombre(d.id_ciudad_origen)}`, style: 'cardText' });
      if (d.id_ciudad_destino) col2.push({ text: `Destino: ${this.getCiudadNombre(d.id_ciudad_destino)}`, style: 'cardText' });

      if (d.fecha_carga) col1.push({ text: `Fecha Carga: ${this.formatFecha(d.fecha_carga)}`, style: 'cardText' });
      if (d.fecha_descarga) col2.push({ text: `Fecha Descarga: ${this.formatFecha(d.fecha_descarga)}`, style: 'cardText' });
      if (d.fecha_stack) col2.push({ text: `Fecha Stack: ${this.formatFecha(d.fecha_stack)}`, style: 'cardText' });

      if (d.id_preasignacion_vehiculo_carga) {
        col1.push({ text: `Preasignación Carga: ${this.getVehiculoNombre(d.id_preasignacion_vehiculo_carga)}`, style: 'cardText' });
      }
      if (d.id_asignacion_vehiculo_carga) {
        col2.push({ text: `Asignación Carga: ${this.getVehiculoNombre(d.id_asignacion_vehiculo_carga)}`, style: 'cardText' });
      }

      if (d.despacho_agencia) col1.push({ text: `Despacho Agencia: ${d.despacho_agencia}`, style: 'cardText' });
      if (d.despacho_nombre) col2.push({ text: `Contacto: ${d.despacho_nombre}`, style: 'cardText' });
      if (d.despacho_telefono) col1.push({ text: `Teléfono: ${d.despacho_telefono}`, style: 'cardText' });

      // Armar la tarjeta
      content.push({
        table: {
          widths: ['50%', '50%'],
          body: [[
            { stack: col1 },
            { stack: col2 }
          ]]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 4,
          paddingBottom: () => 4,
          fillColor: () => bgColor
        },
        margin: [0, 0, 0, 15],
        pageBreak: 'auto'
      });
    });

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [30, 30, 30, 30],
      content,
      styles: {
        cardTitle: {
          fontSize: 13,
          bold: true,
          margin: [0, 0, 0, 6],
          color: '#2255e4'
        },
        cardText: {
          fontSize: 10,
          margin: [0, 2, 0, 2],
          color: '#000'
        }
      }
    };

    pdfMake.createPdf(docDefinition).download('despachos.pdf');
  }


  exportarDespachosExcel() {
    // Transformar datos a un array plano para Excel
    const datosParaExcel = this.despachosFiltrados.map(d => ({
      Cliente: this.getClienteNombre(d.id_cliente),
      Mercancía: d.mercancia,
      Crt: d.crt,
      Contenedor: d.numero_contenedor,
      'Tipo Carga': d.tipo_carga,
      'Tamaño': d.tamano,
      'Naviera': this.getNavieraNombre(d.id_naviera),
      'Peso (kg)': d.peso_kg,
      Origen: this.getCiudadNombre(d.id_ciudad_origen),
      Destino: this.getCiudadNombre(d.id_ciudad_destino),

      'Fecha Carga': this.formatFecha(d.fecha_carga),
      'Fecha Descarga': this.formatFecha(d.fecha_descarga),
      'Fecha Stack': this.formatFecha(d.fecha_stack),

      'Preasignación Carga': !d.id_asignacion_vehiculo_carga ? this.getVehiculoNombre(d.id_preasignacion_vehiculo_carga) : '',
      'Asignación Carga': this.getVehiculoNombre(d.id_asignacion_vehiculo_carga),

      'Agencia': d.despacho_agencia,
      'Agencia Nombre': d.despacho_nombre,
      'Agencia Teléfono': d.despacho_telefono,
      Estado: d.estado
    }));


    // Crear hoja de cálculo desde JSON
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel);

    // Crear libro y añadir la hoja
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Despachos': worksheet },
      SheetNames: ['Despachos']
    };

    // Generar buffer Excel
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Guardar archivo
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0]; // yyyy-MM-dd
    saveAs(dataBlob, `despachos_${fechaStr}.xlsx`);
  }


  formatFecha(fecha: string | Date) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toISOString().split('T')[0]; // yyyy-mm-dd
  }

  obtenerPdfs(nombrePdf: string): void {
    this.despachoService.getPdfs(this.despachoSeleccionado.id_despacho, nombrePdf).subscribe({
      next: data => {
        this.pdfs = data;
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de PDFs.', 'error')
    });
  }

  getDocumentosFiltrados(despacho: any) {
    let docs = this.getCiudadNombre(despacho.id_ciudad_destino) === 'ARICA'
      ? this.documentosRequeridosArica
      : this.documentosRequeridosIquique;

    return docs;
  }

  guardarEstadoDespacho(despacho: any, nuevoEstado: boolean): void {
    console.log('Nuevo estado seleccionado:', nuevoEstado);
    this.despachoSeleccionado = { ...despacho };
    this.despachoSeleccionado.pago_dam = nuevoEstado;
    this.despachoSeleccionado.usumod = localStorage.getItem('login');
    this.despachoSeleccionado.fecmod = new Date();
    this.despachoService
      .editarEstadoDespacho(
        this.despachoSeleccionado.id_despacho,
        this.despachoSeleccionado
      )
      .subscribe({
        next: () => {
          this.obtenerListado();
          Swal.fire(
            'Actualizado',
            'Despacho actualizado correctamente.',
            'success'
          );
        },
        error: (err) =>
          Swal.fire('Error', 'No se pudo actualizar el despacho.', 'error'),
      });
  }

  async generarImagenDespacho(despacho: any, index: number) {
    const element = document.getElementById(`despacho-${index}`);
    if (!element) return;

    this.generando = true;

    element.classList.add('modo-captura');

    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 0.95 });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `despacho_${despacho.id_despacho}.png`;
      link.click();
    } catch (err) {
      console.error("Error al generar imagen", err);
    } finally {
      element.classList.remove('modo-captura');
      this.generando = false;
    }
  }

  actualizarTipoCarga(tipo_carga: string) {
    switch (tipo_carga) {
      case 'CARGA_SUELTA':
        this.bloquearContenedor = true;
        this.bloquearTamano = true;
        setTimeout(() => {
          this.despachoSeleccionado.numero_contenedor = '';
          this.despachoSeleccionado.tamano = '';
        }, 0);
        break;
      default:
        this.bloquearContenedor = false;
        this.bloquearTamano = false;
    }
  }

}
