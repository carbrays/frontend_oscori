import { Component, OnInit } from '@angular/core';
import { CotizacionService } from 'src/app/services/cotizacion/cotizacion.service';
import Swal from 'sweetalert2';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';

import { MenuItem } from 'primeng/api';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.component.html',
  styleUrls: ['./cotizacion.component.css'],
})
export class CotizacionComponent implements OnInit {

  steps: MenuItem[] = [];
  activeIndex: number = 0;

  cotizaciones: any[] = [];
  cotizacionSeleccionada: any = {};

  modoEdicion = false;
  mostrarFormulario: boolean = false;

  ciudades: { label: string; value: number }[] = [];
  navieras: { label: string; value: number, gate_in: number }[] = [];
  mercancias: { label: string; value: number }[] = [];
  clientes: { value: number, nombre_comercial: string; persona_contacto: string, telefono_contacto: string, correo_contacto: string, ciudad: number }[] = [];
  forwaders: { label: string; value: number, razon_social: string, correo: string, telefono: string, ciudad: string }[] = [];

  modo_cliente = [
    { label: 'CONSIGNATARIO', value: 'CONSIGNATARIO' },
    { label: 'TERCERO', value: 'TERCERO' }
  ];

  categoria_cliente = [
    { label: 'UNIPERSONAL', value: 'UNIPERSONAL' },
    { label: 'JURIDICA', value: 'JURIDICA' }
  ];

  tipo_cliente = [
    { label: 'FORWARDER', value: 'FORWARDER' },
    { label: 'AGENCIA', value: 'AGENCIA' },
    { label: 'TRANSPORTE', value: 'TRANSPORTE' },
    { label: 'OTRO', value: 'OTRO' },

  ];

  tipo_documento = [
    { label: 'BL', value: 'BL' },
    { label: 'DATOS REFERENCIALES', value: 'DATOS REFERENCIALES' }
  ];

  tipo_bl = [
    { label: 'MBL', value: 'MBL' },
    { label: 'HBL', value: 'HBL' },
    { label: 'NBL', value: 'NBL' }
  ];

  tipo_carga = [
    { label: 'DESCONSOLIDADO', value: 'DESCONSOLIDADO' },
    { label: 'CARGA SUELTA', value: 'CARGA_SUELTA' },
    { label: 'CONTENEDOR', value: 'CONTENEDOR' },
  ];

  tipo_despacho_portuario = [
    { label: 'DIRECTO', value: 'DIRECTO' },
    { label: 'INDIRECTO ANTICIPADO', value: 'INDIRECTO ANTICIPADO' },
    { label: 'INDIRECTO', value: 'INDIRECTO' },
  ];

  tipo_despacho_aduanero = [
    { label: 'GENERAL', value: 'GENERAL' },
    { label: 'ANTICIPADO', value: 'ANTICIPADO' },
    { label: 'INMEDIATO', value: 'INMEDIATO' },
  ];
  estado = [
    { label: 'ACEPTADO', value: 'ACEPTADO' },
    { label: 'RECHAZADO', value: 'RECHAZADO' }
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
  ];

  bloquearTipoCliente = false;
  bloquearRazonSocial = false;
  bloquearContenedor = false;
  bloquearTamano = false;

  valorGateIn: number = 0;
  total: number = 0;

  cotizacionInicial: any = {};

  camposVigilados = [
    'modo_cliente',
    'tipo_cliente',
    'razon_social',
    'nombre_comercial',
    'correo',
    'telefono',
    'ciudad'
  ];

  guardarDentro: boolean = false;

  filteredClientes: string[] = [];
  filteredForwaders: string[] = [];

  mostrarPDF = false;
  pdfSrc: any;

  dialogCliente: boolean = false;
  nuevoCliente: any = {};

  dialogForwader: boolean = false;
  nuevoForwader: any = {};

  constructor(private cotizacionService: CotizacionService) { }

  ngOnInit(): void {
    this.steps = [
      { label: 'Datos Cliente' },
      { label: 'Información' },
      { label: 'Cotizar Flete' },
      { label: 'Decisión' }
    ];
    this.obtenerListado();
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerMercancias();
    this.obtenerClientes();
    this.obtenerForwaders();
  }

  nextStep() {
    if (this.activeIndex < this.steps.length - 1) {
      if (this.activeIndex === 0) {
        this.guardarDentro = true;
      }
      this.guardarCambios();
      this.modoEdicion = true;
      this.activeIndex++;
    }
  }

  prevStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  finalizar() {
    this.guardarDentro = false;
    this.guardarCambios();
    this.mostrarFormulario = false;
    this.cotizacionSeleccionada = {};
    this.modoEdicion = false;
    this.activeIndex = 0;
  }

  abrirNuevaCotizacion(): void {
    this.cotizacionSeleccionada = {
      id_cotizacion: null,
      modo_cliente: '',
      tipo_cliente: '',
      nombre_comercial: '',
      nit: '',
      persona_contacto: '',
      correo_contacto: '',
      telefono_contacto: '',
      ciudad: null,
      c_nombre_comercial: '',
      c_persona_contacto: '',
      c_correo: '',
      c_telefono: '',
      c_ciudad: null,
      tipo_documento: '',
      tipo_bl: '',
      numero_bl: '',
      id_tipo_carga: null,
      numero_contenedor: '',
      tamano: '',
      peso_kg: '',
      id_mercancia: null,
      embalaje: '',
      volumen_m3: null,
      id_navieria: null,
      fecha_llegada: null,
      id_ciudad_origen: null,
      id_ciudad_destino: null,
      id_despacho_aduanero: '',
      lugar_descarga: '',
      id_despacho_portuario: '',
      devolucion: false,
      gate_in: false,
      flete: null,
      estado: '',
      usucre: localStorage.getItem('login') || '',
      feccre: new Date(),
      usumod: null,
      fecmod: null,
      categoria_cliente: ''
    };

    this.cotizacionInicial = JSON.parse(JSON.stringify(this.cotizacionSeleccionada));
    this.mostrarFormulario = true;
  }


  algunDatoVigiladoModificado(): boolean {
    return this.camposVigilados.some(campo =>
      this.cotizacionSeleccionada[campo] !== this.cotizacionInicial[campo]
    );
  }

  guardarCambios(): void {
    console.log('guardando cambios, cotizacion:', this.cotizacionSeleccionada);
    if (this.modoEdicion) {
      this.cotizacionSeleccionada.usumod = localStorage.getItem('login');
      this.cotizacionSeleccionada.fecmod = new Date();
      this.cotizacionService
        .editarCotizacion(
          this.cotizacionSeleccionada.id_cotizacion,
          this.cotizacionSeleccionada
        )
        .subscribe({
          next: () => {
            // this.mostrarFormulario = false;
            // this.obtenerListado();
            if (!this.guardarDentro) {
              Swal.fire(
                'Actualizado',
                'Cotización actualizada correctamente.',
                'success'
              );
            }
          },
          error: (err) =>
            Swal.fire('Error', 'No se pudo actualizar el despacho.', 'error'),
        });
    } else {
      this.cotizacionService
        .insertarCotizacion(this.cotizacionSeleccionada)
        .subscribe({
          next: (res) => {
            this.cotizacionSeleccionada.id_cotizacion = res.id_cotizacion;
            this.obtenerListado();
            if (!this.guardarDentro) {
              Swal.fire('Guardado', 'Cotización creada correctamente.', 'success');
            }
          },
          error: (err) =>
            Swal.fire('Error', 'No se pudo crear la cotizacion.', 'error'),
        });
    }
  }

  editarCotizacion(cotizacion: any): void {
    this.cotizacionSeleccionada = { ...cotizacion };
    this.actualizarTipoCliente(this.cotizacionSeleccionada.tipo_cliente);
    this.actualizarTipoCarga(this.cotizacionSeleccionada.id_tipo_carga);
    this.actualizarGateIn(this.cotizacionSeleccionada.id_navieria);
    this.actualizarTotal();
    this.mostrarFormulario = true;
    this.modoEdicion = true;
  }

  eliminarCotizacion(cotizacion: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la cotización "${cotizacion.id_cotizacion}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cotizacionService.eliminarCotizacion(cotizacion.id_cotizacion).subscribe({
          next: () => {
            this.obtenerListado();
            Swal.fire(
              'Eliminado',
              'Cotización eliminada correctamente.',
              'success'
            );
          },
          error: (err) =>
            Swal.fire('Error', 'No se pudo eliminar la cotización.', 'error'),
        });
      }
    });
  }

  cerrarCotizacion(): void {
    if (this.algunDatoVigiladoModificado()) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas guardar la cotización "${this.cotizacionSeleccionada.id_cotizacion ? this.cotizacionSeleccionada.id_cotizacion : ''}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'No, salir',
      }).then((result) => {
        if (result.isConfirmed) {
          this.guardarCambios();
          this.mostrarFormulario = false;
          this.cotizacionSeleccionada = {};
          this.modoEdicion = false;
          this.activeIndex = 0;
          this.obtenerListado();
        } else if (result.isDismissed) {
          this.mostrarFormulario = false;
          this.cotizacionSeleccionada = {};
          this.modoEdicion = false;
          this.activeIndex = 0;
        }
      });
    } else {
      this.mostrarFormulario = false;
      this.cotizacionSeleccionada = {};
      this.modoEdicion = false;
      this.activeIndex = 0;
    }


  }

  obtenerListado(): void {
    this.cotizacionService.getCotizaciones().subscribe({
      next: (data) => {
        this.cotizaciones = data;
        console.log('Cotizaciones cargadas:', this.cotizaciones);
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de cotizaciones.', 'error'),
    });
  }

  obtenerCiudades(): void {
    this.cotizacionService.getCiudad().subscribe({
      next: (data) => {
        this.ciudades = data.map((ciudad) => ({
          label: ciudad.ciudad,
          value: ciudad.id_ciudad,
        }));
        console.log('Ciudades cargadas:', this.ciudades);
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
    this.cotizacionService.getNaviera().subscribe({
      next: (data) => {
        this.navieras = data.map((naviera) => ({
          label: naviera.nombre_comercial,
          value: naviera.id_naviera,
          gate_in: naviera.gate_in,
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

  getNavieraGateIn(id: number): number {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.gate_in : 0;
  }

  obtenerMercancias(): void {
    this.cotizacionService.getMercancia().subscribe({
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

  obtenerForwaders(): void {
    this.cotizacionService.getForwaders().subscribe({
      next: (data) => {
        this.forwaders = data.map((forwader) => ({
          label: forwader.nombre_comercial,
          value: forwader.id_forwarder,
          razon_social: forwader.persona_contacto,
          correo: forwader.correo,
          telefono: forwader.telefono,
          ciudad: forwader.ciudad
        }));
        console.log('Forwaders cargados:', this.forwaders);
      },
      error: (err) => {
        console.error('Error al cargar forwaders:', err);
      },
    });
  }
  buscarForwaders(event: any) {
    const query = event.query.toLowerCase();
    this.filteredForwaders = this.forwaders
      .filter(f => f.label.toLowerCase().includes(query))
      .map(f => f.label);
  }

  contactoSeleccionado(event: any) {
    const forwader = this.forwaders.find(f => f.label === event);
    if (forwader) {
      this.cotizacionSeleccionada.c_nombre_comercial = forwader.label;
      this.cotizacionSeleccionada.c_persona_contacto = forwader.label;
      this.cotizacionSeleccionada.c_correo = forwader.correo;
      this.cotizacionSeleccionada.c_telefono = forwader.telefono;
      this.cotizacionSeleccionada.c_ciudad = forwader.ciudad;
    }
  }

  obtenerClientes(): void {
    this.cotizacionService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((cliente) => ({
          value: cliente.id_cliente,
          nombre_comercial: cliente.nombre_comercial,
          persona_contacto: cliente.persona_contacto,
          telefono_contacto: cliente.telefono_contacto,
          correo_contacto: cliente.correo_contacto,
          ciudad: cliente.ciudad
        }));
        console.log('Clientes cargados:', this.clientes);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      },
    });
  }

  buscarClientes(event: any) {
    const query = event.query.toLowerCase();
    this.filteredClientes = this.clientes
      .filter(c => c.nombre_comercial.toLowerCase().includes(query))
      .map(c => c.nombre_comercial);
  }

  clienteSeleccionado(event: any) {
    console.log('clientes', this.clientes)
    const cliente = this.clientes.find(c => c.nombre_comercial === event);
    if (cliente) {
      // this.cotizacionSeleccionada.nombre_comercial = cliente.nombre_comercial;
      this.cotizacionSeleccionada.persona_contacto = cliente.persona_contacto;
      this.cotizacionSeleccionada.telefono_contacto = cliente.telefono_contacto;
      this.cotizacionSeleccionada.correo_contacto = cliente.correo_contacto;
      this.cotizacionSeleccionada.ciudad = cliente.ciudad;
    }
  }

  actualizarTipoCliente(tipo_cliente: string) {
    switch (tipo_cliente) {
      case 'CONSIGNATARIO':
        this.bloquearTipoCliente = true;
        setTimeout(() => {
          this.cotizacionSeleccionada.tipo_cliente = '';
        }, 0);
        break;
      default:
        this.bloquearTipoCliente = false;
    }
  }

  actualizarTipoCarga(tipo_carga: string) {
    switch (tipo_carga) {
      case 'CARGA_SUELTA':
        this.bloquearContenedor = true;
        this.bloquearTamano = true;
        setTimeout(() => {
          this.cotizacionSeleccionada.numero_contenedor = '';
          this.cotizacionSeleccionada.tamano = '';
        }, 0);
        break;
      default:
        this.bloquearContenedor = false;
        this.bloquearTamano = false;
    }
  }

  actualizarGateIn(id_naviera: string) {
    this.valorGateIn = this.getNavieraGateIn(Number(id_naviera));
  }

  actualizarTotal() {
    // Convertimos a número ambos valores
    const flete = Number(this.cotizacionSeleccionada.flete) || 0;
    const gateIn = Number(this.cotizacionSeleccionada.gate_in ? this.valorGateIn : 0);

    this.total = flete + gateIn;
  }

  async generarPDF() {
    const logoBase64 = await this.loadBase64Image('assets/images/logo.png');
    const fecha = new Date().toLocaleDateString();

    const docDefinition: any = {
      pageSize: 'LETTER', // Carta vertical
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          image: logoBase64,
          width: 100,
          alignment: 'left'
        },
        { text: 'COTIZACIÓN', style: 'header', alignment: 'center' },
        { text: `Cliente: ${this.cotizacionSeleccionada.nombre_comercial}`, style: 'subheader' },
        { text: `Fecha: ${fecha}`, style: 'subheader', margin: [0, 0, 0, 20] },

        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Servicio', style: 'tableHeader' },
                { text: 'Monto (USD)', style: 'tableHeader' }
              ],
              ["FLETE", this.cotizacionSeleccionada.flete]
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 10, 0, 20] },
        subheader: { fontSize: 12, margin: [0, 5, 0, 5] },
        tableHeader: { bold: true, fontSize: 12, fillColor: '#eeeeee' }
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob: Blob) => {
      this.pdfSrc = URL.createObjectURL(blob);
      this.mostrarPDF = true;
    });
  }

  loadBase64Image(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject('Error al convertir imagen');
        }
      };
    });
  }

  //CLIENTE
  crearCliente() {
    this.nuevoCliente = {
      nombre_comercial: '',
      razon_social: '',
      nit: '',
      correo: '',
      telefono: '',
      whatsapp: '',
      direccion: '',
      pais: '',
      ciudad: '',
      id_forwarder: null,
      persona_contacto: '',
      telefono_contacto: '',
      correo_contacto: '',
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date()
    };
    this.dialogCliente = true;
  }

  guardarCliente() {
    this.cotizacionService.insertarCliente(this.nuevoCliente).subscribe({
      next: () => {
        this.dialogCliente = false;
        this.obtenerClientes();
        Swal.fire('Insertado', 'Cliente creado correctamente', 'success');
      },
      error: err => {
        console.error('Error al insertar cliente:', err);
        Swal.fire('Error', 'No se pudo insertar el cliente.', 'error');
      }
    });
  }

  crearForwader() {
    this.nuevoForwader = {
      nombre_comercial: '',
      persona_contacto: '',
      correo: '',
      telefono: '',
      pais: '',
      direccion: '',
      ciudad: '',
      estado: 'ACTIVO',
      usucre: localStorage.getItem('login'),
      feccre: new Date()
    };
    this.dialogForwader = true;
  }

  guardarForwader() {
    this.cotizacionService.insertarForwader(this.nuevoForwader).subscribe({
      next: () => {
        this.dialogForwader = false;
        this.obtenerForwaders();
        Swal.fire('Insertado', 'Forwader creado correctamente', 'success');
      },
      error: err => {
        console.error('Error al insertar forwader:', err);
        Swal.fire('Error', 'No se pudo insertar el forwader.', 'error');
      }
    });
  }

  generarCotizacion() {
  const c = this.cotizacionSeleccionada;

  const docDefinition: any = {
    content: [
      { text: 'COTIZACIÓN', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },

      // Datos del cliente
      { text: 'Datos del Cliente', style: 'subheader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['Nombre Comercial', c.nombre_comercial || ''],
            ['NIT', c.nit || ''],
            ['Persona de Contacto', c.persona_contacto || ''],
            ['Correo', c.correo_contacto || ''],
            ['Teléfono', c.telefono_contacto || ''],
            ['Ciudad', c.ciudad || ''],
          ]
        },
        margin: [0, 0, 0, 20]
      },

      // Datos del contacto (Forwarder)
      { text: 'Datos del Contacto', style: 'subheader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['Nombre Comercial', c.c_nombre_comercial || ''],
            ['Persona de Contacto', c.c_persona_contacto || ''],
            ['Correo', c.c_correo || ''],
            ['Teléfono', c.c_telefono || ''],
            ['Ciudad', c.c_ciudad || ''],
          ]
        },
        margin: [0, 0, 0, 20]
      },

      // Datos de la carga
      { text: 'Datos de la Carga', style: 'subheader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['Tipo Documento', c.tipo_documento || ''],
            ['Tipo BL', c.tipo_bl || ''],
            ['Número BL', c.numero_bl || ''],
            ['Tipo de Carga', c.id_tipo_carga || ''],
            ['Número de Contenedor', c.numero_contenedor || ''],
            ['Tamaño', c.tamano || ''],
            ['Peso (kg)', c.peso_kg || ''],
            ['Mercancía', c.id_mercancia || ''],
            ['Embalaje', c.embalaje || ''],
            ['Volumen (m3)', c.volumen_m3 || ''],
          ]
        },
        margin: [0, 0, 0, 20]
      },

      // Datos de logística
      { text: 'Datos de Logística', style: 'subheader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['Naviera', c.id_navieria || ''],
            ['Fecha Llegada', c.fecha_llegada ? new Date(c.fecha_llegada).toLocaleDateString() : ''],
            ['Ciudad Origen', c.id_ciudad_origen || ''],
            ['Ciudad Destino', c.id_ciudad_destino || ''],
            ['Despacho Aduanero', c.id_despacho_aduanero || ''],
            ['Lugar Descarga', c.lugar_descarga || ''],
            ['Despacho Portuario', c.id_despacho_portuario || ''],
            ['Devolución', c.devolucion ? 'Sí' : 'No'],
            ['Gate In', c.gate_in ? 'Sí' : 'No'],
            ['Flete', c.flete ? `${c.flete} $` : ''],
          ]
        },
        margin: [0, 0, 0, 20]
      },

      // Pie de página
      { text: `Estado: ${c.estado || ''}`, style: 'footer' },
      { text: `Creado por: ${c.usucre || ''} - ${new Date(c.feccre).toLocaleString()}`, style: 'footer' }
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      footer: { fontSize: 10, italics: true, margin: [0, 5, 0, 0] }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}


}