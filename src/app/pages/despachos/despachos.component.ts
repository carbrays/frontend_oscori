import { Component, OnInit } from '@angular/core';
import { DespachosService } from 'src/app/services/despachos/despachos.service';
import Swal from 'sweetalert2';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';
import { identifierName } from '@angular/compiler';

import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-despachos',
  templateUrl: './despachos.component.html',
  styleUrls: ['./despachos.component.css'],
})
export class DespachosComponent implements OnInit {
  despachos: any[] = [];
  despachoSeleccionado: any = {};
  popupVisible = false;
  modoEdicion = false;
  tituloPopup = 'Despacho';

  ciudades: { label: string; value: number }[] = [];
  navieras: { label: string; value: number; dias: number }[] = [];
  mercancias: { label: string; value: number }[] = [];
  clientes: { label: string; value: number }[] = [];
  clientesFiltro: { label: string; value: number }[] = [];
  vehiculos: { label: string; value: number }[] = [];

  tipo_carga = [
    { label: 'DESCONSOLIDADO', value: 'DESCONSOLIDADO' },
    { label: 'CARGA SUELTA', value: 'CARGA_SUELTA' },
    { label: 'CONTENEDOR', value: 'CONTENEDOR' },
  ];

  documentosRequeridosArica = [
    { id: 'BL', nombre: 'BL' },
    { id: 'FACTURA_COMERCIAL', nombre: 'FACTURA COMERCIAL' },
    { id: 'LISTA_EMPAQUE', nombre: 'LISTA EMPAQUE' },
    { id: 'DAM', nombre: 'DAM' },
    { id: 'DIM', nombre: 'DIM' },
    { id: 'GOC_ASPB', nombre: 'GOC ASPB' },
    { id: 'PERMISOS', nombre: 'PERMISOS' },
    { id: 'LIBERACION', nombre: 'LIBERACION' },
    { id: 'MCC', nombre: 'MCC' },
  ];

  documentosRequeridosIquique = [
    { id: 'BL', nombre: 'BL' },
    { id: 'FACTURA_COMERCIAL', nombre: 'FACTURA COMERCIAL' },
    { id: 'LISTA_EMPAQUE', nombre: 'LISTA EMPAQUE' },
    { id: 'DAM', nombre: 'DAM' },
    { id: 'DIM', nombre: 'DIM' },
    { id: 'CERTIFICADO_COSTO_0_ITI', nombre: 'COSTO 0 ITI' },
    { id: 'PERMISOS', nombre: 'PERMISOS' },
    { id: 'LIBERACION', nombre: 'LIBERACION' },
    { id: 'DRESS', nombre: 'DRESS' },
    { id: 'CONVENIO_ITI', nombre: 'CONVENIO ITI' },
    { id: 'MCC', nombre: 'MCC' },
  ];

  tipo_despacho_aduanero = [
    { label: 'GENERAL', value: 'GENERAL' },
    { label: 'ANTICIPADO', value: 'ANTICIPADO' },
    { label: 'INMEDIATO', value: 'INMEDIATO' },
  ];

  tipo_despacho_aduanero_general = [
    { label: 'SOBRE CARRO', value: 'SOBRE_CARRO' },
    { label: 'CON DESCARGA', value: 'CON_DESCARGA' },
    { label: 'ABREVIADO', value: 'ABREVIADO' },
  ];

  tipo_despacho_portuario = [
    { label: 'DIRECTO', value: 'DIRECTO' },
    { label: 'INDIRECTO ANTICIPADO', value: 'INDIRECTO ANTICIPADO' },
    { label: 'INDIRECTO', value: 'INDIRECTO' },
  ];

  tipo_deposito_aduanero = [
    { label: 'TEMPORAL', value: 'TEMPORAL' },
    { label: 'TRANSITORIO', value: 'TRANSITORIO' },
    { label: 'ESPECIAL', value: 'ESPECIAL' },
  ];

  estados = [
    { label: 'EN OFICINA', value: 'EN OFICINA' },
    { label: 'PLANIFICADO', value: 'PLANIFICADO' },
    { label: 'DEVUELTO', value: 'DEVUELTO' }
  ];

  pdfSeleccionado: File | null = null;

  archivosPDF: File[] = [];

  filtroCliente: string = '';
  filtroMercancia: string = '';
  filtroContenedor: string = '';
  filtroTipoCarga: string = '';
  filtroDescripcion: string = '';
  filtroBlMadre: string = '';
  filtroFechaBlMadre: string = '';
  filtroBlHijo: string = '';
  filtroFechaBlHijo: string = '';
  filtroDam: string = '';
  filtroFechaDam: string = '';
  filtroEmbalaje: string = '';
  filtroPeso: string = '';
  filtroVolumen: string = '';
  filtroNaviera: string = '';
  filtroOrigen: string = '';
  filtroDestino: string = '';
  filtroDespachoPortuario: string = '';
  filtroDespachoAduanero: string = '';
  filtroDespachoAduaneroGeneral: string = '';
  filtroDepositoAduanero: string = '';
  filtroAsignacionCarga: string = '';
  filtroFechaCarga: string = '';
  filtroAsignacionDescarga: string = '';
  filtroFechaDescarga: string = '';
  filtroEstado: string = '';

  ordenAscendente: boolean = true;

  bloquearOrigen = false;
  bloquearPrecintoArica = false;
  bloquearPrecintoIquique = false;
  bloquearDespachoGeneral = false;
  bloquearDespachoPortuario = false;

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

  opcionesClientes: string[] = [];
  opcionesTipoCarga: string[] = [];
  opcionesDescripcion: string[] = [];
  opcionesNaviera: string[] = [];
  opcionesOrigen: string[] = [];
  opcionesDestino: string[] = [];
  opcionesDespachoPortuario: string[] = [];
  opcionesDespachoAduanero: string[] = [];
  opcionesDespachoAduaneroGeneral: string[] = [];
  opcionesDepositoAduanero: string[] = [];
  opcionesAsignacionCarga: string[] = [];
  opcionesEstado: string[] = [];

  generando: boolean = false;

  constructor(private despachoService: DespachosService) { }

  ngOnInit(): void {
    this.obtenerListado();
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerMercancias();
    this.obtenerClientes();
    this.obtenerVehiculos();
    // this.llenarOpcionesUnicas();
  }

  alternarVista() {
    this.mostrarTabla = !this.mostrarTabla;
  }

  get despachosFiltrados() {
    return this.despachos.filter(d => {
      const clienteStr = this.getClienteNombre(d.id_cliente)?.toLowerCase() || '';
      const mercanciaStr = this.getMercanciaNombre(d.id_mercancia)?.toLowerCase() || '';
      const contenedorStr = d.numero_contenedor?.toLowerCase() || '';
      const tipoCargaStr = d.id_tipo_carga?.toLowerCase() || '';
      const descripcionStr = d.descripcion_carga?.toLowerCase() || '';
      const blMadreStr = d.bl_madre?.toLowerCase() || '';
      const blHijoStr = d.bl_hijo?.toLowerCase() || '';
      const damStr = d.dam?.toLowerCase() || '';
      const embalajeStr = d.embalaje?.toLowerCase() || '';
      const pesoStr = d.peso_kg?.toString() || '';
      const volumenStr = d.volumen_m3?.toString() || '';
      const navieraStr = this.getNavieraNombre(d.id_naviera)?.toLowerCase() || '';
      const origenStr = this.getCiudadNombre(d.id_ciudad_origen)?.toLowerCase() || '';
      const destinoStr = this.getCiudadNombre(d.id_ciudad_destino)?.toLowerCase() || '';
      const despachoPortuarioStr = d.id_despacho_portuario?.toLowerCase() || '';
      const despachoAduaneroStr = d.id_despacho_aduanero?.toLowerCase() || '';
      const despachoAduaneroGenStr = d.id_despacho_aduanero_general?.toLowerCase() || '';
      const depositoAduaneroStr = d.id_deposito_aduanero?.toLowerCase() || '';
      const asignacionCargaStr = this.getVehiculoNombre(d.id_asignacion_vehiculo_carga)?.toLowerCase() || '';
      const fechaCargaStr = d.fecha_carga ? new Date(d.fecha_carga).toISOString().split('T')[0] : '';
      const asignacionDescargaStr = this.getVehiculoNombre(d.id_asignacion_vehiculo_descarga)?.toLowerCase() || '';
      const fechaDescargaStr = d.fecha_descarga ? new Date(d.fecha_descarga).toISOString().split('T')[0] : '';
      const estadoStr = d.estado?.toLowerCase() || '';

      return (
        clienteStr.includes(this.filtroCliente.toLowerCase()) &&
        mercanciaStr.includes(this.filtroMercancia.toLowerCase()) &&
        contenedorStr.includes(this.filtroContenedor.toLowerCase()) &&
        tipoCargaStr.includes(this.filtroTipoCarga.toLowerCase()) &&
        descripcionStr.includes(this.filtroDescripcion.toLowerCase()) &&
        blMadreStr.includes(this.filtroBlMadre.toLowerCase()) &&
        (this.filtroFechaBlMadre ? fechaCargaStr === this.filtroFechaBlMadre : true) &&
        blHijoStr.includes(this.filtroBlHijo.toLowerCase()) &&
        (this.filtroFechaBlHijo ? fechaDescargaStr === this.filtroFechaBlHijo : true) &&
        damStr.includes(this.filtroDam.toLowerCase()) &&
        (this.filtroFechaDam ? fechaDescargaStr === this.filtroFechaDam : true) &&
        embalajeStr.includes(this.filtroEmbalaje.toLowerCase()) &&
        pesoStr.includes(this.filtroPeso.toString()) &&
        volumenStr.includes(this.filtroVolumen.toString()) &&
        navieraStr.includes(this.filtroNaviera.toLowerCase()) &&
        origenStr.includes(this.filtroOrigen.toLowerCase()) &&
        destinoStr.includes(this.filtroDestino.toLowerCase()) &&
        despachoPortuarioStr.includes(this.filtroDespachoPortuario.toLowerCase()) &&
        despachoAduaneroStr.includes(this.filtroDespachoAduanero.toLowerCase()) &&
        despachoAduaneroGenStr.includes(this.filtroDespachoAduaneroGeneral.toLowerCase()) &&
        depositoAduaneroStr.includes(this.filtroDepositoAduanero.toLowerCase()) &&
        asignacionCargaStr.includes(this.filtroAsignacionCarga.toLowerCase()) &&
        fechaCargaStr.includes(this.filtroFechaCarga) &&
        asignacionDescargaStr.includes(this.filtroAsignacionDescarga.toLowerCase()) &&
        fechaDescargaStr.includes(this.filtroFechaDescarga) &&
        estadoStr.includes(this.filtroEstado.toLowerCase())
      );
    });
  }

  llenarOpcionesUnicas() {
    const idsclientes = new Set(this.despachos.map(d => d.id_cliente));
    this.opcionesClientes = Array.from(
      new Set(
        this.clientes
          .filter(c => idsclientes.has(c.value))
          .map(c => c.label)
      )
    );
    this.opcionesTipoCarga = [...new Set(this.despachos.map(d => d.tipo_carga))];
    this.opcionesDescripcion = [...new Set(this.despachos.map(d => d.descripcion))];
    const idsnavieras = new Set(this.despachos.map(d => d.id_naviera));
    this.opcionesNaviera = Array.from(
      new Set(
        this.navieras
          .filter(n => idsnavieras.has(n.value))
          .map(n => n.label)
      )
    );
    const idsorigen = new Set(this.despachos.map(d => d.id_ciudad_origen));
    this.opcionesOrigen = Array.from(
      new Set(
        this.ciudades
          .filter(c => idsorigen.has(c.value))
          .map(c => c.label)
      )
    );
    const idsdestino = new Set(this.despachos.map(d => d.id_ciudad_destino));
    this.opcionesDestino = Array.from(
      new Set(
        this.ciudades
          .filter(c => idsdestino.has(c.value))
          .map(c => c.label)
      )
    );
    this.opcionesDespachoPortuario = [...new Set(this.despachos.map(d => d.despacho_portuario))];
    this.opcionesDespachoAduanero = [...new Set(this.despachos.map(d => d.despacho_aduanero))];
    this.opcionesDespachoAduaneroGeneral = [...new Set(this.despachos.map(d => d.despacho_aduanero_general))];
    this.opcionesDepositoAduanero = [...new Set(this.despachos.map(d => d.deposito_aduanero))];
    const idsvehiculos = new Set(this.despachos.map(d => d.id_asignacion_vehiculo_carga));
    this.opcionesAsignacionCarga = Array.from(
      new Set(
        this.vehiculos
          .filter(v => idsvehiculos.has(v.value))
          .map(v => v.label)
      )
    );
    this.opcionesEstado = [...new Set(this.despachos.map(d => d.estado))];
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
    this.filtroDescripcion = '';
    this.filtroBlMadre = '';
    this.filtroFechaBlMadre = '';
    this.filtroBlHijo = '';
    this.filtroFechaBlHijo = '';
    this.filtroDam = '';
    this.filtroFechaDam = '';
    this.filtroEmbalaje = '';
    this.filtroPeso = '';
    this.filtroVolumen = '';
    this.filtroNaviera = '';
    this.filtroOrigen = '';
    this.filtroDestino = '';
    this.filtroDespachoPortuario = '';
    this.filtroDespachoAduanero = '';
    this.filtroDespachoAduaneroGeneral = '';
    this.filtroDepositoAduanero = '';
    this.filtroAsignacionCarga = '';
    this.filtroFechaCarga = '';
    this.filtroAsignacionDescarga = '';
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
    const url = `${URL_SERVICIOS}/despachos/verPdf/${nombre}`;

    const extension = nombre.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      this.pdfSeleccionadoURL = url;
      this.mostrarDialogPDF = true;
    } else {
      this.imagenSeleccionadaURL = url;
      this.mostrarDialogImagen = true;
    }

    // this.pdfSeleccionadoURL = `${URL_SERVICIOS}/despachos/verPdf/${nombre}`; // ajusta a tu ruta real

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
          `${URL_SERVICIOS}/despachos/subir_pdf`,
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
        console.log('Despachos cargados:', this.despachos);
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

  obtenerMercancias(): void {
    this.despachoService.getMercancia().subscribe({
      next: (data) => {
        this.mercancias = data.map((mercancia) => ({
          label: mercancia.mercancia,
          value: mercancia.id_mercancia,
        }));
        console.log('Mercancías cargadas:', this.mercancias);
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
    this.despachoService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((cliente) => ({
          label: cliente.nombre_comercial,
          value: cliente.id_cliente,
        }));
        this.generarClientesUnicos();
        this.mostrarObservacionesDespachos();
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

  abrirNuevoDespacho(): void {
    this.despachoSeleccionado = {
      id_cliente: null,
      id_mercancia: null,
      id_contenedor: '',
      numero_contenedor: '',
      tipo_carga: '',
      descripcion_carga: '',
      bl_madre: '',
      peso_kg: '',
      id_naviera: null,
      id_despacho_portuario: '',
      fecha_llegada: null,
      fecha_limite: null,
      id_ciudad_origen: null,
      id_ciudad_destino: null,
      id_despacho_aduanero: '',
      id_asignacion_vehiculo_carga: null,
      fecha_carga: null,
      id_asignacion_vehiculo_descarga: null,
      fecha_descarga: null,
      descripcion: '',
      estado: 'EN OFICINA',
      usucre: localStorage.getItem('login'),
      feccre: new Date(),
      volumen_m3: null,
      bl_hijo: '',
      fecha_bl_madre: null,
      fecha_bl_hijo: null,
      dam: '',
      fecha_dam: null,
      embalaje: '',
      id_deposito_aduanero: '',
      id_despacho_aduanero_general: '',
      permisos: false,
      precinto: '',
      precinto_gog: '',
      precinto_dress: '',
      bl_nieto: '',
      fecha_bl_nieto: null,
      id_preasignacion_vehiculo_carga: null,
      autorizado: false,
      pago_dam: false
    };
    this.popupVisible = true;
    this.modoEdicion = false;
    this.tituloPopup = 'Nuevo Despacho';
  }

  editarDespacho(despacho: any): void {
    this.actualizar = true;

    this.despachoSeleccionado = {
      ...despacho, fecha_llegada: despacho.fecha_llegada ? new Date(despacho.fecha_llegada) : null,
      fecha_limite: despacho.fecha_limite ? new Date(despacho.fecha_limite) : null,
      fecha_carga: despacho.fecha_carga ? new Date(despacho.fecha_carga) : null,
      fecha_descarga: despacho.fecha_descarga ? new Date(despacho.fecha_descarga) : null,
      fecha_bl_madre: despacho.fecha_bl_madre ? new Date(despacho.fecha_bl_madre) : null,
      fecha_bl_hijo: despacho.fecha_bl_hijo ? new Date(despacho.fecha_bl_hijo) : null,
      fecha_dam: despacho.fecha_dam ? new Date(despacho.fecha_dam) : null,
    };
    this.actualizarOrigen(despacho.id_ciudad_origen);
    this.actualizarDespachoPortuario(despacho.id_despacho_portuario);
    this.actualizarDespacho(despacho.id_despacho_aduanero);

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
        this.despachoService.eliminarDespacho(despacho.id_despacho, despacho.id_contenedor).subscribe({
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

  calcularFechaLimite(fechaLlegada: Date) {
    if (!fechaLlegada) return;

    const fechaLimite = new Date(fechaLlegada);
    console.log('Días para fecha límite:', this.getNavieraDias(this.despachoSeleccionado.id_naviera));
    fechaLimite.setDate(fechaLimite.getDate() + this.getNavieraDias(this.despachoSeleccionado.id_naviera));

    this.despachoSeleccionado.fecha_limite = fechaLimite;
  }

  estiloFila(despacho: any): string {
    let mensaje = '';

    if (!despacho.estado) return '';
    if (despacho.estado === 'CULMINADO') {
      return 'despacho-culminado'; // Culminado
    }

    //VERIFICA FECHA BL MADRE
    if (!despacho.fecha_bl_madre) {
      if (!despacho.fecha_bl_hijo) {
        if (!despacho.fecha_bl_nieto) {
          mensaje = 'fecha BL no definida';
        }
      }
    }
    if (!despacho.fecha_dam) {
      mensaje = 'fecha DAM no definida';
    }

    if ((despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto) && despacho.fecha_dam) {
      const fechaDam = new Date(despacho.fecha_dam);
      const fechaBL = new Date(despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto);

      const nuevaFechaBL = new Date(fechaBL);
      nuevaFechaBL.setDate(nuevaFechaBL.getDate() + 20);

      if ((fechaDam.getTime() > nuevaFechaBL.getTime()) && (!despacho.pago_dam)) {
        mensaje = 'CONTRAVENCION';
        return 'despacho-observado';
      }
    }

    //VERIFICA PDFS
    if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
      mensaje = 'PDFs no subidos';

    } else if (!despacho.archivosSubidos.includes('FACTURA_COMERCIAL')) {
      mensaje = 'FACTURA COMERCIAL no subida';
    }

    if (mensaje != '') {
      return 'despacho-faltante';
    }
    return 'despacho';
  }

  observacionDespacho(despacho: any): string {
    const mensajes: string[] = [];
    if (despacho.estado === 'CULMINADO') {
      return '';
    } else {
      //VERIFICA FECHA BL MADRE
      if (!despacho.fecha_bl_madre) {
        if (!despacho.fecha_bl_hijo) {
          if (!despacho.fecha_bl_nieto) {
            mensajes.push('fecha BL no definida');
          }
        }
      } else {
        if (!despacho.fecha_dam) {
          mensajes.push('fecha DAM no definida');
        } else {
          const fechaDam = new Date(despacho.fecha_dam);
          const fechaBL = new Date(despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto);

          const nuevaFechaBL = new Date(fechaBL);
          nuevaFechaBL.setDate(nuevaFechaBL.getDate() + 20);

          if ((fechaDam.getTime() > nuevaFechaBL.getTime()) && (!despacho.pago_dam)) {
            mensajes.push('CONTRAVENCION');
          }
        }
      }

      //VERIFICA PDFS
      if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
        mensajes.push('PDFs no subidos');

      } else if (!despacho.archivosSubidos.includes('FACTURA_COMERCIAL')) {
        mensajes.push('FACTURA COMERCIAL no subida');

      }
      return mensajes.join(', ');
    }
  }

  mostrarObservacionesDespachos() {
    const alertas: string[] = [];

    for (const despacho of this.despachosFiltrados) {
      if (despacho.estado === 'CULMINADO') continue;

      const mensajes: string[] = [];

      // Verifica FECHA BL MADRE
      if (!despacho.fecha_bl_madre) {
        if (!despacho.fecha_bl_hijo) {
          if (!despacho.fecha_bl_nieto) {
            mensajes.push('• Fecha BL no definida');
          }
        }
      } else {
        if (!despacho.fecha_dam) {
          mensajes.push('• Fecha DAM no definida');
        } else {
          const fechaDam = new Date(despacho.fecha_dam);
          const fechaBL = new Date(despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto);

          const nuevaFechaBL = new Date(fechaBL);
          nuevaFechaBL.setDate(nuevaFechaBL.getDate() + 20);

          if ((nuevaFechaBL.getTime() > fechaDam.getTime()) && (!despacho.pago_dam)) {
            mensajes.push('• CONTRAVENCION');
          }
        }
      }

      // Verifica PDFs
      if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
        mensajes.push('• PDFs no subidos');
      } else {
        if (!despacho.archivosSubidos.includes('FACTURA COMERCIAL')) {
          mensajes.push('• FACTURA COMERCIAL no subida');
        }
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


  generarClientesUnicos() {
    const idsEnDespachos = new Set(this.despachos.map(d => d.id_cliente));

    this.clientesFiltro = this.clientes
      .filter(c => idsEnDespachos.has(c.value))
      .map(c => ({ label: c.label, value: c.value }));
  }

  actualizarOrigen(despacho: string) {
    const origen = this.getCiudadNombre(Number(despacho));
    switch (origen) {
      case 'IQUIQUE':
        this.bloquearOrigen = false;
        break;
      default:
        this.bloquearOrigen = true;
        if (!this.actualizar) {
          setTimeout(() => {
            this.despachoSeleccionado.id_despacho_portuario = '';
          }, 0);
        }

    }
    if (origen === 'ARICA') {
      this.bloquearPrecintoArica = false;
      this.bloquearPrecintoIquique = true;
    } else if (origen === 'IQUIQUE') {
      this.bloquearPrecintoIquique = false;
      this.bloquearPrecintoArica = true;
    } else {
      this.bloquearPrecintoArica = true;
      this.bloquearPrecintoIquique = true;
    }
  }

  actualizarDespachoPortuario(despacho: string) {
    switch (despacho) {
      case 'INDIRECTO ANTICIPADO':
        this.bloquearDespachoPortuario = false;
        break;
      default:
        this.bloquearDespachoPortuario = true;
        if (!this.actualizar) {
          setTimeout(() => {
            this.despachoSeleccionado.id_despacho_aduanero = '';
            this.despachoSeleccionado.id_despacho_aduanero_general = '';
          }, 0);
        }

    }
  }

  actualizarDespacho(despacho: string) {
    switch (despacho) {
      case 'GENERAL':
        this.bloquearDespachoGeneral = false;
        break;
      default:
        this.bloquearDespachoGeneral = true;
        if (!this.actualizar) {
          setTimeout(() => {
            this.despachoSeleccionado.id_despacho_aduanero_general = '';
          }, 0);
        }

    }
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

            axios.post(`${URL_SERVICIOS}/despachos/subir_pdf`, formData, {
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

  generarPDF() {
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Hola, este es un PDF generado con pdfmake', fontSize: 16 },
        { text: 'Puedes agregar párrafos, tablas, imágenes y más.', margin: [0, 10, 0, 0] }
      ]
    };

    pdfMake.createPdf(docDefinition).download('archivo.pdf');
  }

  exportarDespachosPDF() {
    const content: any[] = [];

    this.despachosFiltrados.forEach((d, i) => {
      content.push(
        { text: `Despacho #${i + 1}`, style: 'header' },
        { text: `Cliente: ${this.getClienteNombre(d.id_cliente)}` },
        { text: `Tipo Carga: ${d.id_tipo_carga}` },
        { text: `Contenedor: ${d.numero_contenedor}` },
        { text: `Peso (kg): ${d.peso_kg}` },
        { text: `Origen: ${this.getCiudadNombre(d.id_ciudad_origen)}` },
        { text: `Destino: ${this.getCiudadNombre(d.id_ciudad_destino)}` },
        { text: `Fecha Llegada: ${this.formatFecha(d.fecha_llegada)}` },
        { text: `Fecha Límite: ${this.formatFecha(d.fecha_limite)}` },
        { text: `Descripción Adicional: ${d.descripcion}`, margin: [0, 0, 0, 10] },
        { text: '----------------------------------------------', margin: [0, 0, 0, 10] }
      );
    });

    const docDefinition: TDocumentDefinitions = {
      content: content,
      styles: {
        header: {
          fontSize: 14,
          bold: true,
          margin: [0, 5, 0, 10]
        }
      }
    };

    pdfMake.createPdf(docDefinition).download('despachos.pdf');
  }

  exportarDespachosExcel() {
    // Transformar datos a un array plano para Excel
    const datosParaExcel = this.despachosFiltrados.map(d => ({
      Cliente: this.getClienteNombre(d.id_cliente),
      Mercancía: this.getMercanciaNombre(d.id_mercancia),
      Contenedor: d.numero_contenedor,
      'Tipo Carga': d.id_tipo_carga,
      'Descripción Carga': d.descripcion_carga,
      'BL Madre': d.bl_madre,
      'Fecha BL Madre': this.formatFecha(d.fecha_bl_madre),
      'BL Hijo': d.bl_hijo,
      'Fecha BL Hijo': this.formatFecha(d.fecha_bl_hijo),
      DAM: d.dam,
      'Fecha DAM': this.formatFecha(d.fecha_dam),
      Embalaje: d.embalaje,
      'Peso (kg)': d.peso_kg,
      'Volumen (m³)': d.volumen_m3,
      Naviera: this.getNavieraNombre(d.id_naviera),
      Origen: this.getCiudadNombre(d.id_ciudad_origen),
      Destino: this.getCiudadNombre(d.id_ciudad_destino),
      'Despacho Portuario': d.id_despacho_portuario,
      'Despacho Aduanero': d.id_despacho_aduanero,
      'Despacho Aduanero General': d.id_despacho_aduanero_general,
      'Depósito Aduanero': d.id_deposito_aduanero,
      Vehículo: this.getVehiculoNombre(d.id_asignacion_vehiculo_carga),
      'Fecha Carga': this.formatFecha(d.fecha_carga),
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
    let docs = this.getCiudadNombre(despacho.id_ciudad_origen) === 'ARICA'
      ? this.documentosRequeridosArica
      : this.documentosRequeridosIquique;

    // Filtra lo que no quieres mostrar
    if (despacho.id_despacho_aduanero_general === 'CON_DESCARGA') {
      docs = docs.filter(doc => doc.nombre !== 'DIM');
    }
    if (!despacho.permisos && despacho.permisos !== true) {
      docs = docs.filter(doc => doc.nombre !== 'PERMISOS');
    }

    return docs;

  }

  esContravencion(despacho: any): boolean {
    if ((despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto) && despacho.fecha_dam) {
      const fechaDam = new Date(despacho.fecha_dam);
      const fechaBL = new Date(despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto);

      const nuevaFechaBL = new Date(fechaBL);
      nuevaFechaBL.setDate(nuevaFechaBL.getDate() + 20);

      if (fechaDam.getTime() > nuevaFechaBL.getTime()) {
        return true; // hay contravención
      }
    }
    return false; // no hay
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

  // async generarImagenDespacho(despacho: any, index: number) {
  //   this.generando = true;
  // const element = document.getElementById(`despacho-${index}`);
  // if (!element) return;

  // setTimeout(async () => {
  // try {
  //   // const canvas = await html2canvas(element, { scale: 1 });
  //   const canvas = await html2canvas(element);
  //   const imgData = canvas.toDataURL('image/png');

  //   // Descargar la imagen
  //   const link = document.createElement('a');
  //   link.href = imgData;
  //   link.download = `despacho_${despacho.id_despacho}.png`;
  //   link.click();

  //   // También podrías enviarla al backend aquí
  //   // this.enviarImagenWhatsApp(despacho, imgData);

  // } catch (err) {
  //   console.error("Error al generar la imagen", err);
  // } finally {
  //   this.generando = false; // 👉 desactiva overlay
  // }
  // }, 100);

  // if (element) {
  //   html2canvas(element).then(canvas => {
  //     const imgData = canvas.toDataURL('image/png'); // Base64

  //     // 👉 Aquí ya tienes la imagen lista
  //     // Puedes descargarla o mandarla al backend
  //     console.log(imgData);

  //     // Opción: descargar local
  //     const link = document.createElement('a');
  //     link.href = imgData;
  //     link.download = `despacho_${despacho.id_despacho}.png`;
  //     link.click();
  //   });
  // }
  // }

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

  generarPdfCards() {
  const data = document.getElementById('contenedor-despachos'); // el div que envuelve todas tus cards
  if (!data) return;

  html2canvas(data, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`despachos_${new Date().toISOString().split('T')[0]}.pdf`);
  });
}

}
