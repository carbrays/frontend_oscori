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
import { forkJoin } from 'rxjs';

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
  selector: 'app-despachos',
  templateUrl: './despachos.component.html',
  styleUrls: ['./despachos.component.css'],
})
export class DespachosComponent implements OnInit {

  observacionesAgrupadas: ObservacionGrupo[] = [];
  mostrarDialogObservaciones: boolean = false;

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
    { id: 'MIC_CRT', nombre: 'MIC-CRT' },
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
    { id: 'MIC_CRT', nombre: 'MIC-CRT' },
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

  aduanas = [
  { label: '071 - AGENCIA EXTERIOR MATARANI', value: '071' },
  { label: '072 - AGENCIA EXTERIOR ARICA', value: '072' },
  { label: '073 - AGENCIA EXTERIOR MATARANI-ILO', value: '073' },

  { label: '101 - INTERIOR SUCRE', value: '101' },
  { label: '102 - ADUANA ESPECIALIZADA INTERIOR SUCRE', value: '102' },
  { label: '111 - AEROPUERTO SUCRE', value: '111' },

  { label: '201 - INTERIOR LA PAZ', value: '201' },
  { label: '202 - ADUANA ESPECIALIZADA INTERIOR LA PAZ', value: '202' },
  { label: '211 - AEROPUERTO EL ALTO', value: '211' },
  { label: '221 - FRONTERA CHARAÑA', value: '221' },
  { label: '231 - ZONA FRANCA COMERCIAL EL ALTO', value: '231' },
  { label: '232 - ZONA FRANCA INDUSTRIAL EL ALTO', value: '232' },
  { label: '234 - ZONA FRANCA INDUSTRIAL PATACAMAYA', value: '234' },
  { label: '235 - ZONA FRANCA COMERCIAL PATACAMAYA', value: '235' },
  { label: '241 - FRONTERA DESAGUADERO', value: '241' },
  { label: '242 - FRONTERA KASANI', value: '242' },
  { label: '243 - CENTRO DE ATENCIÓN BINACIONAL EN FRONTERA (CEBAF)', value: '243' },
  { label: '244 - FRONTERA PUERTO ACOSTA', value: '244' },
  { label: '261 - POSTAL LA PAZ', value: '261' },

  { label: '301 - INTERIOR COCHABAMBA', value: '301' },
  { label: '302 - ADUANA ESPECIALIZADA INTERIOR COCHABAMBA', value: '302' },
  { label: '311 - AEROPUERTO COCHABAMBA', value: '311' },
  { label: '361 - POSTAL COCHABAMBA', value: '361' },

  { label: '401 - INTERIOR ORURO', value: '401' },
  { label: '402 - ADUANA ESPECIALIZADA INTERIOR ORURO', value: '402' },
  { label: '421 - FRONTERA PISIGA', value: '421' },
  { label: '422 - FRONTERA TAMBO QUEMADO', value: '422' },
  { label: '431 - ZONA FRANCA COMERCIAL ORURO', value: '431' },
  { label: '432 - ZONA FRANCA INDUSTRIAL ORURO', value: '432' },

  { label: '501 - INTERIOR POTOSÍ', value: '501' },
  { label: '502 - ADUANA ESPECIALIZADA INTERIOR POTOSÍ', value: '502' },
  { label: '521 - FRONTERA VILLAZON', value: '521' },
  { label: '542 - FRONTERA APACHETA - HITO CAJONES', value: '542' },
  { label: '543 - FRONTERA AVAROA', value: '543' },

  { label: '601 - INTERIOR TARIJA', value: '601' },
  { label: '602 - ADUANA ESPECIALIZADA INTERIOR TARIJA', value: '602' },
  { label: '611 - AEROPUERTO TARIJA', value: '611' },
  { label: '621 - FRONTERA YACUIBA', value: '621' },
  { label: '622 - FRONTERA PICADA SUCRE', value: '622' },
  { label: '631 - ZONA FRANCA COMERCIAL YACUIBA', value: '631' },
  { label: '641 - FRONTERA BERMEJO', value: '641' },
  { label: '643 - FRONTERA CAÑADA ORURO', value: '643' },

  { label: '701 - INTERIOR SANTA CRUZ', value: '701' },
  { label: '702 - ADUANA ESPECIALIZADA INTERIOR SANTA CRUZ', value: '702' },
  { label: '711 - AEROPUERTO VIRU VIRU', value: '711' },
  { label: '712 - AEROPUERTO PUERTO SUAREZ', value: '712' },
  { label: '721 - FRONTERA PUERTO SUAREZ', value: '721' },
  { label: '722 - FRONTERA ARROYO CONCEPCIÓN', value: '722' },
  { label: '732 - ZONA FRANCA COMERCIAL SANTA CRUZ', value: '732' },
  { label: '734 - ZONA FRANCA COMERCIAL PUERTO SUAREZ', value: '734' },
  { label: '735 - ZONA FRANCA COMERCIAL WINNER', value: '735' },
  { label: '736 - ZONA FRANCA INDUSTRIAL PUERTO SUAREZ', value: '736' },
  { label: '737 - ZONA FRANCA INDUSTRIAL WINNER', value: '737' },
  { label: '738 - ZONA FRANCA INDUSTRIAL SANTA CRUZ', value: '738' },
  { label: '741 - FRONTERA SAN MATÍAS', value: '741' },
  { label: '743 - FRONTERA SAN VICENTE', value: '743' },
  { label: '751 - ADMINISTRACION DE ADUANA FLUVIAL PUERTO JENNEFER', value: '751' },
  { label: '752 - PUNTO DE CONTROL EL FARO', value: '752' },
  { label: '761 - POSTAL SANTA CRUZ', value: '761' },

  { label: '801 - INTERIOR TRINIDAD', value: '801' },
  { label: '841 - FRONTERA GUAYARAMERIN', value: '841' },
  { label: '862 - POSTAL TRINIDAD', value: '862' },

  { label: '911 - AEROPUERTO COBIJA', value: '911' },
  { label: '921 - FRONTERA COBIJA', value: '921' },
  { label: '931 - ZONA FRANCA COMERCIAL E IND. COBIJA', value: '931' }
];


  pdfSeleccionado: File | null = null;

  archivosPDF: File[] = [];

  clienteSeleccionado: any = null;
  mercanciaSeleccionada: any = null;
  contenedorSeleccionado: any = null;
  tipoCargaSeleccionada: any = null;
  descripcionSeleccionada: any = null;
  navieraSeleccionada: any = null;
  origenSeleccionado: any = null;
  destinoSeleccionado: any = null;
  despachoPortuarioSeleccionado: any = null;
  despachoAduaneroSeleccionado: any = null;
  despachoAduaneroGeneralSeleccionado: any = null;
  depositoAduaneroSeleccionado: any = null;
  asignacionCargaSeleccionada: any = null;
  estadoSeleccionado: any = null;

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
  filtroAnioCarga: number | null = null;

  clientesFiltrados: any[] = [];
  mercanciasFiltradas: any[] = [];
  contenedoresFiltrados: any[] = [];
  tiposCargaFiltrados: any[] = [];
  descripcionesFiltradas: any[] = [];
  navierasFiltradas: any[] = [];
  origenesFiltrados: any[] = [];
  destinosFiltrados: any[] = [];
  despachosPortuariosFiltrados: any[] = [];
  despachosAduanerosFiltrados: any[] = [];
  despachosAduanerosGeneralesFiltrados: any[] = [];
  depositosAduanerosFiltrados: any[] = [];
  asignacionesCargaFiltradas: any[] = [];
  estadosFiltrados: any[] = [];

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

  opcionesClientes: { label: string; value: number }[] = [];
  opcionesMercancias: { label: string; value: number }[] = [];
  opcionesContenedores: String[] = [];
  opcionesTipoCarga: { label: string; value: string }[] = [];
  opcionesDescripcion: String[] = [];
  opcionesNaviera: { label: string; value: number }[] = [];
  opcionesOrigen: { label: string; value: number }[] = [];
  opcionesDestino: { label: string; value: number }[] = [];
  opcionesDespachoPortuario: String[] = [];
  opcionesDespachoAduanero: String[] = [];
  opcionesDespachoAduaneroGeneral: String[] = [];
  opcionesDepositoAduanero: String[] = [];
  opcionesAsignacionCarga: String[] = [];
  opcionesEstado: { label: string; value: string }[] = [];

  generando: boolean = false;

  bloquearContenedor = false;
  bloquearTamano = false;

  aniosDisponibles: number[] = [];

  activeIndex = 0;

  tiposGasto = [
    { id: 'DIESEL', nombre: 'DIESEL' },
    { id: 'PEAJE', nombre: 'PEAJE' },
    { id: 'VIATICOS', nombre: 'VIATICOS' }
  ];

  mostrarGastos = false;
  tituloMostrarGastos = '';
  gastos: any[] = [];

 modalidad_pago = [
    { label: 'AL CONTADO', value: 'AL CONTADO' },
    { label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' },
    { label: 'QR', value: 'QR' }
  ];

  constructor(private despachoService: DespachosService) { }

  ngOnInit(): void {
    
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerMercancias();
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
      // const fechaCargaStr = d.fecha_carga ? new Date(d.fecha_carga).toISOString().split('T')[0] : '';
      const anioCarga = d.fecha_llegada
        ? new Date(d.fecha_llegada).getFullYear()
        : null;
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
        // (this.filtroFechaBlMadre ? fechaCargaStr === this.filtroFechaBlMadre : true) &&
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
        // fechaCargaStr.includes(this.filtroFechaCarga) &&
        (this.filtroAnioCarga ? anioCarga === this.filtroAnioCarga : true) &&
        asignacionDescargaStr.includes(this.filtroAsignacionDescarga.toLowerCase()) &&
        fechaDescargaStr.includes(this.filtroFechaDescarga) &&
        estadoStr.includes(this.filtroEstado.toLowerCase())
      );
    }).sort((a, b) =>
      new Date(b.fecha_llegada).getTime() -
      new Date(a.fecha_llegada).getTime()
    );
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
    if (this.opcionesMercancias.length === 0) {
      const idsmercancias = new Set(this.despachos.map(d => d.id_mercancia));
      this.opcionesMercancias = this.mercancias.filter(m => idsmercancias.has(m.value));
    }

    const query = event.query.toLowerCase();
    this.mercanciasFiltradas = this.opcionesMercancias.filter(m =>
      m.label.toLowerCase().includes(query)
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
      const idsTiposCarga = new Set(this.despachos.map(d => d.id_tipo_carga));
      this.opcionesTipoCarga = this.tipo_carga.filter(m => idsTiposCarga.has(m.value));
    }
    console.log(this.opcionesTipoCarga);

    const query = event.query.toLowerCase();
    this.tiposCargaFiltrados = this.opcionesTipoCarga.filter(m =>
      m.label.toLowerCase().includes(query)
    );
  }
  filtrarDescripciones(event: any) {
    if (this.opcionesDescripcion.length === 0 && this.despachos?.length > 0) {
      // Convertimos todo a string, filtramos nulos o vacíos y quitamos duplicados
      const todas = this.despachos
        .map(d => d?.descripcion_carga ? String(d.descripcion_carga).trim() : '')
        .filter(c => c !== '');
      this.opcionesDescripcion = [...new Set(todas)]; // distinct
    }

    const query = (event.query || '').toLowerCase();

    this.descripcionesFiltradas = this.opcionesDescripcion.filter(c =>
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

  filtrarDespachosPortuarios(event: any) {
    if (!this.opcionesDespachoPortuario.length && this.despachos?.length > 0) {
      const unicos = new Set(
        this.despachos
          .map(d => d?.id_despacho_portuario ? String(d.id_despacho_portuario).trim() : '')
          .filter(c => c !== '')
      );
      this.opcionesDespachoPortuario = Array.from(unicos);
    }

    const query = (event.query || '').toLowerCase();
    this.despachosPortuariosFiltrados = this.opcionesDespachoPortuario.filter(c =>
      c.toLowerCase().includes(query)
    );
  }

  filtrarDespachosAduaneros(event: any) {
    if (!this.opcionesDespachoAduanero.length && this.despachos?.length > 0) {
      const unicos = new Set(
        this.despachos
          .map(d => d?.id_despacho_aduanero ? String(d.id_despacho_aduanero).trim() : '')
          .filter(c => c !== '')
      );
      this.opcionesDespachoAduanero = Array.from(unicos);
    }

    const query = (event.query || '').toLowerCase();
    this.despachosAduanerosFiltrados = this.opcionesDespachoAduanero.filter(c =>
      c.toLowerCase().includes(query)
    );
  }

  filtrarDespachosAduanerosGenerales(event: any) {
    if (!this.opcionesDespachoAduaneroGeneral.length && this.despachos?.length > 0) {
      const unicos = new Set(
        this.despachos
          .map(d => d?.id_despacho_aduanero_general ? String(d.id_despacho_aduanero_general).trim() : '')
          .filter(c => c !== '')
      );
      this.opcionesDespachoAduaneroGeneral = Array.from(unicos);
    }

    const query = (event.query || '').toLowerCase();
    this.despachosAduanerosGeneralesFiltrados = this.opcionesDespachoAduaneroGeneral.filter(c =>
      c.toLowerCase().includes(query)
    );
  }

  filtrarDepositosAduaneros(event: any) {
    if (!this.opcionesDepositoAduanero.length && this.despachos?.length > 0) {
      const unicos = new Set(
        this.despachos
          .map(d => d?.id_deposito_aduanero ? String(d.id_deposito_aduanero).trim() : '')
          .filter(c => c !== '')
      );
      this.opcionesDepositoAduanero = Array.from(unicos);
    }

    const query = (event.query || '').toLowerCase();
    this.depositosAduanerosFiltrados = this.opcionesDepositoAduanero.filter(c =>
      c.toLowerCase().includes(query)
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
        this.cargarAniosDespacho()
        // this.mostrarObservacionesDespachos();
        // this.armarObservacionesAccordion();
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de despachos.', 'error'),
    });
  }
  cargarAniosDespacho() {
    const anios = this.despachos
      .filter(d => d.fecha_llegada)
      .map(d => new Date(d.fecha_llegada).getFullYear());

    this.aniosDisponibles = [...new Set(anios)].sort((a, b) => b - a);
    this.filtroAnioCarga = this.aniosDisponibles[0];
    this.activeIndex = 0;


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
      dim: '',
      fecha_dim: null,
      despacho_agencia: '',
      despacho_nombre: '',
      despacho_telefono: '',
      nombre_barco: '',
      dp: '',
      tiene_diesel: false,
      tiene_peaje: false,
      tiene_viaticos: false,
      lugar_entrega: '',
      aduana_destino: ''
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

  armarObservacionesAccordion() {
    const gruposMap: { [key: string]: ObservacionItem[] } = {
      '⚠️ Fecha BL no definida': [],
      '⚠️ Fecha DAM no definida': [],
      '🚨 CONTRAVENCION': [],
      '📄 FACTURA COMERCIAL no subida': [],
      '📎 PDFs no subidos': []
    };

    for (const despacho of this.despachosFiltrados) {

      if (despacho.estado === 'CULMINADO') continue;

      const cliente = this.getClienteNombre(despacho.id_cliente) || 'Sin nombre';
      // Verifica BL
      if (!despacho.fecha_bl_madre && !despacho.fecha_bl_hijo && !despacho.fecha_bl_nieto) {
        gruposMap['⚠️ Fecha BL no definida'].push({
          id_despacho: despacho.id_despacho,
          cliente,
          detalle: ['Fecha BL no definida']
        });
      }

      // Verifica DAM
      if (despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto) {
        if (!despacho.fecha_dam) {
          gruposMap['⚠️ Fecha DAM no definida'].push({
            id_despacho: despacho.id_despacho,
            cliente,
            detalle: ['Fecha DAM no definida']
          });
        } else {
          const fechaDam = new Date(despacho.fecha_dam);
          const fechaBL = new Date(despacho.fecha_bl_madre || despacho.fecha_bl_hijo || despacho.fecha_bl_nieto);
          const nuevaFechaBL = new Date(fechaBL);
          nuevaFechaBL.setDate(nuevaFechaBL.getDate() + 20);

          if ((nuevaFechaBL.getTime() > fechaDam.getTime()) && !despacho.pago_dam) {
            gruposMap['🚨 CONTRAVENCION'].push({
              id_despacho: despacho.id_despacho,
              cliente,
              detalle: ['CONTRAVENCION']
            });
          }
        }
      }

      // Verifica PDFs
      if (!despacho.archivosSubidos || Object.keys(despacho.archivosSubidos).length === 0) {
        gruposMap['📎 PDFs no subidos'].push({
          id_despacho: despacho.id_despacho,
          cliente,
          detalle: ['PDFs no subidos']
        });
      } else {
        if (!despacho.archivosSubidos.includes('FACTURA COMERCIAL')) {
          gruposMap['📄 FACTURA COMERCIAL no subida'].push({
            id_despacho: despacho.id_despacho,
            cliente,
            detalle: ['FACTURA COMERCIAL no subida']
          });
        }
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

      if (d.id_tipo_carga) col1.push({ text: `Tipo Carga: ${d.id_tipo_carga}`, style: 'cardText' });
      if (d.numero_contenedor) col2.push({ text: `Contenedor: ${d.numero_contenedor}`, style: 'cardText' });

      if (d.descripcion_carga) col1.push({ text: `Tamaño: ${d.descripcion_carga}`, style: 'cardText' });
      if (d.id_naviera) col2.push({ text: `Naviera: ${this.getNavieraNombre(d.id_naviera)}`, style: 'cardText' });
      if (d.nombre_barco) col1.push({ text: `Nombre del Barco: ${d.nombre_barco}`, style: 'cardText' });

      if (this.getNavieraNombre(d.id_naviera) === 'MSC') {
        col1.push({ text: `Autorizado MSC: ${d.autorizado ? 'Sí' : 'No'}`, style: 'cardText' });
      }

      if (d.peso_kg) col1.push({ text: `Peso (kg): ${d.peso_kg}`, style: 'cardText' });
      if (d.volumen_m3) col2.push({ text: `Volumen (m³): ${d.volumen_m3}`, style: 'cardText' });

      if (d.id_mercancia) col1.push({ text: `Mercancía: ${this.getMercanciaNombre(d.id_mercancia)}`, style: 'cardText' });
      if (d.embalaje) col2.push({ text: `Embalaje: ${d.embalaje}`, style: 'cardText' });

      if (d.id_ciudad_origen) col1.push({ text: `Origen: ${this.getCiudadNombre(d.id_ciudad_origen)}`, style: 'cardText' });
      if (d.id_ciudad_destino) col2.push({ text: `Destino: ${this.getCiudadNombre(d.id_ciudad_destino)}`, style: 'cardText' });

      if (d.fecha_llegada) col1.push({ text: `Fecha Llegada: ${this.formatFecha(d.fecha_llegada)}`, style: 'cardText' });
      if (d.fecha_limite) col2.push({ text: `Fecha Límite: ${this.formatFecha(d.fecha_limite)}`, style: 'cardText' });

      if (this.getCiudadNombre(d.id_ciudad_origen) === 'ARICA' && d.id_despacho_portuario) {
        col1.push({ text: `Despacho Portuario: ${d.id_despacho_portuario}`, style: 'cardText' });
      }

      if (d.id_despacho_aduanero) col2.push({ text: `Despacho Aduanero: ${d.id_despacho_aduanero}`, style: 'cardText' });
      if (d.id_despacho_aduanero === 'GENERAL' && d.id_despacho_aduanero_general) {
        col1.push({ text: `Despacho Aduanero General: ${d.id_despacho_aduanero_general}`, style: 'cardText' });
      }

      if (d.id_deposito_aduanero) col2.push({ text: `Depósito Aduanero: ${d.id_deposito_aduanero}`, style: 'cardText' });

      // BL Madre
      if (d.bl_madre && !d.bl_hijo && !d.bl_nieto) {
        col1.push({ text: `BL Madre: ${d.bl_madre}`, style: 'cardText' });
        if (d.fecha_bl_madre) col2.push({ text: `Fecha BL Madre: ${this.formatFecha(d.fecha_bl_madre)}`, style: 'cardText' });
      }

      // BL Hijo
      if (d.bl_hijo && !d.bl_nieto) {
        col1.push({ text: `BL Hijo: ${d.bl_hijo}`, style: 'cardText' });
        if (d.fecha_bl_hijo) col2.push({ text: `Fecha BL Hijo: ${this.formatFecha(d.fecha_bl_hijo)}`, style: 'cardText' });
      }

      // BL Nieto
      if (d.bl_nieto) {
        col1.push({ text: `BL Nieto: ${d.bl_nieto}`, style: 'cardText' });
        if (d.fecha_bl_nieto) col2.push({ text: `Fecha BL Nieto: ${this.formatFecha(d.fecha_bl_nieto)}`, style: 'cardText' });
      }

      if (d.dam) col1.push({ text: `DAM: ${d.dam}`, style: 'cardText' });
      if (d.fecha_dam) col2.push({ text: `Fecha DAM: ${this.formatFecha(d.fecha_dam)}`, style: 'cardText' });

      if (d.id_preasignacion_vehiculo_carga) {
        col1.push({ text: `Preasignación Carga: ${this.getVehiculoNombre(d.id_preasignacion_vehiculo_carga)}`, style: 'cardText' });
      }
      if (d.id_asignacion_vehiculo_carga) {
        col2.push({ text: `Asignación Carga: ${this.getVehiculoNombre(d.id_asignacion_vehiculo_carga)}`, style: 'cardText' });
      }

      if (d.fecha_carga) col1.push({ text: `Fecha Carga: ${this.formatFecha(d.fecha_carga)}`, style: 'cardText' });

      // Descripción y precintos ocupan fila completa
      if (d.descripcion) {
        col1.push({ text: `Descripción: ${d.descripcion}`, style: 'cardText', colSpan: 2 });
      }
      if (d.precinto) col2.push({ text: `Precinto: ${d.precinto}`, style: 'cardText' });
      if (d.precinto_dress) col1.push({ text: `Precinto DRES: ${d.precinto_dress}`, style: 'cardText' });
      if (d.precinto_gog) col2.push({ text: `Precinto GOG: ${d.precinto_gog}`, style: 'cardText' });
      if (d.dim) col1.push({ text: `DIM: ${d.dim}`, style: 'cardText' });
      if (d.fecha_dim) col2.push({ text: `Fecha DIM: ${this.formatFecha(d.fecha_dim)}`, style: 'cardText' });

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
      Mercancía: this.getMercanciaNombre(d.id_mercancia),
      Contenedor: d.numero_contenedor,
      'Tipo Carga': d.id_tipo_carga,
      'Tamaño': d.descripcion_carga,
      'Naviera': this.getNavieraNombre(d.id_naviera),
      'Nombre del Barco': d.nombre_barco,
      Autorizado: this.getNavieraNombre(d.id_naviera) === 'MSC' ? (d.autorizado ? 'Sí' : 'No') : '',
      'Peso (kg)': d.peso_kg,
      'Volumen (m³)': d.volumen_m3,
      Embalaje: d.embalaje,
      Origen: this.getCiudadNombre(d.id_ciudad_origen),
      Destino: this.getCiudadNombre(d.id_ciudad_destino),

      'Fecha Llegada': this.formatFecha(d.fecha_llegada),
      'Fecha Límite': this.formatFecha(d.fecha_limite),

      'BL Madre': d.bl_madre,
      'Fecha BL Madre': this.formatFecha(d.fecha_bl_madre),
      'BL Hijo': d.bl_hijo,
      'Fecha BL Hijo': this.formatFecha(d.fecha_bl_hijo),
      'BL Nieto': d.bl_nieto,
      'Fecha BL Nieto': this.formatFecha(d.fecha_bl_nieto),

      DAM: d.dam,
      'Fecha DAM': this.formatFecha(d.fecha_dam),

      'Despacho Portuario': this.getCiudadNombre(d.id_ciudad_origen) === 'ARICA' ? d.id_despacho_portuario : '',
      'Despacho Aduanero': d.id_despacho_aduanero,
      'Despacho Aduanero General': d.id_despacho_aduanero === 'GENERAL' ? d.id_despacho_aduanero_general : '',
      'Depósito Aduanero': d.id_deposito_aduanero,

      'Preasignación Carga': !d.id_asignacion_vehiculo_carga ? this.getVehiculoNombre(d.id_preasignacion_vehiculo_carga) : '',
      'Asignación Carga': this.getVehiculoNombre(d.id_asignacion_vehiculo_carga),
      'Fecha Carga': this.formatFecha(d.fecha_carga),

      // Solo si despacho es anticipado
      DIM: d.id_despacho_aduanero === 'ANTICIPADO' ? d.dim : '',
      'Fecha DIM': d.id_despacho_aduanero === 'ANTICIPADO' ? this.formatFecha(d.fecha_dim) : '',

      'Agencia': d.despacho_agencia,
      'Agencia Nombre': d.despacho_nombre,
      'Agencia Teléfono': d.despacho_telefono,

      'Precinto': d.precinto,
      'Precinto DRES': d.precinto_dress,
      'Precinto GOG': d.precinto_gog,

      'Autorizado MSC': this.getNavieraNombre(d.id_naviera) === 'MSC' ? (d.autorizado ? 'Sí' : 'No') : '',
      'Descripción Adicional': d.descripcion,
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
    if (despacho.estado === 'EN OFICINA') {
      docs = docs.filter(doc => !['MIC-CRT'].includes(doc.nombre));
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

  onTabAnioChange(event: any) {
    this.filtroAnioCarga = this.aniosDisponibles[event.index];
  }

  verGasto(despacho: any, gasto: any): void {
    this.despachoSeleccionado = despacho;
    this.obtenerGastos(gasto.nombre);
    this.mostrarGastos = true;
    this.tituloMostrarGastos = `${gasto.nombre}`;
  }

  obtenerGastos(nombreGasto: string): void {
    this.despachoService.getGastosDespacho(this.despachoSeleccionado.id_despacho, nombreGasto).subscribe({
      next: data => {
        this.gastos = data;
        this.gastos.forEach(gasto => {
          gasto.fecha_pago = gasto.fecha_pago ? new Date(gasto.fecha_pago) : null;

        });
        console.log('Gastos cargados:', this.gastos);
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de gastos.', 'error')
    });
  }

  agregarGasto(): void {
    this.gastos.push({
      id_despachos_gasto: null,
      id_despacho: this.despachoSeleccionado.id_despacho,
      tipo: this.tituloMostrarGastos,
      descripcion: '',
      monto: '',
      cancelado: false,
      estado: 'ACTIVO',
      fecha_pago: null,
      modalidad_pago: '',
      persona_pago: ''
    });
  }

  guardarGasto(): void {
    const incompletos = this.gastos.filter(g => !g.descripcion || !g.monto);

    if (incompletos.length > 0) {
      Swal.fire(
        'Advertencia',
        'Debes llenar al menos Descripcion y Monto en todos los gastos antes de guardar, caso contrario borre los vacíos',
        'warning'
      );
      return;
    }

    const requests = this.gastos.map(gasto => {
      if (gasto.id_despachos_gasto) {
        return this.despachoService.editarGasto(gasto.id_despachos_gasto, gasto);
      } else {
        return this.despachoService.insertarGasto(gasto);
      }
    });

    forkJoin(requests).subscribe({
      next: (resultados: any) => {
        this.gastos = this.gastos.map((g, i) => ({
          ...g,
          id_despachos_gasto: resultados[i].gasto.id_despachos_gasto
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
        if (gasto.id_despachos_gasto) {
          this.despachoService.eliminarGasto(gasto.id_despachos_gasto, this.despachoSeleccionado.id_despacho, gasto.tipo).subscribe({
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

  subirComprobante(gasto: any) {

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';

    input.onchange = (event: any) => {
      this.onFileSubirComprobante(event, gasto);
    };

    input.click();
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

  async generarComprobante(gasto: any) {
    this.despachoSeleccionado = gasto;
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
    // const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    // pdfDocGenerator.getBlob((blob) => {
    //   this.pdfBlob = blob; // ✅ Guardamos el blob original
    //   const blobUrl = URL.createObjectURL(blob);
    //   this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    //   this.mostrarVistaPreviaRecibo = true;
    // });
  }

  subirComprobantes(): void {
    const uploads = this.gastos
      .filter(g => g.archivo)
      .map((gasto, index) => {
        console.log(`Preparando subida de archivo para gasto index ${index}:`, gasto.id_despachos_gasto);
        const extension = gasto.archivo.name.split('.').pop()?.toLowerCase() || '';
        console.log(`Subiendo archivo para gasto index ${gasto.id_despachos_gasto}:`, extension);
        const nuevoArchivo = new File(
          [gasto.archivo],
          `${gasto.id_despachos_gasto}.${extension}`,
          { type: gasto.archivo.type }
        );
        const formData = new FormData();
        formData.append('archivo', nuevoArchivo);
        formData.append('id_despacho', gasto.id_despacho.toString());
        formData.append('documento', gasto.id_despachos_gasto.toString());

        axios.post(`${URL_SERVICIOS}/despachos/subir_pdf`, formData, {
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
    const url = `${URL_SERVICIOS}/despachos/verPdf/${nombre}`;

    const extension = nombre.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      this.pdfSeleccionadoURL = url;
      this.mostrarDialogPDF = true;
    } else {
      this.imagenSeleccionadaURL = url;
      this.mostrarDialogImagen = true;
    }
  }

  getAduana(value: string): string {
  const item = this.aduanas.find(a => a.value === value);
  return item ? item.label : value;
}

}
