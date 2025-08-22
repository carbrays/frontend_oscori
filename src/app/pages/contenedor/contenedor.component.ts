import { Component, OnInit} from '@angular/core';
import { ContenedorService } from 'src/app/services/contenedor/contenedor.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

import axios from 'axios';
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
  selector: 'app-contenedor',
  templateUrl: './contenedor.component.html',
  styleUrls: ['./contenedor.component.css']
})
export class ContenedoresComponent implements OnInit {
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
filtroEstadoContenedor: string = '';
filtroFechaLlegada: string = '';
filtroFechaLimite: string = '';
filtroEstado: string = '';
filtroFechaDevolucion: string = '';
filtroUbicacionDevolucion: string = '';
filtroDias: string = '';
filtroObservaciones: string = '';
filtroBlMadre: string = '';

opcionesVencimiento = [
  { label: 'Todos', value: '' },
  { label: 'Vencidos', value: 'fecha-vencida' },
  { label: 'Por vencer', value: 'fecha-pre-vencida' },
  { label: 'Devueltos', value: 'fecha-devuelto' }
];

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
    { id: 'LAVADO', nombre: 'LAVADO' }
  ];

  mostrarTabla = true;

  imagenSeleccionada: any = null;

  imagenSeleccionadaURL: string = '';
  mostrarDialogImagen: boolean = false;

  imagenes: any[] = [];

  pdfSeleccionadoURL: string = '';

  constructor(private contenedorService: ContenedorService) {}

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
    const estadoContenedorStr = contenedor.estado_contenedor?.toLowerCase() || '';
    const fechaLlegadaStr = contenedor.fecha_llegada ? new Date(contenedor.fecha_llegada).toISOString().slice(0,10) : '';
    const fechaLimiteStr = contenedor.fecha_limite ? new Date(contenedor.fecha_limite).toISOString().slice(0,10) : '';
    const estadoStr = contenedor.estado?.toLowerCase() || '';
    const fechaDevolucionStr = contenedor.fecha_devolucion ? new Date(contenedor.fecha_devolucion).toISOString().slice(0,10) : '';
    const ubicacionDevolucionStr = contenedor.ubicacion_devolucion?.toLowerCase() || '';
    const diasStr = contenedor.dias?.toString() || '';
    const observacionesStr = contenedor.observaciones?.toLowerCase() || '';

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
      estadoContenedorStr.includes(this.filtroEstadoContenedor.toLowerCase()) &&
      fechaLlegadaStr.includes(this.filtroFechaLlegada.toLowerCase()) &&
      fechaLimiteStr.includes(this.filtroFechaLimite.toLowerCase()) &&
      estadoStr.includes(this.filtroEstado.toLowerCase()) &&
      fechaDevolucionStr.includes(this.filtroFechaDevolucion.toLowerCase()) &&
      ubicacionDevolucionStr.includes(this.filtroUbicacionDevolucion.toLowerCase()) &&
      diasStr.includes(this.filtroDias.toLowerCase()) &&
      observacionesStr.includes(this.filtroObservaciones.toLowerCase())
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

        this.verificarFechas(); 
        // this.generarClientesUnicos(); 
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
  this.filtroEstadoContenedor = '';
  this.filtroFechaLlegada = '';
  this.filtroFechaLimite = '';
  this.filtroEstado = '';
  this.filtroFechaDevolucion = '';
  this.filtroUbicacionDevolucion = '';
  this.filtroDias = '';
  this.filtroObservaciones = '';
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
      ubicacion_devolucion: ''
    };
    this.popupVisible = true;
    this.modoEdicion = false;
    this.tituloPopup = 'Nuevo Contenedor';
  }

  editarContenedor(contenedor: any): void {
    this.contenedorSeleccionado = { ...contenedor, fecha_devolucion: contenedor.fecha_devolucion ? new Date(contenedor.fecha_devolucion) : null, };
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

  urlPdf(id: string) {
  return `http://localhost:3000/despachos/verPdf/${id}`;
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
  } else if(estado === 'DEVUELTO') {
    return 'fecha-devuelto'; // No aplica estilo
  } else {
    return '';
  }
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
      return limite.getTime() === fechaComparar.getTime()  && v.estado != 'DEVUELTO';
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
    next: () => {
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

  // ✅ Generar el nuevo nombre automáticamente
  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const nuevoNombre = `${contenedor.id_contenedor}-${nombre}.${extension}`;

  Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Deseas subir la imagen con el nombre: "${nuevoNombre}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, subir',
    cancelButtonText: 'No, cancelar'
  }).then((confirmResult) => {
    if (confirmResult.isConfirmed) {
      const formData = new FormData();

      // ✅ Crear nuevo File con nombre automático
      const nuevoArchivo = new File([file], nuevoNombre, { type: file.type });

      formData.append('archivo', nuevoArchivo);
      formData.append('id_contenedor', contenedor.id_contenedor.toString());
      formData.append('nombre', nombre);

      axios.post(`${URL_SERVICIOS}/contenedor/subir_imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(response => {
          Swal.fire('¡Subido!', 'La imagen se subió correctamente.', 'success');
          this.obtenerImagenes();  
          this.obtenerListado();
        })
        .catch(error => {
          console.error('Error al subir la imagen', error);
          Swal.fire('Error', 'Error al subir la imagen. Intenta nuevamente.', 'error');
        });
    } else {
      input.value = '';
    }
  });
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
  const isA     = ano >= (CY - 1) && ano <= CY;       // 2024–2025 (hoy)
  const isB     = ano >= (CY - 3) && ano <= (CY - 2); // 2022–2023
  const isC     = ano >= (CY - 14) && ano <= (CY - 4);// 2011–2021
  const isCraft = ano <= (CY - 15);                   // <= 2010

  if (naviera === 'MAERSK') {
    if (isA)      this.contenedorSeleccionado.id_categoria = 'S-M "A"';
    else if (isB) this.contenedorSeleccionado.id_categoria = 'K "B"';
    else if (isC) this.contenedorSeleccionado.id_categoria = 'E "C"';
    else if (isCraft) this.contenedorSeleccionado.id_categoria = 'Q "craft"';
    else this.contenedorSeleccionado.id_categoria = 'Desconocido';
  } else {
    if (isA)      this.contenedorSeleccionado.id_categoria = 'A';
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

verPdfs(contenedor: any, documento: any){
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
    // Swal.fire({
    //   title: '¿Estás seguro?',
    //   text: `¿Deseas eliminar el PDF: "${pdf.nombre}"?`,
    //   icon: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Sí, eliminar',
    //   cancelButtonText: 'No, cancelar'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.contenedorService.eliminarPdf(pdf.id).subscribe({
    //       next: () => {
    //         Swal.fire('¡Eliminado!', 'El archivo PDF se eliminó correctamente.', 'success');
    //         this.obtenerPdfs(this.documentoSeleccionado);
    //       },
    //       error: () => {
    //         Swal.fire('Error', 'Error al eliminar el archivo PDF. Intenta nuevamente.', 'error');
    //       }
    //     });
    //   }
    // });
  }


}
