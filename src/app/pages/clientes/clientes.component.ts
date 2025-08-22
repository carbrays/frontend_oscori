import { Component, NgZone, OnInit } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clientes: any[] = [];
  popupVisible = false;
  modoEdicion = false;
  clienteSeleccionado: any = {};
  tituloPopup = 'Cliente';

  estados = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Anulado', value: 'ANULADO' }
  ];

  filtroCliente: string = '';

  constructor(private clienteService: ClientesService, private zone: NgZone) { }

  ngOnInit(): void {
    this.obtenerListado();
  }

  get clientesFiltrados() {
  if (!this.filtroCliente) {
    return this.clientes;
  }

  const texto = this.filtroCliente.toLowerCase();
  return this.clientes.filter(cliente =>
    cliente.nombre_comercial?.toLowerCase().includes(texto)
  );
}


getClienteNombre(id: number): string {
    const cliente = this.clientes.find((c) => c.value === id);
    return cliente ? cliente.label : 'Sin nombre';
  }

  obtenerListado(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (err) => {
        console.error('Error al obtener clientes', err);
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    });
  }

  abrirNuevoCliente(): void {
    this.clienteSeleccionado = {
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
    this.tituloPopup = 'Nuevo Cliente';
    this.popupVisible = true;
    this.modoEdicion = false;
  }

  editarCliente(cliente: any): void {
    this.clienteSeleccionado = { ...cliente };
    this.tituloPopup = 'Editar Cliente';
    this.popupVisible = true;
    this.modoEdicion = true;
  }

  eliminarCliente(cliente: any): void {
    Swal.fire({
      title: `¿Eliminar cliente "${cliente.nombre_comercial}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.clienteService.eliminarCliente(cliente.id_cliente).subscribe({
          next: () => {
            this.clientes = this.clientes.filter(c => c.id_cliente !== cliente.id_cliente);
            Swal.fire('Eliminado', 'Cliente eliminado correctamente.', 'success');
          },
          error: err => {
            console.error('Error al eliminar cliente:', err);
            Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
          }
        });
      }
    });
  }

  guardarCambios(): void {
    if (this.modoEdicion) {
      const id = this.clienteSeleccionado.id_cliente;
      this.clienteSeleccionado.usumod = localStorage.getItem('login');
      this.clienteSeleccionado.fecmod = new Date();
      this.clienteService.editarCliente(id, this.clienteSeleccionado).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Actualizado', 'Cliente actualizado correctamente', 'success');
        },
        error: err => {
          console.error('Error al actualizar cliente:', err);
          Swal.fire('Error', 'No se pudo actualizar el cliente.', 'error');
        }
      });
    } else {
      this.clienteService.insertarCliente(this.clienteSeleccionado).subscribe({
        next: () => {
          this.popupVisible = false;
          this.obtenerListado();
          Swal.fire('Insertado', 'Cliente creado correctamente', 'success');
        },
        error: err => {
          console.error('Error al insertar cliente:', err);
          Swal.fire('Error', 'No se pudo insertar el cliente.', 'error');
        }
      });
    }
  }

  numeros(event: any, campo: string) {
    const valor = event.target.value;
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    event.target.value = soloNumeros;
    this.clienteSeleccionado[campo] = soloNumeros;
  }
}
