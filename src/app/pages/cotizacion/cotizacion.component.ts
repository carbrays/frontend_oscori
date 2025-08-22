import { Component, OnInit } from '@angular/core';
import { CotizacionService } from 'src/app/services/cotizacion/cotizacion.service';
import Swal from 'sweetalert2';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';

import { MenuItem } from 'primeng/api';

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
  clientes: { label: string; value: number, razon_social: string, correo: string, telefono: string, ciudad: string }[] = [];

  modo_cliente = [
  { label: 'CONSIGNATARIO', value: 'CONSIGNATARIO' },
  { label: 'TERCERO', value: 'TERCERO' }
];

categoria_cliente= [
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
    { id: 'BL', nombre: 'BL'},
    { id: 'FACTURA_COMERCIAL', nombre: 'FACTURA COMERCIAL'},
    { id: 'LISTA_EMPAQUE', nombre: 'LISTA EMPAQUE'},
    { id: 'DAM', nombre: 'DAM'},
    { id: 'DIM', nombre: 'DIM'},
    { id: 'GOC_ASPB', nombre: 'GOC ASPB'},
    { id: 'PERMISOS', nombre: 'PERMISOS'},
    { id: 'LIBERACION', nombre: 'LIBERACION'},
  ];

  documentosRequeridosIquique = [
    { id: 'BL', nombre: 'BL'},
    { id: 'FACTURA_COMERCIAL', nombre: 'FACTURA COMERCIAL'},
    { id: 'LISTA_EMPAQUE', nombre: 'LISTA EMPAQUE'},
    { id: 'DAM', nombre: 'DAM'},
    { id: 'DIM', nombre: 'DIM'},
    { id: 'CERTIFICADO_COSTO_0_ITI', nombre: 'COSTO 0 ITI'},
    { id: 'PERMISOS', nombre: 'PERMISOS'},
    { id: 'LIBERACION', nombre: 'LIBERACION'},
    { id: 'DRESS', nombre: 'DRESS'},
    { id: 'CONVENIO_ITI', nombre: 'CONVENIO ITI'},
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

  constructor(private cotizacionService: CotizacionService) {}

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
    razon_social: '',
    nombre_comercial: '',
    correo: '',
    telefono: '',
    ciudad: '',
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
    categoria_cliente: '',
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
    this.actualizarRazonSocial(this.cotizacionSeleccionada.categoria_cliente);
    this.actualizarTipoCarga(this.cotizacionSeleccionada.id_tipo_carga);
    this.actualizarGateIn(this.cotizacionSeleccionada.id_navieria);
    this.actualizarTotal();
    this.mostrarFormulario = true;
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
    if(this.algunDatoVigiladoModificado()){
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
      } else if (result.isDismissed){
        this.mostrarFormulario = false;
        this.cotizacionSeleccionada = {};
        this.modoEdicion = false;
        this.activeIndex = 0;
      }
    });
    }else{
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
  
    obtenerClientes(): void {
  this.cotizacionService.getClientes().subscribe({
    next: (data) => {
      this.clientes = data.map((cliente) => ({
        label: cliente.nombre_comercial, 
        value: cliente.id_cliente,       
        razon_social: cliente.razon_social,
        correo: cliente.correo,
        telefono: cliente.telefono,
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
    .filter(c => c.label.toLowerCase().includes(query))
    .map(c => c.label);
}


onAgregarCliente(nombreNuevo: string) {
  const nuevoCliente = {
    label: nombreNuevo,
    value: 0, // or use a temporary negative number if needed
    razon_social: nombreNuevo,
    correo: '',
    telefono: '',
    ciudad: '' // empty string as default
  };

  this.clientes.push(nuevoCliente);
  this.cotizacionSeleccionada.id_cliente = null; // ID temporal
}
    getClienteNombre(id: number): string {
      const cliente = this.clientes.find((c) => c.value === id);
      return cliente ? cliente.label : 'Sin nombre';
    }

    onClienteChange(clienteId: number | string) {
  const cliente = this.clientes.find(c => c.value === clienteId);

  if (cliente) {
    // Cliente existente: llenar automáticamente
    this.cotizacionSeleccionada.razon_social = cliente.razon_social;
    this.cotizacionSeleccionada.nombre_comercial = cliente.label;
    this.cotizacionSeleccionada.correo = cliente.correo;
    this.cotizacionSeleccionada.telefono = cliente.telefono;
    this.cotizacionSeleccionada.ciudad = cliente.ciudad;
  } else {
    // Nuevo cliente: limpiar campos
    this.cotizacionSeleccionada.razon_social = '';
    this.cotizacionSeleccionada.nombre_comercial = '';
    this.cotizacionSeleccionada.correo = '';
    this.cotizacionSeleccionada.telefono = '';
    this.cotizacionSeleccionada.ciudad = null;
  }
}

onAgregarRazonSocial(nueva: string) {
  if (!this.clientes.find(c => c.razon_social === nueva)) {
    this.clientes.push({ value: 0, razon_social: nueva, label: '', correo: '', telefono: '', ciudad: '' });
  }
}

onAgregarNombreComercial(nuevo: string) {
  if (!this.clientes.find(c => c.label === nuevo)) {
    this.clientes.push({ value: 0, razon_social: '', label: nuevo, correo: '', telefono: '', ciudad: '' });
  }
}

// Cuando cambias la razón social
onRazonSocialChange(razon: string) {
  const cliente = this.clientes.find(c => c.razon_social === razon);
  if (cliente) {
    this.cotizacionSeleccionada.nombre_comercial = cliente.label;
    this.cotizacionSeleccionada.correo = cliente.correo;
    this.cotizacionSeleccionada.telefono = cliente.telefono;
    this.cotizacionSeleccionada.ciudad = cliente.ciudad;
  } else {
    this.cotizacionSeleccionada.nombre_comercial = '';
    this.cotizacionSeleccionada.correo = '';
    this.cotizacionSeleccionada.telefono = '';
    this.cotizacionSeleccionada.ciudad = null;
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

    actualizarRazonSocial(razon_social: string) {
    switch (razon_social) {
      case 'UNIPERSONAL':
        this.bloquearRazonSocial = true;
        setTimeout(() => {
          this.cotizacionSeleccionada.razon_social = '';
        }, 0);
        break;
      default:
        this.bloquearRazonSocial = false;
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
  

}