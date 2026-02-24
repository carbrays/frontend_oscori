import { Component, OnInit } from '@angular/core';
import { CotizacionService } from 'src/app/services/cotizacion/cotizacion.service';
import Swal from 'sweetalert2';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';

import { MenuItem } from 'primeng/api';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  navieras: { label: string; value: number, gate_in: number, dias: number, url: string }[] = [];
  mercancias: { label: string; value: number }[] = [];
  clientes: { value: number, nombre_comercial: string; persona_contacto: string, telefono_contacto: string, correo_contacto: string, ciudad: number, contactos: string }[] = [];
  forwaders: { nombre_comercial: string; value: number, razon_social: string, correo: string, telefono: string, ciudad: string, contactos: string }[] = [];

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

  camion = [
    { label: 'EXCLUSIVO', value: 'EXCLUSIVO' },
    { label: 'COMPARTIDO', value: 'COMPARTIDO' }
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

  dialogMercancia: boolean = false;
  nuevaMercancia: any = {};

  filtroCliente: string = '';
  cliente: any = null;
  clientesFiltrados: any[] = [];
  opcionesClientes: { label: string; value: number }[] = [];

  bloquearOrigen = false;

  contenedorVisible = false;
  contenedores: any[] = [];
  contenedorActual: any = {};
  editIndex: any = null;

  consignatario_contactos: any[] = [];
  nuevoConsignatarioContacto: any = {};
  contactoConsignatarioVisible = false;

  forwarder_contactos: any[] = [];
  nuevoForwarderContacto: any = {};
  contactoForwarderVisible = false;

  flete: number = 0;

  
filtroContenedor: string = '';
filtroTamano: string = '';
filtroPeso: string = '';
filtroNaviera: string = '';
filtroTipoDoc: string = '';
filtroTipoCarga: string = '';
filtroOrigen: string = '';
filtroDestino: string = '';
filtroFecha: string = '';
filtroFlete: string = '';
filtroCorrelativo: string = '';

  constructor(private cotizacionService: CotizacionService) { }

  ngOnInit(): void {
    this.steps = [
      { label: 'Datos Cliente' },
      { label: 'Información' },
      { label: 'Cotizar Flete' },
      { label: 'Decisión' }
    ];
    this.obtenerClientes();
    this.obtenerCiudades();
    this.obtenerNavieras();
    this.obtenerMercancias();
    this.obtenerForwaders();
    this.obtenerListado();
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
      nombre_comercial: null,
      nit: '',
      persona_contacto: '',
      correo_contacto: '',
      telefono_contacto: '',
      ciudad: null,
      c_nombre_comercial: null,
      c_persona_contacto: '',
      c_correo: '',
      c_telefono: '',
      c_ciudad: null,
      tipo_documento: '',
      tipo_bl: '',
      numero_bl: '',
      id_tipo_carga: null,
      // numero_contenedor: '',
      // tamano: '',
      peso_kg: '',
      id_mercancia: null,
      embalaje: '',
      volumen_m3: null,
      id_naviera: null,
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
      categoria_cliente: '',
      observacion: '',
      fecha_limite: null,
      camion: '',
      contenedores: '[]'
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
      console.log('Editando cotización existente');
      this.cotizacionSeleccionada.usumod = localStorage.getItem('login');
      this.cotizacionSeleccionada.fecmod = new Date();
      this.cotizacionSeleccionada.contenedores = JSON.stringify(this.contenedores);
      this.cotizacionService
        .editarCotizacion(
          this.cotizacionSeleccionada.id_cotizacion,
          this.cotizacionSeleccionada
        )
        .subscribe({
          next: () => {
            // this.mostrarFormulario = false;
            if (!this.guardarDentro) {
              Swal.fire({
                title: 'Actualizado',
                text: 'Cotización actualizada correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
              }).then((result) => {
                if (result.isConfirmed) {
                  this.obtenerListado();
                }
              });
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
            this.cotizacionSeleccionada.correlativo = res.correlativo;
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
    this.cotizacionSeleccionada = {
      ...cotizacion, fecha_llegada: cotizacion.fecha_llegada ? new Date(cotizacion.fecha_llegada) : null,
      fecha_limite: cotizacion.fecha_limite ? new Date(cotizacion.fecha_limite) : null
    };
    const cliente = this.clientes.find(c => c.value === cotizacion.nombre_comercial);
    if (cliente) {
      this.consignatario_contactos = JSON.parse(cliente.contactos || '[]');
    }
    const forwader = this.forwaders.find((f) => f.value === cotizacion.c_nombre_comercial);
    if (forwader) {
      this.forwarder_contactos = JSON.parse(forwader.contactos || '[]');
    }
    this.contenedores = this.cotizacionSeleccionada.contenedores;
    this.actualizarTipoCliente(this.cotizacionSeleccionada.modo_cliente);
    this.actualizarTipoCarga(this.cotizacionSeleccionada.id_tipo_carga);
    this.actualizarGateIn(this.cotizacionSeleccionada.id_naviera);
    this.actualizarTotal();
    this.actualizarOrigen(this.cotizacionSeleccionada.id_ciudad_origen);
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
        text: '¿Deseas guardar la cotización?',
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
          this.obtenerListado();
        }
      });
    } else {
      this.mostrarFormulario = false;
      this.cotizacionSeleccionada = {};
      this.modoEdicion = false;
      this.activeIndex = 0;
      this.obtenerListado();
    }


  }

  obtenerListado(): void {
    this.cotizacionService.getCotizaciones().subscribe({
      next: (data) => {
        this.cotizaciones = data;
        this.cotizaciones.forEach(cotizacion => {
          cotizacion.contenedores = JSON.parse(cotizacion.contenedores || '[]');
        });

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

  getNavieraGateIn(id: number): number {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.gate_in : 0;
  }

  getNavieraUrl(id: number): string {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.url : 'Sin URL';
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
  buscarForwaders(event: any) {
    const query = event.query.toLowerCase();
    this.filteredForwaders = this.forwaders
      .filter(f => f.nombre_comercial.toLowerCase().includes(query))
      .map(f => f.nombre_comercial);
  }

  contactoSeleccionado(event: any) {
    console.log('Evento seleccionado:', event);
    const forwader = this.forwaders.find(f => f.value === event);
    console.log('Forwader seleccionado:', forwader);

    if (forwader) {
      this.forwarder_contactos = JSON.parse(forwader.contactos || '[]');
      console.log('Contactos del consignatario:', this.forwarder_contactos);
      if (this.forwarder_contactos.length > 0) {
        console.log('Asignando contacto del forwarder:', this.forwarder_contactos[0]);
        this.cotizacionSeleccionada.c_persona_contacto = this.forwarder_contactos[0].persona_contacto;
        this.cotizacionSeleccionada.c_telefono = this.forwarder_contactos[0].telefono_contacto;
        this.cotizacionSeleccionada.c_correo = this.forwarder_contactos[0].correo_contacto;
      } else {
        this.cotizacionSeleccionada.c_persona_contacto = '';
        this.cotizacionSeleccionada.c_telefono = '';
        this.cotizacionSeleccionada.c_correo = '';
      }

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
          ciudad: cliente.ciudad,
          contactos: cliente.contactos
        }));
        console.log('Clientes cargados:', this.clientes);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      },
    });
  }
  getClienteNombre(id: number): string {
    const cliente = this.clientes.find((c) => c.value === id);
    return cliente ? cliente.nombre_comercial : 'Sin nombre';
  }
  buscarClientes(event: any) {
    const query = event.query.toLowerCase();
    this.filteredClientes = this.clientes
      .filter(c => c.nombre_comercial.toLowerCase().includes(query))
      .map(c => c.nombre_comercial);
  }

  clienteSeleccionado(event: any) {
    console.log('Evento seleccionado:', event);
    const cliente = this.clientes.find(c => c.value === event);
    if (cliente) {
      // this.cotizacionSeleccionada.nombre_comercial = cliente.nombre_comercial;
      this.consignatario_contactos = JSON.parse(cliente.contactos || '[]');
      console.log('Contactos del consignatario:', this.consignatario_contactos);
      if (this.consignatario_contactos.length > 0) {
        this.cotizacionSeleccionada.persona_contacto = this.consignatario_contactos[0].persona_contacto;
        this.cotizacionSeleccionada.telefono_contacto = this.consignatario_contactos[0].telefono_contacto;
        this.cotizacionSeleccionada.correo_contacto = this.consignatario_contactos[0].correo_contacto;
      } else {
        this.cotizacionSeleccionada.persona_contacto = '';
        this.cotizacionSeleccionada.telefono_contacto = '';
        this.cotizacionSeleccionada.correo_contacto = '';
      }

      this.cotizacionSeleccionada.ciudad = cliente.ciudad;
    }
  }

  clienteLimpio() {
    this.cotizacionSeleccionada.persona_contacto = '';
    this.cotizacionSeleccionada.telefono_contacto = '';
    this.cotizacionSeleccionada.correo_contacto = '';
    this.cotizacionSeleccionada.ciudad = null;
  }

  contactoConsignatarioSeleccionado(selected: any) {
    // selected es el objeto completo del contacto si bindValue no está definido, o el valor si bindValue está definido
    const contacto = this.consignatario_contactos.find(c => c.persona_contacto === selected);
    if (contacto) {

      this.cotizacionSeleccionada.persona_contacto = contacto.persona_contacto;
      this.cotizacionSeleccionada.telefono_contacto = contacto.telefono_contacto;
      this.cotizacionSeleccionada.correo_contacto = contacto.correo_contacto;
    }
  }
  contactoLimpio() {

    this.cotizacionSeleccionada.telefono_contacto = '';
    this.cotizacionSeleccionada.correo_contacto = '';
  }

  contactoForwarderSeleccionado(selected: any) {
    console.log('Forwarder TOP:', this.forwarder_contactos);

    const forwader = this.forwarder_contactos.find(f => f.persona_contacto === selected);
    console.log('Forwarder seleccionado:', forwader);

    if (forwader) {

      this.cotizacionSeleccionada.c_persona_contacto = forwader.persona_contacto;
      this.cotizacionSeleccionada.c_telefono = forwader.telefono_contacto;
      this.cotizacionSeleccionada.c_correo = forwader.correo_contacto;
    }
  }

  contactoForwarderLimpio() {

    this.cotizacionSeleccionada.c_telefono = '';
    this.cotizacionSeleccionada.c_correo = '';
  }

  actualizarTipoCliente(modo_cliente: string) {
    console.log('Actualizando tipo de cliente a:', modo_cliente);
    switch (modo_cliente) {
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
    const gateIn = Number(this.cotizacionSeleccionada.gate_in ? this.valorGateIn : 0);
    
    if (this.contenedores.length > 0) {
        // Veamos qué está pasando en cada iteración
        const valores = this.contenedores.map((c, index) => {
            const flete = Number(c.flete) || 0;
            const subtotal = flete + gateIn;
            return subtotal;
        });
        
        this.total = valores.reduce((a, b) => a + b, 0);
        this.cotizacionSeleccionada.flete = this.total;
    } else {
        const fleteValue = Number(this.flete) || 0;
        this.total = fleteValue + gateIn;
        this.cotizacionSeleccionada.flete = this.total;
    }
    
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
        { text: `Cliente: ${this.getClienteNombre(this.cotizacionSeleccionada.nombre_comercial)}`, style: 'subheader' },
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
      feccre: new Date(),
      contactos: '[]'
    };
    this.dialogCliente = true;
  }

  guardarCliente() {
    this.nuevoCliente.contactos = JSON.stringify([{
      persona_contacto: this.nuevoCliente.persona_contacto,
      telefono_contacto: this.nuevoCliente.telefono_contacto,
      correo_contacto: this.nuevoCliente.correo_contacto
    }]);
    this.nuevoCliente.persona_contacto = '';
    this.nuevoCliente.telefono_contacto = '';
    this.nuevoCliente.correo_contacto = '';
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
      feccre: new Date(),
      contactos: '[]'
    };
    this.dialogForwader = true;
  }

  guardarForwader() {
    this.nuevoForwader.contactos = JSON.stringify([{
      persona_contacto: this.nuevoForwader.persona_contacto,
      telefono_contacto: this.nuevoForwader.telefono,
      correo_contacto: this.nuevoForwader.correo
    }]);
    this.nuevoForwader.persona_contacto = '';
    this.nuevoForwader.telefono = '';
    this.nuevoForwader.correo = '';
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

  //MERCANCIA
  crearMercancia() {
    this.nuevaMercancia = {
      mercancia: '',
      descripcion: '',
      usucre: localStorage.getItem('login'),
      feccre: new Date()
    };
    this.dialogMercancia = true;
  }

  guardarMercancia() {
    this.cotizacionService.insertarMercancia(this.nuevaMercancia).subscribe({
      next: () => {
        this.dialogMercancia = false;
        this.obtenerMercancias();
        Swal.fire('Insertado', 'Mercancia creada correctamente', 'success');
      },
      error: err => {
        console.error('Error al insertar cliente:', err);
        Swal.fire('Error', 'No se pudo insertar el cliente.', 'error');
      }
    });
  }

  async generarCotizacion() {
    this.guardarCambios();
    console.log('Generando cotización PDF para:', this.cotizacionSeleccionada);
    console.log('Generando PDF para:', this.contenedores);

    const c = this.cotizacionSeleccionada;
    const hojaMembrete = 'assets/images/membretado.jpg';

    const fondoBase64 = await this.getBase64ImageFromURL(hojaMembrete);

    const tablasContenedores = this.contenedores.map((c, index) => ([
      // ⭐ Título del contenedor
      ...(this.contenedores.length > 1 ? [{
        text: `Contenedor ${index + 1}`,
        style: 'tituloContenedor',
        margin: [0, 10, 0, 5]
      }] : []),
      ,

      // ⭐ Tabla del contenedor
      {
        style: 'tablaContenedor',
        table: {
          widths: ['30%', '70%'],
          body: [
            ['Número de Contenedor', c.numero_contenedor || ''],
            ['Tamaño', c.tamano || ''],
            ['Peso (kg)', c.peso_kg || ''],
            ['Mercancía', this.getMercanciaNombre(c.id_mercancia) || ''],
            ['Embalaje', c.embalaje || ''],
            ['Volumen (m3)', c.volumen_m3 || ''],
            ['Flete', c.flete ? `${c.flete} $` : ''],
          ]
        },
        margin: [0, 0, 0, 10]
      }
    ]));

    const docDefinition: any = {
      background: function (_currentPage: number) {
        return {
          image: fondoBase64,
          width: 595,  // tamaño A4 en puntos (ancho)
          height: 842, // tamaño A4 en puntos (alto)
        };
      },

      pageMargins: [40, 100, 40, 70],
      content: [
        { text: 'COTIZACIÓN #' + c.correlativo, style: 'header', alignment: 'center', margin: [0, 0, 0, 5] },

        // Datos del cliente
        ...(c.nombre_comercial
          ? [
            { text: 'Datos del Cliente', style: 'subheader' },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Nombre Comercial', this.getClienteNombre(c.nombre_comercial) || ''],
                  ['NIT', c.nit || ''],
                  ['Persona de Contacto', c.persona_contacto || ''],
                  ['Correo', c.correo_contacto || ''],
                  ['Teléfono', c.telefono_contacto || ''],
                  ['Ciudad', c.ciudad ? this.getCiudadNombre(c.ciudad) || '' : ''],
                ]
              },
              margin: [0, 0, 0, 20]
            }]
          : []),

        // Datos del contacto (Forwarder)
        ...(c.c_nombre_comercial
          ? [
            { text: 'Datos del Contacto', style: 'subheader' },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Nombre Comercial', c.c_nombre_comercial ? this.getForwaderNombre(c.c_nombre_comercial) || '' : ''],
                  ['Persona de Contacto', c.c_persona_contacto || ''],
                  ['Correo', c.c_correo || ''],
                  ['Teléfono', c.c_telefono || ''],
                  ['Ciudad', c.c_ciudad ? this.getCiudadNombre(c.c_ciudad) || '' : ''],
                ]
              },
              margin: [0, 0, 0, 20]
            }
          ]
          : []),

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
              // ['Peso (kg)', c.peso_kg || ''],
              // ['Mercancía', this.getMercanciaNombre(c.id_mercancia) || ''],
              // ['Embalaje', c.embalaje || ''],
              // ['Volumen (m3)', c.volumen_m3 || '']
              ['Observaciones', c.observacion || '']
            ]
          },
          margin: [0, 0, 0, 20]
        },
        ...(this.contenedores.length === 0) ? [] : [
          { text: this.contenedores.length > 1 ? 'Contenedores' : 'Contenedor', style: 'subheader' },
          ...tablasContenedores],

        // Datos de logística
        { text: 'Datos de Logística', style: 'subheader' },
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              ['Naviera', c.id_naviera ? this.getNavieraNombre(c.id_naviera) || '' : ''],
              ['Fecha Llegada', c.fecha_llegada ? new Date(c.fecha_llegada).toLocaleDateString() : ''],
              ['Fecha Limite', c.fecha_limite ? new Date(c.fecha_limite).toLocaleDateString() : ''],
              ['Ciudad Origen', c.id_ciudad_origen ? this.getCiudadNombre(c.id_ciudad_origen) || '' : ''],
              ['Ciudad Destino', c.id_ciudad_destino ? this.getCiudadNombre(c.id_ciudad_destino) || '' : ''],
              ['Despacho Aduanero', c.id_despacho_aduanero || ''],
              ['Lugar Descarga', c.lugar_descarga || ''],
              ['Despacho Portuario', c.id_despacho_portuario || ''],
              ['Camion', c.camion || ''],
              ['Devolución', c.devolucion ? 'Sí' : 'No'],
              ['Gate In', c.gate_in ? 'Sí' : 'No'],
              ['Total Flete', c.flete ? `${c.flete} $` : ''],
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

    console.log("DATO1 " + c.nombre_comercial)
    console.log("DATO2 " + c.c_nombre_comercial)
    pdfMake.createPdf(docDefinition).download(`COTIZACION_${c.c_nombre_comercial ? this.getForwaderNombre(c.c_nombre_comercial) : this.getClienteNombre(c.nombre_comercial)}_${c.correlativo}.pdf`);

  }

  getBase64ImageFromURL(url: string): Promise<string> {
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

  get cotizacionesFiltradas() {
    return this.cotizaciones.filter(c => {
      const clienteStr = this.getClienteNombre(c.nombre_comercial)?.toLowerCase() || '';

      const cont = c.contenedores?.[0] || {};

      return (
        clienteStr.includes(this.filtroCliente.toLowerCase())&&

      (cont.numero_contenedor || '').toString().toLowerCase().includes(this.filtroContenedor.toLowerCase()) &&
      (cont.tamano || '').toString().toLowerCase().includes(this.filtroTamano.toLowerCase()) &&
      (cont.peso_kg || '').toString().toLowerCase().includes(this.filtroPeso.toLowerCase()) &&

      this.getNavieraNombre(c.id_naviera).toLowerCase().includes(this.filtroNaviera.toLowerCase()) &&
      (c.tipo_documento || '').toLowerCase().includes(this.filtroTipoDoc.toLowerCase()) &&
      (c.id_tipo_carga || '').toLowerCase().includes(this.filtroTipoCarga.toLowerCase()) &&
      this.getCiudadNombre(c.id_ciudad_origen).toLowerCase().includes(this.filtroOrigen.toLowerCase()) &&
      this.getCiudadNombre(c.id_ciudad_destino).toLowerCase().includes(this.filtroDestino.toLowerCase()) &&

      this.formatFecha(c.fecha_llegada).includes(this.filtroFecha) &&
      (c.flete || '').toString().includes(this.filtroFlete) &&
      (c.correlativo || '').toString().includes(this.filtroCorrelativo)
      );
    });
  }

  filtrarClientes(event: any) {
    if (this.opcionesClientes.length === 0) {
      const idsclientes = new Set(this.cotizaciones.map(d => d.nombre_comercial));
      this.opcionesClientes = this.clientes
        .filter(c => idsclientes.has(c.value))
        .map(c => ({
          label: c.nombre_comercial,
          value: c.value
        }));
    }


    console.log('Filtrando clientes con query:', this.opcionesClientes);

    const query = event.query.toLowerCase();
    this.clientesFiltrados = this.opcionesClientes.filter(c =>
      c.label.toLowerCase().includes(query)
    );
  }

  calcularFechaLimite(fechaLlegada: Date) {
    if (!fechaLlegada) return;

    const fechaLimite = new Date(fechaLlegada);
    console.log('Días para fecha límite:', this.getNavieraDias(this.cotizacionSeleccionada.id_naviera));
    fechaLimite.setDate(fechaLimite.getDate() + this.getNavieraDias(this.cotizacionSeleccionada.id_naviera));

    this.cotizacionSeleccionada.fecha_limite = fechaLimite;
  }

  getNavieraDias(id: number): number {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.dias : 20;
  }

  actualizarOrigen(despacho: string) {
    const origen = this.getCiudadNombre(Number(despacho));
    switch (origen) {
      case 'IQUIQUE':
        this.bloquearOrigen = false;
        break;
      default:
        this.bloquearOrigen = true;
        if (!this.modoEdicion) {
          setTimeout(() => {
            this.cotizacionSeleccionada.id_despacho_portuario = '';
          }, 0);
        }

    }
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

  // copiarTexto(texto: string) {
  //   navigator.clipboard.writeText(texto)
  //     .then(() => {
  //       console.log('Texto copiado al portapapeles:', texto);
  //       // Puedes mostrar un mensaje de confirmación visual
  //     })
  //     .catch(err => {
  //       console.error('Error al copiar:', err);
  //     });
  // }

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

  estiloFila(despacho: any): string {

    if (!despacho.estado) return '';
    if (despacho.estado === 'ACEPTADO') {
      return 'cotizacion-aceptada'; // Aceptado
    } else {
      return '';
    }
  }

  nuevoContenedor() {
    this.contenedorActual = {
      numero_contenedor: '',
      tamano: '',
      peso_kg: '',
      id_mercancia: null,
      embalaje: '',
      volumen_m3: null,
      flete: null
    };
    this.editIndex = null;
    this.contenedorVisible = true;
  }

  guardarContenedor() {
    if (this.editIndex != null) {
      this.contenedores[this.editIndex] = this.contenedorActual;
    } else {
      this.contenedores.push(this.contenedorActual);
    }
    this.cotizacionSeleccionada.contenedores = JSON.stringify(this.contenedores);;
    this.contenedorVisible = false;
  }

  editarContenedor(i: number) {
    this.editIndex = i;
    this.contenedorActual = { ...this.contenedores[i] }; // clonar
    this.contenedorVisible = true;
  }

  eliminarContenedor(i: number) {
    this.contenedores.splice(i, 1);
    this.cotizacionSeleccionada.contenedores = JSON.stringify(this.contenedores);;
  }

  crearConsignatarioContacto() {
    this.nuevoConsignatarioContacto = {
      persona_contacto: '',
      telefono_contacto: '',
      correo_contacto: ''
    };
    this.contactoConsignatarioVisible = true;
  }

  guardarConsignatarioContacto() {
    const cliente = this.clientes.find(c => c.value === this.cotizacionSeleccionada.nombre_comercial);
    let nuevo_contacto;
    if (cliente) {
      nuevo_contacto = JSON.parse(cliente.contactos || '[]');
      nuevo_contacto.push(this.nuevoConsignatarioContacto);

      cliente.contactos = JSON.stringify(nuevo_contacto);

      this.cotizacionService.editarCliente(cliente.value, cliente).subscribe({
        next: () => {
          this.contactoConsignatarioVisible = false;
          this.obtenerClientes();
          this.consignatario_contactos = JSON.parse(cliente.contactos || '[]');
          Swal.fire('Insertado', 'Contacto creado correctamente', 'success');
        },
        error: err => {
          console.error('Error al insertar contacto:', err);
          Swal.fire('Error', 'No se pudo insertar el contacto.', 'error');
        }
      });
    } else {
      Swal.fire('Error', 'Cliente no encontrado.', 'error');
    }

  }

  crearForwarderContacto() {
    this.nuevoForwarderContacto = {
      persona_contacto: '',
      telefono_contacto: '',
      correo_contacto: ''
    };
    this.contactoForwarderVisible = true;
  }

  guardarForwarderContacto() {
    const forwader = this.forwaders.find(f => f.value === this.cotizacionSeleccionada.c_nombre_comercial);
    console.log('Forwader encontrado para agregar contacto:', forwader);
    console.log('Forwader :', this.nuevoForwarderContacto);
    let nuevo_contacto;
    if (forwader) {
      nuevo_contacto = JSON.parse(forwader.contactos || '[]');
      nuevo_contacto.push(this.nuevoForwarderContacto);

      forwader.contactos = JSON.stringify(nuevo_contacto);

      this.cotizacionService.editarForwader(forwader.value, forwader).subscribe({
        next: () => {
          this.contactoForwarderVisible = false;
          this.obtenerForwaders();
          this.forwarder_contactos = JSON.parse(forwader.contactos || '[]');
          Swal.fire('Insertado', 'Contacto creado correctamente', 'success');
        },
        error: err => {
          console.error('Error al insertar forwader:', err);
          Swal.fire('Error', 'No se pudo insertar el forwader.', 'error');
        }
      });
    } else {
      Swal.fire('Error', 'Forwader no encontrado.', 'error');
    }

  }

  exportarCotizacionesExcel() {
  const datosParaExcel: any[] = [];

  this.cotizacionesFiltradas.forEach(c => {
    // Si tiene múltiples contenedores, generamos una fila por contenedor
    if (c.contenedores && c.contenedores.length > 1) {
      c.contenedores.forEach((cont: { numero_contenedor: any; tamano: any; peso_kg: any; }) => {
        datosParaExcel.push({
          'Nombre Consignatario': c.nombre_comercial
            ? this.getClienteNombre(c.nombre_comercial)
            : this.getForwaderNombre(c.c_nombre_comercial) + " (" + c.tipo_cliente + ")",

          'N° Contenedor': cont.numero_contenedor,
          'Tamaño Contenedor': cont.tamano,
          'Peso KG': cont.peso_kg,

          'Naviera': this.getNavieraNombre(c.id_naviera),
          'Tipo Documento': c.tipo_documento,
          'Tipo Carga': c.id_tipo_carga,
          'Origen': this.getCiudadNombre(c.id_ciudad_origen),
          'Destino': this.getCiudadNombre(c.id_ciudad_destino),
          'Fecha Llegada': this.formatFecha(c.fecha_llegada),
          'Flete': c.flete,
          'N° Cotización': c.correlativo
        });
      });

    } else {
      // Contenedor único o ninguno
      const cont = c.contenedores?.[0] || {};

      datosParaExcel.push({
        'Nombre Consignatario': c.nombre_comercial
          ? this.getClienteNombre(c.nombre_comercial)
          : this.getForwaderNombre(c.c_nombre_comercial) + " (" + c.tipo_cliente + ")",

        'N° Contenedor': cont.numero_contenedor || '',
        'Tamaño Contenedor': cont.tamano || '',
        'Peso KG': cont.peso_kg || '',

        'Naviera': this.getNavieraNombre(c.id_naviera),
        'Tipo Documento': c.tipo_documento,
        'Tipo Carga': c.id_tipo_carga,
        'Origen': this.getCiudadNombre(c.id_ciudad_origen),
        'Destino': this.getCiudadNombre(c.id_ciudad_destino),
        'Fecha Llegada': this.formatFecha(c.fecha_llegada),
        'Flete': c.flete,
        'N° Cotización': c.correlativo
      });
    }
  });

  // Crear hoja Excel
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Cotizaciones': worksheet },
    SheetNames: ['Cotizaciones']
  };

  // Buffer y descarga
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  const fecha = new Date().toISOString().split('T')[0];

  saveAs(dataBlob, `cotizaciones_${fecha}.xlsx`);
}

formatFecha(fecha: string | Date) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toISOString().split('T')[0]; // yyyy-mm-dd
  }


}