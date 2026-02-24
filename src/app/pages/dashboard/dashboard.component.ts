
import { Component, NgZone, OnInit, Input, OnDestroy } from '@angular/core';

import 'lodash';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

import axios from 'axios';

import { MenuItem } from 'primeng/api';

import { DashboardService } from '../../services/dashboard/dashboard.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { URL_SERVICIOS } from 'src/app/config/config';

declare var _: any;


interface Card {
  grupo: string;
  titulo: string;
  cantidad: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  cards: Card[] = [];

  agrupados: { [grupo: string]: Card[] } = {};

  ciudades: { label: string; value: number }[] = [];
  navieras: { label: string; value: number, gate_in: number, dias: number, url: string }[] = [];
  mercancias: { label: string; value: number }[] = [];
  clientes: { label: string; value: number }[] = [];
  vehiculos: { label: string; value: number }[] = [];
  cotizaciones: { label: string; value: number }[] = [];
  cotizacionesEstado: { tipo: number; label: string; value: number, id_cliente: number }[] = [];
  cotizacionesClientes: any[] = [];

  forwaders: { nombre_comercial: string; value: number, razon_social: string, correo: string, telefono: string, ciudad: string, contactos: string }[] = [];

  dialogDespachos: boolean = false;
  dialogContenedores: boolean = false;
  dialogCotizacion: boolean = false;
  dialogVehiculos: boolean = false;

  despachos: any[] = [];

  cardActual: any = null;

  contenedores: any[] = [];

  vistaClientes = false;
  vistaCiudad = true;
  clienteSeleccionado: any = null;
  ciudadSeleccionada: any = null;
  cotizacionSeleccionada: any = null;
  clientesAgrupados: any[] = [];
  ciudadesAgrupadas: any[] = [];
  despachosFiltradosCliente: any[] = [];
  despachosFiltradosCiudad: any[] = [];

  vistaContenedores = true;
  contenedorSeleccionado: any = null;
  contenedoresAgrupados: any[] = [];
  contenedoresFiltradosCliente: any[] = [];

  vehiculoSeleccionado: any = null;

  vistaCotizaciones = true;

  documentos = [
    { label: 'DATOS GENERALES', value: 'DATOS_GENERALES', existe: false, nombre: '' },
    { label: 'RUAT', value: 'RUAT', existe: false, nombre: '' },
    { label: 'TARJETA DE OPERACIONES', value: 'TARJETA_DE_OPERACIONES', existe: false, nombre: '' },
    { label: 'CI CONDUCTOR', value: 'CI_CONDUCTOR', existe: false, nombre: '' },
    { label: 'LICENCIA CONDUCTOR', value: 'LICENCIA_CONDUCTOR', existe: false, nombre: '' },
    { label: 'POLIZA', value: 'POLIZA', existe: false, nombre: '' },
  ];

  mostrarDialogPDF = false;
  mostrarDialogImagen: boolean = false;

  pdfSeleccionadoURL: string = '';
  imagenSeleccionadaURL: string = '';

  pdfs: any[] = [];
  documentosMergeados: any[] = [];

  aniosDisponibles: string[] = [];
  activeIndex = 0;
  filtroAnioCarga: string | null = null;

  constructor(private dashboardService: DashboardService, private zone: NgZone, private http: HttpClient) { }

  ngOnInit() {
    this.obtenerListado();
    this.obtenerListadoCotizacion();
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerMercancias();
    this.obtenerClientes();
    this.obtenerForwaders();
    this.obtenerVehiculos();
  }

  obtenerListado() {
    return this.dashboardService.getTotal().subscribe(data => {
      this.cards = data;
      console.log(this.cards);

      // agrupar por grupo
      this.agrupados = this.cards.reduce((acc, card) => {
        if (!acc[card.grupo]) acc[card.grupo] = [];
        acc[card.grupo].push(card);
        console.log(this.agrupados);
        return acc;
      }, {} as { [grupo: string]: Card[] });
    })
    console.log(this.agrupados);
  }

  obtenerListadoCotizacion() {
    this.dashboardService.getTotalCotizacion().subscribe({
      next: (data) => {
        this.cotizaciones = data.map((cotizacion) => ({
          label: cotizacion.estado,
          value: cotizacion.total,
        }));
        console.log('Cotizaciones cargadas:', this.cotizaciones);
      },
      error: (err) => {
        console.error('Error al cargar cotizaciones:', err);
      },
    });
  }

  obtenerCiudades(): void {
    this.dashboardService.getCiudad().subscribe({
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
  getCiudadNombre(id: number | string): string {
    const idNum = Number(id);

    if (isNaN(idNum)) {
      return 'Sin nombre';
    }

    const ciudad = this.ciudades.find(c => c.value === idNum);
    return ciudad ? ciudad.label : 'Sin nombre';
  }

  obtenerNavieras(): void {
    this.dashboardService.getNaviera().subscribe({
      next: (data) => {
        this.navieras = data.map((naviera) => ({
          label: naviera.nombre_comercial,
          value: naviera.id_naviera,
          gate_in: naviera.gate_in,
          dias: naviera.dias,
          url: naviera.url
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
    this.dashboardService.getMercancia().subscribe({
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
    this.dashboardService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((cliente) => ({
          label: cliente.nombre_comercial,
          value: cliente.id_cliente,
        }));
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

  obtenerForwaders(): void {
    this.dashboardService.getForwaders().subscribe({
      next: (data) => {
        this.forwaders = data.map((forwader) => ({
          nombre_comercial: forwader.nombre_comercial,
          value: forwader.id_forwarder,
          razon_social: forwader.persona_contacto,
          correo: forwader.correo,
          telefono: forwader.telefono,
          ciudad: forwader.ciudad,
          contactos: forwader.contactos
        }));
        console.log('Forwaders cargados:', this.forwaders);
      },
      error: (err) => {
        console.error('Error al cargar forwaders:', err);
      },
    });
  }
  getForwaderNombre(id: number): string {
    const forwader = this.forwaders.find((f) => f.value === id);
    return forwader ? forwader.nombre_comercial : 'Sin nombre';
  }

  onRowClick(cotizacion: any) {
    if (cotizacion.contenedores.length === 1) {
      if (cotizacion.contenedores[0].numero_contenedor) {
        this.copiarTexto(cotizacion.contenedores[0].numero_contenedor);
        window.open(this.getNavieraUrl(cotizacion.id_naviera), '_blank');
      }
    }
  }
  onSubRowClick(cotizacion: any, contenedor: any) {
    if (contenedor.numero_contenedor) {
      this.copiarTexto(contenedor.numero_contenedor);
      window.open(this.getNavieraUrl(cotizacion.id_naviera), '_blank');
    }

  }

  getNavieraUrl(id: number): string {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.url : 'Sin URL';
  }

  copiarTexto(texto: string) {
    // Intento Clipboard API si existe
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => console.log("Copiado con Clipboard API"))
        .catch(() => this.copiarConExecCommand(texto));
    } else {
      // Fallback para HTTP
      this.copiarConExecCommand(texto);
    }
  }

  private copiarConExecCommand(texto: string) {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    // Evitar que se vea
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      console.log("Copiado con execCommand");
    } catch (err) {
      console.error("No se pudo copiar", err);
    }
    document.body.removeChild(textarea);
  }
  obtenerVehiculos(): void {
    this.dashboardService.getVehiculos().subscribe({
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

  getPlaca(card: Card): string {
    return card.cantidad.split('|')[0]; // primer elemento antes del |
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

  estiloFila(despacho: any): string {
    console.log('Evaluando estilo para despacho:', despacho);
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

  abrirDialogDespachos(card: any) {
    this.cardActual = card;
    this.obtenerListadoDespacho(card.grupo, card.titulo);
    this.dialogDespachos = true;

  }

  cerrarDespachos() {
    this.vistaClientes = true;
    this.clienteSeleccionado = null;
    this.despachosFiltradosCliente = [];
  }

  obtenerListadoDespacho(grupo: string, estado: string): void {
    this.dashboardService.getDespachos(grupo, estado).subscribe({
      next: (data) => {
        this.despachos = data;
        // this.cargarAniosDespacho();
        this.agruparCiudades();
        
        console.log('Despachos cargados:', this.despachos);
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de despachos.', 'error'),
    });
  }
  cargarAniosDespacho() {
    const meses = this.despachos
      .filter(d => d.fecha_carga)
      .map(d => {
        const fecha = new Date(d.fecha_carga);
        const mes = fecha.getMonth() + 1;
        const anio = fecha.getFullYear();
        return `${anio}-${mes.toString().padStart(2, '0')}`;
      });

    this.aniosDisponibles = [...new Set(meses)]
      .sort((a, b) => b.localeCompare(a));

    // 🔥 CLAVE
    this.filtroAnioCarga = this.aniosDisponibles[0]; // último período
    this.activeIndex = 0;

    this.aplicarFiltros();
  }
  formatearPeriodo(periodo: string): string {
    const [anio, mes] = periodo.split('-');
    return `${mes}/${anio}`;
  }
  aplicarFiltros() {
    this.despachosFiltradosCliente = this.despachos
      .filter(d => {
        if (!this.filtroAnioCarga) return true;

        const fecha = new Date(d.fecha_carga);
        const periodo =
          `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;

        return periodo === this.filtroAnioCarga;
      })
      .sort((a, b) =>
        new Date(b.fecha_carga).getTime() -
        new Date(a.fecha_carga).getTime()
      );
  }


  onTabAnioChange(event: any) {
    this.filtroAnioCarga = this.aniosDisponibles[event.index];
    this.aplicarFiltros();
  }

  agruparClientes() {
    // Agrupa por cliente
    const mapa = new Map<number, { id_cliente: number; nombre: string; cantidad: number }>();

    for (const d of this.despachosFiltradosCiudad) {
      const id = d.id_cliente;
      if (!mapa.has(id)) {
        mapa.set(id, { id_cliente: id, nombre: this.getClienteNombre(id), cantidad: 0 });
      }
      mapa.get(id)!.cantidad++;
    }

    this.clientesAgrupados = Array.from(mapa.values());
    console.log('Clientes agrupados:', this.clientesAgrupados);
  }

  agruparCiudades() {
    // Agrupa por ciudad
    const mapa = new Map<number, { id_ciudad: number; nombre: string; cantidad: number }>();

    for (const d of this.despachos) {
      const id = d.id_ciudad_origen;
      if (!mapa.has(id)) {
        mapa.set(id, { id_ciudad: id, nombre: this.getCiudadNombre(id), cantidad: 0 });
      }
      mapa.get(id)!.cantidad++;
    }

    this.ciudadesAgrupadas = Array.from(mapa.values());
  }

  verDespachosDeCiudad(ciudad: any) {
    this.despachosFiltradosCiudad = this.despachos.filter(
      (d) => d.id_ciudad_origen === ciudad.id_ciudad
    );
    this.agruparClientes();

    this.vistaCiudad = false;
    this.vistaClientes = true;
    this.ciudadSeleccionada = ciudad; 
  }

  volverACiudades() {
    this.vistaCiudad = true;
    this.vistaClientes = false;
    this.ciudadSeleccionada = null;
    this.despachosFiltradosCiudad = [];
  }

  verDespachosDeCliente(cliente: any) {
    this.vistaClientes = false;
    this.clienteSeleccionado = cliente;
    this.despachosFiltradosCliente = this.despachosFiltradosCiudad.filter(
      (d) => d.id_cliente === cliente.id_cliente
    );
  }

  volverAClientes() {
    this.vistaClientes = true;
    this.clienteSeleccionado = null;
    this.despachosFiltradosCliente = [];
  }

  abrirDialogContenedor(card: any) {
    this.cardActual = card;
    this.obtenerListadoContenedor(card.titulo);
    this.dialogContenedores = true;
  }

  cerrarContenedores() {
    this.contenedorSeleccionado = null;
    this.vistaContenedores = true;
    this.contenedoresFiltradosCliente = [];
  }

  obtenerListadoContenedor(estado: string): void {
    this.dashboardService.getContenedores(estado).subscribe({
      next: (data) => {
        this.contenedores = data;
        this.agruparContenedores();
        console.log('Contenedores cargados:', this.contenedores);
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de contenedores.', 'error'),
    });
  }

  abrirDialogCotizacion(cotizacion: any) {
    this.cotizacionSeleccionada = cotizacion;
    console.log('Cotización seleccionada:', cotizacion);
    this.obtenerListadoCotizacionEstado(cotizacion.label);
    this.dialogCotizacion = true;
  }

  cerrarCotizacion() {
    this.cotizacionSeleccionada = null;
    this.vistaCotizaciones = true;
    this.cotizacionesClientes = [];
  }

  obtenerListadoCotizacionEstado(estado: string): void {
    this.dashboardService.getCotizacionesEstado(estado).subscribe({
      next: (data) => {
        console.log('Datos de cotizaciones por estado:', data);
        this.cotizacionesEstado = data.map((cotizacion) => ({
          tipo: cotizacion.tipo,
          label: cotizacion.nombre,
          value: cotizacion.total,
          id_cliente: cotizacion.id_cliente,
        }));
        console.log('Cotizaciones cargadas:', this.cotizacionesEstado);
      },
      error: (err) => {
        console.error('Error al cargar cotizaciones:', err);
      },
    });
  }

  agruparContenedores() {
    // Agrupa por cliente
    const mapa = new Map<number, { id_cliente: number; nombre: string; cantidad: number }>();

    for (const d of this.contenedores) {
      const id = d.id_cliente;
      if (!mapa.has(id)) {
        mapa.set(id, { id_cliente: id, nombre: this.getClienteNombre(id), cantidad: 0 });
      }
      mapa.get(id)!.cantidad++;
    }

    this.contenedoresAgrupados = Array.from(mapa.values());
  }

  verContenedoresDeCliente(cliente: any) {
    this.vistaContenedores = false;
    this.contenedorSeleccionado = cliente;
    this.contenedoresFiltradosCliente = this.contenedores.filter(
      (d) => d.id_cliente === cliente.id_cliente
    );
  }

  volverAContenedores() {
    this.vistaContenedores = true;
    this.contenedorSeleccionado = null;
    this.contenedoresFiltradosCliente = [];
  }

  verCotizacionEstado(cliente: any) {
    this.vistaCotizaciones = false;
    // this.cotizacionSeleccionada = cliente;
    console.log('Cliente seleccionado para cotizaciones:', cliente);

    this.dashboardService.getCotizaciones(cliente.tipo, cliente.id_cliente, this.cotizacionSeleccionada.label).subscribe({
      next: (data) => {
        this.cotizacionesClientes = data;
        this.cotizacionesClientes.forEach(cotizacion => {
          cotizacion.contenedores = JSON.parse(cotizacion.contenedores || '[]');
        });
        console.log('Cliente seleccionado para cotizaciones:', this.cotizacionesClientes);
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de cotizaciones.', 'error'),
    });
  }

  volverACotizacion() {
    this.vistaCotizaciones = true;
    // this.cotizacionSeleccionada = null;
    this.cotizacionesClientes = [];
  }

  estiloFila2(despacho: any): string {

    if (!despacho.estado) return '';
    if (despacho.estado === 'ACEPTADO') {
      return 'cotizacion-aceptada'; // Aceptado
    } else {
      return '';
    }
  }

  exportarDespachosPDF() {
    const content: any[] = [];

    this.despachosFiltradosCliente.forEach((d, i) => {
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

    pdfMake.createPdf(docDefinition).download(`${this.cardActual.grupo}_${this.cardActual.titulo}.pdf`);
  }

  formatFecha(fecha: string | Date) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toISOString().split('T')[0]; // yyyy-mm-dd
  }

  estiloFilaContenedor(fechaStr: string | Date, estado: string): string {
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

  calcularDiasRestantes(fechaLimite: string): number {
    const hoy = new Date();
    const limite = new Date(fechaLimite);

    hoy.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);

    const diff = Math.floor((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  exportarContenedoresPDF() {
    const content: any[] = [];

    this.contenedoresFiltradosCliente.forEach((c, i) => {
      // Determinar color de fondo por estado (igual que CSS)
      let bgColor = '#ffffff';
      const estilo = this.estiloFilaContenedor(c.fecha_limite, c.estado);
      if (estilo === 'fecha-vencida') bgColor = '#f8d7da';
      if (estilo === 'fecha-pre-vencida') bgColor = '#f8f5d7';
      if (estilo === 'fecha-devuelto') bgColor = '#d7f8e5';

      const col1: any[] = [];
      const col2: any[] = [];

      // Columna izquierda
      col1.push({ text: `#: ${c.id_contenedor}`, style: 'cardTitle' });
      col1.push({ text: `N° Contenedor: ${c.numero_contenedor || '-'}`, style: 'cardText' });
      col1.push({ text: `Cliente: ${this.getClienteNombre(c.id_cliente)}`, style: 'cardText' });
      if (c.fecha_llegada) col1.push({ text: `Fecha Llegada: ${this.formatFecha(c.fecha_llegada)}`, style: 'cardText' });
      if (c.id_mercancia) col1.push({ text: `Mercancía: ${this.getMercanciaNombre(c.id_mercancia)}`, style: 'cardText' });
      if (c.tamano) col1.push({ text: `Tamaño: ${c.tamano}`, style: 'cardText' });
      if (c.estado_contenedor) col1.push({ text: `Estado Contenedor: ${c.estado_contenedor}`, style: 'cardText' });
      if (c.id_naviera) col1.push({ text: `Naviera: ${this.getNavieraNombre(c.id_naviera)}`, style: 'cardText' });
      if (c.id_categoria) col1.push({ text: `Categoría: ${c.id_categoria}`, style: 'cardText' });
      if (c.ano) col1.push({ text: `Año: ${c.ano}`, style: 'cardText' });
      if (c.ubicacion_devolucion) col1.push({ text: `Ubicación Devolución: ${c.ubicacion_devolucion}`, style: 'cardText' });

      // Columna derecha
      col2.push({ text: `Estado: ${c.estado || '-'}`, style: 'cardTitle' });
      if (c.fecha_limite) col2.push({ text: `Fecha Límite: ${this.formatFecha(c.fecha_limite)}`, style: 'cardText' });
      if (c.bl_madre) col2.push({ text: `BL Madre: ${c.bl_madre}`, style: 'cardText' });
      if (c.fec_devolucion) col2.push({ text: `Fecha Devolución: ${this.formatFecha(c.fec_devolucion)}`, style: 'cardText' });
      if (c.id_ciudad_origen) col2.push({ text: `Ciudad Origen: ${this.getCiudadNombre(c.id_ciudad_origen)}`, style: 'cardText' });
      if (c.id_ciudad_destino) col2.push({ text: `Ciudad Destino: ${this.getCiudadNombre(c.id_ciudad_destino)}`, style: 'cardText' });
      if (c.tipo_contenedor) col2.push({ text: `Tipo Contenedor: ${c.tipo_contenedor}`, style: 'cardText' });
      if (c.id_asignacion_vehiculo_carga) col2.push({ text: `Asignación Carga: ${this.getVehiculoNombre(c.id_asignacion_vehiculo_carga)}`, style: 'cardText' });
      if (this.getNavieraNombre(c.id_naviera) === 'MSC') {
        col2.push({ text: `Autorizado MSC: ${c.autorizado ? 'Sí' : 'No'}`, style: 'cardText' });
      }

      // Observaciones (fila completa)
      if (c.observaciones) {
        col1.push({ text: `Observaciones: ${c.observaciones}`, style: 'cardText', colSpan: 2 });
        col2.push({ text: '' }); // para llenar la otra celda
      }

      // Agregar tarjeta al PDF
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

    pdfMake.createPdf(docDefinition).download('Contenedores.pdf');
  }

  abrirDialogVehiculos(card: any) {
    this.vehiculoSeleccionado = card;
    this.obtenerPdfs(this.getPlaca(this.vehiculoSeleccionado));
    this.dialogVehiculos = true;
  }

  obtenerPdfs(placa: string): void {
    this.dashboardService.getPdfs(placa).subscribe({
      next: data => {
        this.pdfs = data;
        const archivos = this.pdfs.map(a => a.nombre);

        this.documentosMergeados = this.documentos.map(doc => ({
          ...doc,
          existe: archivos.some(nombre => nombre.includes('_' + doc.value + '.')),
          nombre: archivos.find(nombre => nombre.includes('_' + doc.value + '.')) || ''
        }));

        console.log(this.documentosMergeados);
      },
      error: err => Swal.fire('Error', 'No se pudo cargar la lista de PDFs.', 'error')
    });
  }

  verPDF(nombre: any) {
    const url = `${URL_SERVICIOS}/vehiculo/verArchivo/${nombre}`;
    console.log('Ver archivo:', url);

    const extension = nombre.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      this.pdfSeleccionadoURL = url;
      this.mostrarDialogPDF = true;
    } else {
      this.imagenSeleccionadaURL = url;
      this.mostrarDialogImagen = true;
    }

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
        this.dashboardService.deleteFile(pdf).subscribe({
          next: (res) => {
            console.log(res);
            Swal.fire(
              'Eliminado',
              'El archivo se eliminó correctamente.',
              'success'
            );
            this.obtenerPdfs(this.getPlaca(this.vehiculoSeleccionado));
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Error al eliminar archivo.', 'error');
          }
        });
      }
    });
  }

  abrirSelectorArchivo(archivo: any) {

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';

    input.onchange = (event: any) => {
      this.onFileSelected(event, archivo);
    };

    input.click();
  }

  onFileSelected(event: Event, archivo: any) {
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

    let nuevoNombre = this.getPlaca(this.vehiculoSeleccionado) + '_' + archivo;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas subir el archivo: "${nuevoNombre}.${extension}"?`,
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
          `${nuevoNombre}.${extension}`,
          { type: file.type }
        );

        formData.append('archivo', nuevoArchivo);

        axios.post(`${URL_SERVICIOS}/vehiculo/subir_pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
          .then(response => {
            Swal.fire('¡Subido!', 'El archivo se subió correctamente.', 'success');
            this.obtenerPdfs(this.getPlaca(this.vehiculoSeleccionado));
          })
          .catch(error => {
            console.error('Error al subir el archivo', error);
            Swal.fire('Error', 'Error al subir el archivo. Intenta nuevamente.', 'error');
          });
      } else {
        input.value = '';
      }
    });


  }

  


}
