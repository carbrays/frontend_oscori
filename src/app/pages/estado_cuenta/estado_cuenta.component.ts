import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { EstadoCuentaService } from 'src/app/services/estado_cuenta/estado_cuenta.service';
import Swal from 'sweetalert2';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export interface EstadoCuentaGasto {
  id_gasto?: number;
  id_estado?: number;
  fecha: string;
  detalle: string;
  factura?: string;
  debe?: number;
  haber?: number;
  saldo_usd?: number;
  saldo_bs?: number;
}

export interface EstadoCuenta {
  id_estado?: number;
  cliente: number;
  correlativo?: number;
  fecha: string;
  bl?: string;
  saldo_usd?: number;
  saldo_bs?: number;
  tipo_cambio?: number;
  estado?: string;
  gastos: EstadoCuentaGasto[];
}

@Component({
  selector: 'app-estado_cuenta',
  templateUrl: './estado_cuenta.component.html',
  styleUrls: ['./estado_cuenta.component.css']
})
export class EstadoCuentaComponent implements OnInit {

  form = this.fb.group({
    cliente: [null, Validators.required],
    fecha: [new Date(), Validators.required],
    bl: [''],
    saldo_usd: [0],
    saldo_bs: [0],
    tipo_cambio: [0],
    gastos: this.fb.array([])
  });

  estados: any[] = [];
  clientes: { label: string; value: number }[] = [];
  verEstado = false;
  estadoActual: any = null;

  loading = false;

  constructor(private estadoCuentaService: EstadoCuentaService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.obtenerClientes();
    this.obtenerListado();
  }

  get gastos(): FormArray {
    return this.form.get('gastos') as FormArray;
  }

  agregarGasto(gasto?: any) {
    this.gastos.push(
      this.fb.group({
        id_gasto: [gasto?.id_gasto || null],
        fecha: [gasto?.fecha ? new Date(gasto.fecha) : null, Validators.required],
        detalle: [gasto?.detalle || '', Validators.required],
        factura: [gasto?.factura || ''],
        debe: [gasto?.debe || 0],
        haber: [gasto?.haber || 0],
        saldo_usd: [gasto?.saldo_usd || 0],
        saldo_bs: [gasto?.saldo_bs || 0],
        tipo_cambio: [gasto?.tipo_cambio || 0]
      })
    );
  }

  eliminarGasto(index: number) {
    this.gastos.removeAt(index);
    this.calcularTotales();
  }

  calcularTotales() {
    let saldo_usd = 0;
    let saldo_bs = 0;

    this.gastos.controls.forEach((g: any) => {
      const debe = Number(g.get('debe')?.value || 0);
      const haber = Number(g.get('haber')?.value || 0);
      const tipo_cambio = Number(g.get('tipo_cambio')?.value || 0);

      const saldoUsd = debe - haber;
      const saldoBs = saldoUsd * tipo_cambio;

      // 🔹 actualizar la MISMA FILA
      g.patchValue({
        saldo_usd: saldoUsd,
        saldo_bs: saldoBs
      }, { emitEvent: false });

      // 🔹 acumular totales
      saldo_usd += saldoUsd;
      saldo_bs += saldoBs;
    });

    // 🔹 totales generales
    this.form.patchValue({
      saldo_usd,
      saldo_bs
    }, { emitEvent: false });
  }

  calcularCambio() {

    this.gastos.controls.forEach((control: any) => {
      const saldoUsd = Number(control.get('saldo_usd')?.value || 0);
      const tipo_cambio = Number(control.get('tipo_cambio')?.value || 0);

      const saldoBs = saldoUsd * tipo_cambio;

      control.patchValue({
        saldo_bs: saldoBs.toFixed(2)
      }, { emitEvent: false });
    });
    this.calcularTotales();
  }
  nuevoEstado() {
    this.verEstado = true;
    this.estadoActual = null;
    this.form.reset({
      cliente: null,
      fecha: null,
      bl: '',
      saldo_usd: 0,
      saldo_bs: 0,
      tipo_cambio: 0
    });
    this.gastos.clear();
  }

  obtenerListado() {
    this.estadoCuentaService.listarEstados().subscribe({
      next: (data) => {
        this.estados = data;
      },
      error: () => Swal.fire('Error', 'No se pudo cargar estados de cuenta', 'error')
    });
  }

  obtenerClientes() {
    this.estadoCuentaService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((c: any) => ({ label: c.nombre_comercial, value: c.id_cliente }));
      }
    });
  }
  getClienteNombre(id: number): string {
    const cliente = this.clientes.find((c) => c.value === id);
    return cliente ? cliente.label : 'Sin nombre';
  }

  guardar() {
    this.calcularTotales();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.estadoActual == null) {
      const payload = {
        ...this.form.value,
        gastos: this.gastos.value,
        usucre: localStorage.getItem('login'),
        feccre: new Date(),
        usmod: null,
        fecmod: null
      };

      this.estadoCuentaService.crearEstadoCuenta(payload)
        .subscribe({
          next: () => {
            this.obtenerListado();
            this.volverAEstadoCuenta();
            Swal.fire('Guardado', 'Estado de cuenta guardado correctamente.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo crear la rendición.', 'error')
        });
    } else {
      const payload = {
        ...this.form.value,
        id_rendicion: this.estadoActual.id_estado,
        gastos: this.gastos.value,
        usmod: localStorage.getItem('login'),
        fecmod: new Date(),
        correlativo: this.estadoActual.correlativo
      };

      this.estadoCuentaService.editarEstadoCuenta(this.estadoActual.id_estado!, payload)
        .subscribe({
          next: () => {
            this.obtenerListado();
            this.volverAEstadoCuenta();
            Swal.fire('Guardado', 'Estado de cuenta guardado correctamente.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo crear la rendición.', 'error')
        });
    }
  }

  editar(estado: any) {
    this.estadoActual = estado;
    this.form.patchValue({
      cliente: estado.cliente,
      fecha: estado.fecha ? new Date(estado.fecha) : new Date(),
      bl: estado.bl,
      saldo_usd: estado.saldo_usd,
      saldo_bs: estado.saldo_bs,
      tipo_cambio: estado.tipo_cambio
    });
    this.gastos.clear();
    this.estadoCuentaService.listarGastos(estado.id_estado!).subscribe({
      next: (data) => data.forEach(g => this.agregarGasto(g))
    });
    this.verEstado = true;
  }

  eliminar(r: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la rendición "${r.id_estado}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.estadoCuentaService.eliminarEstadoCuenta(r.id_estado).subscribe({
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

  volverAEstadoCuenta() {
    this.verEstado = false;
    this.estadoActual = null;
  }

  imprimir(estado: any) {
    console.log('Imprimir', estado);
    this.estadoActual = estado;
    this.generarPDF();
  }

  async generarPDF() {

    const hojaMembrete = 'assets/images/membretado.jpg';

    const fondoBase64 = await this.getBase64ImageFromURL(hojaMembrete);

    this.estadoCuentaService
      .listarGastos(this.estadoActual.id_estado!)
      .subscribe({

        next: (data) => {

          // ===============================
          // CARGAR GASTOS
          // ===============================
          data.forEach(g => this.agregarGasto(g));

          // ===============================
          // GASTOS
          // ===============================
          const gastosBody = (this.gastos.value || []).map((g: { fecha: any; detalle: any; factura: any; debe: any; haber: any; saldo_usd: any; saldo_bs: any; }, i: number) => ([
            i + 1,
            g.fecha ? new Date(g.fecha).toLocaleDateString() : '',
            { text: g.detalle || '' },
            g.factura || '',
            g.debe || 0,
            g.haber || 0,
            g.saldo_usd || 0,
            g.saldo_bs || 0
          ]));

          const fecha_correlativo = new Date(this.estadoActual.fecha);
          const anio2Digitos = fecha_correlativo.getFullYear().toString().slice(-2);

          // ===============================
          // PDF
          // ===============================
          const docDefinition: any = {
            background: function (_currentPage: number) {
              return {
                image: fondoBase64,
                width: 595,  // tamaño A4 en puntos (ancho)
                height: 842, // tamaño A4 en puntos (alto)
              };
            },

            pageSize: 'A4',
            pageMargins: [40, 100, 40, 70],

            content: [

              {
                margin: [0, 20, 0, 0],
                table: {
                  widths: ['*', 'auto'],
                  body: [
                    [
                      {
                        text: 'TRANSPORTES OSCORI SRL',
                        alignment: 'left',
                        bold: true
                      },
                      {
                        text: 'NIT: 192898024',
                        alignment: 'right'
                      }
                    ]
                  ]
                },
                layout: 'noBorders'
              },
              'CONTABILIDAD',
              'ESTADO DE CUENTA: ' + (this.estadoActual.correlativo ? `${this.estadoActual.correlativo.toString()}-${anio2Digitos}` : 'N/A'),
              '',
              '',
              '',

              // ===== TÍTULO =====
              {
                text: this.getClienteNombre(this.estadoActual.cliente),
                style: 'title'
              },
              this.estadoActual.bl ? { text: `BL: ${this.estadoActual.bl}`, alignment: 'center', margin: [0, 5, 0, 15] } : {},

              this.estadoActual.fecha ? { text: `Fecha: ${new Date(this.estadoActual.fecha).toLocaleDateString()}`, alignment: 'left' } : {},

              {
                table: {
                  widths: ['5%', '15%', '30%', '10%', '10%', '10%', '10%', '10%'],
                  body: [
                    [
                      { text: 'N°', bold: true, alignment: 'center' },
                      { text: 'FECHA', bold: true, alignment: 'center' },
                      { text: 'DETALLE', bold: true, alignment: 'center', size: 8 },
                      { text: 'FACTURA O BOLETA', bold: true, alignment: 'center' },
                      { text: 'DEBE (USD)', bold: true, alignment: 'center' },
                      { text: 'HABER (USD)', bold: true, alignment: 'center' },
                      { text: 'SALDO USD', bold: true, alignment: 'center' },
                      { text: 'SALDO BS', bold: true, alignment: 'center' },
                    ],
                    ...gastosBody,
                    this.filaTotal('TOTAL A PAGAR', this.estadoActual.saldo_usd, this.estadoActual.saldo_bs)
                  ]
                }
              },

              'SON: ' + this.numeroALetras(this.estadoActual.saldo_usd || 0) + ' DÓLARES AMERICANOS',
              'SON: ' + this.numeroALetras(this.estadoActual.saldo_bs || 0) + ' BOLIVIANOS',

              // ===== FIRMAS =====
              {
                margin: [0, 60, 0, 0],
                table: {
                  widths: ['30%', '3%', '30%', '3%', '34%'],
                  body: [
                    [
                      { text: 'EMILIO OSCORI MAMANI', bold: true, alignment: 'center', border: [false, true, false, false] },
                      { text: '', border: [false, false, false, false] },
                      { text: '', border: [false, false, false, false] },
                      { text: '', border: [false, false, false, false] },
                      { text: '', border: [false, false, false, false] },

                    ],
                    [
                      { text: 'C.I. 4375165 L.P.', bold: true, alignment: 'center', border: [false, false, false, false] },
                      { text: '', border: [false, false, false, false] },
                      { text: '', border: [false, false, false, false] },
                      { text: '', border: [false, false, false, false] },
                      { text: '', border: [false, false, false, false] },
                    ]
                  ]
                }
              },

              {
                margin: [50, 25, 0, 50],
                table: {
                  widths: ['30%', '70%'],
                  body: [
                    [
                      { text: 'BANCO:', bold: true },
                      { text: 'BANCO NACIONAL DE BOLIVIA (BNB)' }
                    ],
                    [
                      { text: 'NOMBRE DE CTA.:', bold: true },
                      { text: 'TRANSPORTES OSCORI SRL' }
                    ],
                    [
                      { text: 'CTA. EN BS:', bold: true },
                      { text: '1000222875' }
                    ],
                    [
                      { text: 'CTA. EN USD:', bold: true },
                      { text: '1400603207' }
                    ],
                    [
                      { text: 'NIT:', bold: true },
                      { text: '158350020' }
                    ]
                  ]
                },
                layout: 'noBorders'
              }

            ],

            styles: {
              title: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                decoration: 'underline'
              },
              section: {
                fontSize: 16,
                bold: true,
                color: '#FFFFFF',
                fillColor: '#808080',
                alignment: 'center',
                margin: [0, 10, 0, 10]
              }
            }
          };

          pdfMake.createPdf(docDefinition)
            .download(`Estado_de_cuenta${this.getClienteNombre(this.estadoActual.cliente)}_${this.estadoActual.correlativo ? `${this.estadoActual.correlativo.toString()}-${anio2Digitos}` : 'N_A'}.pdf`);
        },

        error: () => {
          Swal.fire('Error', 'No se pudo generar el PDF', 'error');
        }
      });
    this.gastos.clear();
  }
  filaTotal(texto: string, usd: any, bs: any) {
    return [
      { text: texto, colSpan: 6, bold: true, alignment: 'center' },
      {}, {}, {}, {}, {},
      { text: usd || 0, bold: true, alignment: 'center' },
      { text: bs || 0, bold: true, alignment: 'center' }
    ];
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
