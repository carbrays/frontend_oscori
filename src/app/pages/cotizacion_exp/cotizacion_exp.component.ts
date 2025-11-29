import { Component, OnInit } from '@angular/core';
import { Cotizacion_ExpService } from 'src/app/services/cotizacion_exp/cotizacion_exp.service';
import Swal from 'sweetalert2';

import { MenuItem } from 'primeng/api';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-cotizacion_exp',
  templateUrl: './cotizacion_exp.component.html',
  styleUrls: ['./cotizacion_exp.component.css'],
})
export class Cotizacion_ExpComponent implements OnInit {

  steps: MenuItem[] = [];
  activeIndex: number = 0;

  cotizaciones: any[] = [];
  cotizacionSeleccionada: any = {};

  modoEdicion = false;
  mostrarFormulario: boolean = false;

  ciudades: { label: string; value: number }[] = [];
  navieras: { label: string; value: number, gate_in: number, dias: number, url: string }[] = [];
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

  tipo_carga = [
    { label: 'DESCONSOLIDADO', value: 'DESCONSOLIDADO' },
    { label: 'CARGA SUELTA', value: 'CARGA_SUELTA' },
    { label: 'CONTENEDOR', value: 'CONTENEDOR' },
  ];

  estado = [
    { label: 'ACEPTADO', value: 'ACEPTADO' },
    { label: 'RECHAZADO', value: 'RECHAZADO' }
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

  filtroCliente: string = '';
  cliente: any = null;
  clientesFiltrados: any[] = [];
  opcionesClientes: { label: string; value: number }[] = [];

  constructor(private cotizacionService: Cotizacion_ExpService) { }

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
      mercancia: '',
      crt: '',
      id_tipo_carga: null,
      numero_contenedor: '',
      tamano: '',
      peso_kg: '',
      id_naviera: null,
      fecha_carga: null,
      fecha_descarga: null,
      fecha_stack: null,
      id_ciudad_origen: null,
      id_ciudad_destino: null,
      gate_in: false,
      flete: null,
      estado: '',
      usucre: localStorage.getItem('login') || '',
      feccre: new Date(),
      usumod: null,
      fecmod: null,
      categoria_cliente: '',
      observacion: ''
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
    this.cotizacionSeleccionada = { ...cotizacion, fecha_carga: cotizacion.fecha_carga ? new Date(cotizacion.fecha_carga) : null,
    fecha_descarga: cotizacion.fecha_descarga ? new Date(cotizacion.fecha_descarga) : null,
    fecha_stack: cotizacion.fecha_stack ? new Date(cotizacion.fecha_stack) : null
     };
    this.actualizarTipoCliente(this.cotizacionSeleccionada.modo_cliente);
    this.actualizarTipoCarga(this.cotizacionSeleccionada.id_tipo_carga);
    this.actualizarGateIn(this.cotizacionSeleccionada.id_naviera);
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
  getForwaderNombre(id: number): string {
    const forwader = this.forwaders.find((f) => f.value === id);
    return forwader ? forwader.label : 'Sin nombre';
  }
  buscarForwaders(event: any) {
    const query = event.query.toLowerCase();
    this.filteredForwaders = this.forwaders
      .filter(f => f.label.toLowerCase().includes(query))
      .map(f => f.label);
  }

  contactoSeleccionado(event: any) {
    console.log('Evento seleccionado:', event);
    const forwader = this.forwaders.find(f => f.value === event);
    console.log('Forwader seleccionado:', forwader);
    if (forwader) {
      // this.cotizacionSeleccionada.c_nombre_comercial = forwader.label;
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
      this.cotizacionSeleccionada.persona_contacto = cliente.persona_contacto;
      this.cotizacionSeleccionada.telefono_contacto = cliente.telefono_contacto;
      this.cotizacionSeleccionada.correo_contacto = cliente.correo_contacto;
      this.cotizacionSeleccionada.ciudad = cliente.ciudad;
    }
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
    // Convertimos a número ambos valores
    const flete = Number(this.cotizacionSeleccionada.flete) || 0;
    const gateIn = Number(this.cotizacionSeleccionada.gate_in ? this.valorGateIn : 0);

    this.total = flete + gateIn;
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

  async generarCotizacion() {
    const c = this.cotizacionSeleccionada;
    const hojaMembrete = 'assets/images/membretado.jpg';

    const fondoBase64 = await this.getBase64ImageFromURL(hojaMembrete);

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
        },

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
              ['CRT', c.crt || ''],
              ['Tipo de Carga', c.id_tipo_carga || ''],
              ['Número de Contenedor', c.numero_contenedor || ''],
              ['Tamaño', c.tamano || ''],
              ['Peso (kg)', c.peso_kg || ''],
              ['Mercancía', c.mercancia || ''],
              ['Observaciones', c.observacion || '']
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
              ['Naviera', c.id_naviera ? this.getNavieraNombre(c.id_naviera) || '' : ''],
              ['Fecha Carga', c.fecha_carga ? new Date(c.fecha_carga).toLocaleDateString() : ''],
              ['Fecha Descarga', c.fecha_descarga ? new Date(c.fecha_descarga).toLocaleDateString() : ''],
              ['Fecha Stack', c.fecha_stack ? new Date(c.fecha_stack).toLocaleDateString() : ''],
              ['Ciudad Origen', c.id_ciudad_origen ? this.getCiudadNombre(c.id_ciudad_origen) || '' : ''],
              ['Ciudad Destino', c.id_ciudad_destino ? this.getCiudadNombre(c.id_ciudad_destino) || '' : ''],
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

    pdfMake.createPdf(docDefinition).download(`COTIZACION_${this.getClienteNombre(c.nombre_comercial)}_${c.correlativo}.pdf`);

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
    return this.cotizaciones.filter(cotizacion => {
      const clienteStr = this.getClienteNombre(cotizacion.nombre_comercial)?.toLowerCase() || '';
      return (
        clienteStr.includes(this.filtroCliente.toLowerCase())
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

    const query = event.query.toLowerCase();
    this.clientesFiltrados = this.opcionesClientes.filter(c =>
      c.label.toLowerCase().includes(query)
    );
  }

  getNavieraDias(id: number): number {
    const naviera = this.navieras.find((n) => n.value === id);
    return naviera ? naviera.dias : 20;
  }

  onRowClick(cotizacion: any) {
    if (cotizacion.numero_contenedor) {
      this.copiarTexto(cotizacion.numero_contenedor);
      window.open(this.getNavieraUrl(cotizacion.id_naviera), '_blank');
    }
  }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto)
      .then(() => {
        console.log('Texto copiado al portapapeles:', texto);
        // Puedes mostrar un mensaje de confirmación visual
      })
      .catch(err => {
        console.error('Error al copiar:', err);
      });
  }

  estiloFila(despacho: any): string {

    if (!despacho.estado) return '';
    if (despacho.estado === 'ACEPTADO') {
      return 'cotizacion-aceptada'; // Aceptado
    } else {
      return '';
    }
  }

}