import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ContratoService } from 'src/app/services/contrato/contrato.service';
import Swal from 'sweetalert2';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { color } from 'html2canvas/dist/types/css/types/color';
import { text } from 'stream/consumers';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export interface Contrato {
  id_contrato?: number;
  fecha: string;
  carga: string;
  consignatario?: number;
  peso?: string;
  destino?: string;
  tramo?: string;
  flete?: number;
  obs_flete?: string;
  nombre?: string;
  placa?: string;
  empresa?: string;
  estado?: string;
}

@Component({
  selector: 'app-contrato',
  templateUrl: './contrato.component.html',
  styleUrls: ['./contrato.component.css']
})
export class ContratoComponent implements OnInit {

  contratos: any[] = [];
  contratoActual: any = null;
  verContrato = false;

  form = this.fb.group({
    fecha: [new Date(), Validators.required],
    carga: ['', Validators.required],
    consignatario: [0],
    peso: [''],
    destino: [''],
    tramo: [''],
    flete: [0, Validators.required],
    obs_flete: [''],
    nombre: ['', Validators.required],
    placa: [''],
    empresa: ['']
  });

  clientes: { label: string; value: number }[] = [];
  vehiculos: { label: string; value: number }[] = [];

  tipoTramo = [
    { label: 'IQUIQUE - LA PAZ', value: 'IQUIQUE - LA PAZ' },
    { label: 'ARICA - LA PAZ', value: 'ARICA - LA PAZ' }
  ];

  constructor(private contratoService: ContratoService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.obtenerVehiculos();
    this.obtenerClientes();
    this.obtenerListado();
  }

  obtenerVehiculos(): void {
    this.contratoService.getVehiculos().subscribe({
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
    console.log(id);
    console.log('Buscar vehículo para ID:', this.vehiculos);
    const vehiculo = this.vehiculos.find((v) => v.value == id);
    return vehiculo ? vehiculo.label : 'Sin nombre';
  }
  getVehiculoConductor(id: number): string {
    const vehiculo = this.vehiculos.find((v) => v.value == id);
    return vehiculo ? vehiculo.label.split('-')[1] : '';
  }
  getVehiculoPlaca(id: number): string {
    const vehiculo = this.vehiculos.find((v) => v.value == id);
    return vehiculo ? vehiculo.label.split('-')[0] : '';
  }

  obtenerClientes() {
    this.contratoService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((c: any) => ({ label: c.nombre_comercial, value: c.id_cliente }));
      }
    });
  }
  getClienteNombre(id: number): string {
    const cliente = this.clientes.find((c) => c.value === id);
    return cliente ? cliente.label : 'Sin nombre';
  }

  obtenerListado() {
    this.contratoService.listarContratos().subscribe({
      next: data => this.contratos = data,
      error: () => Swal.fire('Error', 'No se pudo cargar contratos', 'error')
    });
  }

  nuevoContrato() {
    this.verContrato = true;
    this.contratoActual = null;
    this.form.reset({
      fecha: null,
      flete: 0
    });
  }

  editar(contrato: any) {
    this.contratoActual = contrato;
    this.verContrato = true;
    this.form.patchValue({
      ...contrato,
      fecha: contrato.fecha ? new Date(contrato.fecha) : new Date()
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.value,
      usucre: localStorage.getItem('login')
    };

    if (!this.contratoActual) {
      this.contratoService.crearContrato(payload).subscribe({
        next: () => {
          Swal.fire('Guardado', 'Contrato creado correctamente', 'success');
          this.obtenerListado();
          this.verContrato = false;
        },
        error: () => Swal.fire('Error', 'No se pudo crear contrato', 'error')
      });
    } else {
      this.contratoService.editarContrato(this.contratoActual.id_contrato, payload).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Contrato actualizado correctamente', 'success');
          this.obtenerListado();
          this.verContrato = false;
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar contrato', 'error')
      });
    }
  }

  eliminar(r: any) {
        Swal.fire({
              title: '¿Estás seguro?',
              text: `¿Deseas eliminar la rendición "${r.id_contrato}"?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'Cancelar',
            }).then((result) => {
              if (result.isConfirmed) {
                this.contratoService.eliminarContrato(r.id_contrato).subscribe({
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

  imprimir(contrato: any) {
    this.contratoActual = contrato;
    this.generarPDF();
  }

  async generarPDF() {

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
      pageSize: 'A4',
      pageMargins: [60, 100, 60, 60],

      content: [
        { text: 'CONTRATO DE TRANSPORTE', style: 'title' },

        {
          text:[
            { text: `LA EMPRESA DE `},
            { text: 'TRANSPORTES OSCORI S.R.L.', bold: true },
            { text: ` EN EL PRESENTE CONTRATO DE FECHA ` +
            `${new Date(this.contratoActual.fecha).toLocaleDateString()} ` +
            `SE HACE CONSTAR QUE SE ENTREGÓ CONFORME SIN OBSERVACIONES LA SIGUIENTE MERCADERÍA SEGÚN EL SIGUIENTE DETALLE.`},
          ],
            
          margin: [0, 10, 0, 15],
          alignment: 'justify'
        },

        this.campo('CARGA:', this.contratoActual.carga),
        this.campo('CONSIGNATARIO:', 'COMPANEX BOLIVIA S.A.'),
        this.campo('PESO TOTAL:', this.contratoActual.peso),
        this.campo('DESTINO:', this.contratoActual.destino),
        this.campo('TRAMO:', this.contratoActual.tramo),
        this.campo('FLETE:', 'USD ' + this.contratoActual.flete + '.- (' + this.numeroALetras(this.contratoActual.flete) + ' DOLARES)'),
        this.campo('', this.contratoActual.obs_flete),


        { text: 'DATOS DE LA EMPRESA TRANSPORTADORA', style: 'section' },
        this.campo('NOMBRE:', this.getVehiculoConductor(this.contratoActual.nombre)),
        this.campo('PLACA:', this.getVehiculoPlaca(this.contratoActual.nombre)),
        this.campo('EMPRESA:', 'TRANSPORTES OSCORI S.R.L.'),

        { text: 'INSTRUCCIÓN AL CONDUCTOR', style: 'section2' },

        {
          text: [
            { text: '1.- ', bold: true },
            {
              text: 'LOS TRANSPORTES TIENE UN PLAZO NO SUPERIOR A A—02 DIAS PARA PRESENTARSE EN DESTINO DESDE LA SALIDA DE ARICA.'
            }
          ],
          margin: [0, 10, 0, 0],
          alignment: 'justify'
        },
        {
          text: [
            { text: '2.- ', bold: true },
            {
              text: 'QUEDA ESTRICTAMENTE PROHIBIDO REALIZAR TRANSBORDO PARCIAL NI TOTAL DE LA MERCANCIA DADO QUE DAÑOS O MERMAS LE SERAN DE EXCLUSIVA RESPONSABILIDAD DE LA EMPRESA TRANSPORTADORA.'
            }
          ],
          margin: [0, 10, 0, 0],
          alignment: 'justify'
        },
        {
          text: [
            { text: 'NOTA.: ', bold: true, decoration: 'underline' },
            {
              text: 'EL TRANSPORTISTA QUEDA ESTRICTAMENTE PROHIBIDO DE HABLAR CON EL CLIENTE SIENDO LO CONTRARIO SE HARA EL DESCUENTO DEL 70% DEL TOTAL DEL FLETE. EL TRANSPORTISTA TIENE LA OBLIGACION DE COMUNICARSE A LA EMPESA CONTRATANTE AL MOMENTO DE LA LLEGADA A DESTINO Y HACER ENTREGA DE DOCUMENTOS SIN NINGUN RETRASO.'
            }
          ],
          margin: [0, 10, 0, 0],
          alignment: 'justify'
        },
        
        {
          text:
            `CONFORME A TODAS LAS CLAUSULAS FIRMAN LAS DOS PARTES EN MUESTRA DE CONFORMIDAD AL PIE DE ESTE DOCUMENTO. `,
          margin: [0, 10, 0, 0],
          alignment: 'justify'
        },

        {
          margin: [0, 40, 0, 0],
          columns: [
            { text: '__________________________\nTRANSPORTISTA', alignment: 'center' }
          ]
        }
      ],

      styles: {
        title: {
          fontSize: 18,
          bold: true,
          decoration: 'underline',
          alignment: 'center',
          margin: [0, 0, 0, 5],
          color: 'red'
        },
        section: {
          fontSize: 13,
          bold: true,
          decoration: 'underline',
          margin: [0, 20, 0, 10]
        },
        section2: {
          fontSize: 13,
          bold: true,
          decoration: 'underline',
          alignment: 'center',
          margin: [0, 20, 0, 10]
        }
      }
    };

    pdfMake.createPdf(docDefinition)
      .download(`Contrato_${this.contratoActual.id_contrato}.pdf`);
  }

  campo(label: string, valor: any) {
    return {
      columns: [
        {
          text: `${label}`,
          width: 120, // ancho fijo del label
          bold: true
        },
        {
          text: valor ?? '',
          width: '*'
        }
      ],
      columnGap: 10,
      margin: [0, 2, 0, 2]
    };
  }

  numeroALetras(valor: number): string {
    const unidades = [
      '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO',
      'SEIS', 'SIETE', 'OCHO', 'NUEVE'
    ];

    const decenas = [
      '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA',
      'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
    ];

    const especiales: any = {
      11: 'ONCE',
      12: 'DOCE',
      13: 'TRECE',
      14: 'CATORCE',
      15: 'QUINCE'
    };

    const centenas = [
      '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS',
      'CUATROCIENTOS', 'QUINIENTOS',
      'SEISCIENTOS', 'SETECIENTOS',
      'OCHOCIENTOS', 'NOVECIENTOS'
    ];

    const convertirMenor100 = (n: number): string => {
      if (n <= 9) return unidades[n];
      if (n >= 11 && n <= 15) return especiales[n];
      if (n < 20) return 'DIECI' + unidades[n - 10];
      if (n === 20) return 'VEINTE';
      if (n < 30) return 'VEINTI' + unidades[n - 20];
      const d = Math.floor(n / 10);
      const u = n % 10;
      return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
    };

    const convertirMenor1000 = (n: number): string => {
      if (n === 100) return 'CIEN';
      const c = Math.floor(n / 100);
      const resto = n % 100;
      return c === 0
        ? convertirMenor100(resto)
        : `${centenas[c]} ${convertirMenor100(resto)}`.trim();
    };

    const entero = Math.floor(valor);
    const decimal = Math.round((valor - entero) * 100);

    let letras = '';

    if (entero >= 1000) {
      const miles = Math.floor(entero / 1000);
      letras += miles === 1
        ? 'MIL '
        : `${convertirMenor1000(miles)} MIL `;
      letras += convertirMenor1000(entero % 1000);
    } else {
      letras = convertirMenor1000(entero);
    }

    return `${letras} ${decimal.toString().padStart(2, '0')}/100`;
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

}
