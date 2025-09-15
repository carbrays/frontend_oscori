
import { Component, NgZone, OnInit, Input, OnDestroy } from '@angular/core';

import 'lodash';
import Swal from 'sweetalert2';

import { DashboardService } from '../../services/dashboard/dashboard.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

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
  navieras: { label: string; value: number; dias: number }[] = [];
  mercancias: { label: string; value: number }[] = [];
  clientes: { label: string; value: number }[] = [];
  vehiculos: { label: string; value: number }[] = [];

  dialogDespachos: boolean = false;
  dialogContenedores: boolean = false;

  despachos: any[] = [];

  cardActual: any = null;

  contenedores: any[] = [];

  constructor(private dashboardService: DashboardService, private zone: NgZone) { }

  ngOnInit() {
    this.obtenerListado();
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerMercancias();
    this.obtenerClientes();
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
  getCiudadNombre(id: number): string {
    const ciudad = this.ciudades.find((c) => c.value === id);
    return ciudad ? ciudad.label : 'Sin nombre';
  }

  obtenerNavieras(): void {
    this.dashboardService.getNaviera().subscribe({
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

  obtenerListadoDespacho(grupo: string, estado: string): void {
    this.dashboardService.getDespachos(grupo, estado).subscribe({
      next: (data) => {
        this.despachos = data;
        console.log('Despachos cargados:', this.despachos);
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de despachos.', 'error'),
    });
  }

  abrirDialogContenedor(card: any) {
    this.cardActual = card;
    this.obtenerListadoContenedor(card.titulo);
    this.dialogContenedores = true;
  }

  obtenerListadoContenedor(estado: string): void {
    this.dashboardService.getContenedores(estado).subscribe({
      next: (data) => {
        this.contenedores = data;
        console.log('Contenedores cargados:', this.contenedores);
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de contenedores.', 'error'),
    });
  }

  exportarDespachosPDF() {
    const content: any[] = [];

    this.despachos.forEach((d, i) => {
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

    this.contenedores.forEach((c, i) => {
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


}
