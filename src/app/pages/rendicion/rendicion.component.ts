import { Component, NgZone, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { RendicionService } from 'src/app/services/rendicion/rendicion.service';
import Swal from 'sweetalert2';

import * as ExcelJS from 'exceljs';
import * as fs from 'file-saver';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { text } from 'stream/consumers';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export interface RendicionGasto {
  id_gasto?: number;
  fecha: string;
  descripcion: string;
  respaldo?: string;
  monto: number;
}

export interface Rendicion {
  id_rendicion?: number;
  cliente: number;
  fecha_desembolso: string;
  conductor: number;
  monto: number;
  tramos: string;
  total_gastos: number;
  saldo_empresa: number;
  saldo_conductor: number;
  estado?: string;
  gastos: RendicionGasto[];
}

@Component({
  selector: 'app-rendicion',
  templateUrl: './rendicion.component.html',
  styleUrls: ['./rendicion.component.css']
})
export class RendicionComponent implements OnInit {

  form = this.fb.group({
    cliente: [0, Validators.required],
    fecha_desembolso: [new Date(), Validators.required],
    conductor: [0],
    monto: [0, Validators.required],
    tramos: ['[]'],   
    total_gastos: [0],
    saldo_empresa: [0],
    saldo_conductor: [0],
    gastos: this.fb.array([])
  });

  rendiciones: any[] = [];

  clientesFiltro: { label: string; value: number }[] = [];

  clientes: { label: string; value: number }[] = [];
  ciudades: { label: string; value: number }[] = [];
  vehiculos: { label: string; value: number }[] = [];

  tramoVisible = false;
  tramos: any[] = [];
  tramoActual: any = {};
  editTramoIndex: any = null;

  loading = false;

  verRendicion = false;
  rendicionActual: any = null;

  tipoTramo = [
    { label: 'IDA', value: 'IDA' },
    { label: 'VUELTA', value: 'VUELTA' }
  ];

  constructor(private rendicionService: RendicionService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.obtenerVehiculos();
    this.obtenerClientes();
    this.obtenerCiudades();
    this.obtenerListado();
  }

  obtenerListado(): void {
    this.rendicionService.listarRendiciones().subscribe({
      next: (data) => {
        this.rendiciones = data;
        this.rendiciones.forEach(rendicion => {
          rendicion.tramos = JSON.parse(rendicion.tramos || '[]');
        });
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de rendiciones.', 'error'),
    });
  }

  obtenerClientes(): void {
    this.rendicionService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data.map((cliente) => ({
          label: cliente.nombre_comercial,
          value: cliente.id_cliente,
        }));
        this.generarClientesUnicos();
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
  generarClientesUnicos() {
    const idsEnDespachos = new Set(this.rendiciones.map(r => r.cliente));

    this.clientesFiltro = this.clientes
      .filter(c => idsEnDespachos.has(c.value))
      .map(c => ({ label: c.label, value: c.value }));
  }

  obtenerCiudades(): void {
    this.rendicionService.getCiudad().subscribe({
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

  obtenerVehiculos(): void {
    this.rendicionService.getVehiculos().subscribe({
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

  get gastos(): FormArray {
    console.log(this.form.get('gastos')  as FormArray);
    return this.form.get('gastos') as FormArray;
  }

  agregarGasto(gasto?: any) {
    console.log('Agregar gasto', gasto);
    this.gastos.push(
      this.fb.group({
        id_gasto: [gasto?.id_gasto || null],
        fecha: [gasto ? new Date(gasto.fecha) : null, Validators.required],
        descripcion: [gasto?.descripcion || '', Validators.required],
        respaldo: [gasto?.respaldo || ''],
        monto: [gasto?.monto || 0, Validators.required]
      })
    );
  }

  eliminarGasto(index: number) {
    this.gastos.removeAt(index);
    this.calcularTotales();
  }

  // =====================
  // CALCULOS
  // =====================
  calcularTotales() {
    const totalGastos = this.gastos.value
      .reduce((sum: number, g: any) => sum + Number(g.monto || 0), 0);

    const monto = Number(this.form.value.monto || 0);

    this.form.patchValue({
      total_gastos: totalGastos,
      saldo_empresa: monto - totalGastos,
      saldo_conductor: totalGastos
    }, { emitEvent: false });
  }

  nuevaRendicion() {
    this.verRendicion = true;
    this.rendicionActual = null;
    this.form.reset({
      cliente: 0,
      fecha_desembolso: null,
      conductor: 0,
      monto: 0,
      tramos: '[]',
      total_gastos: 0,
      saldo_empresa: 0,
      saldo_conductor: 0,
      gastos: []
    });
    this.tramos = [];
    this.gastos.clear();
  }

  // =====================
  // GUARDAR
  // =====================
  guardar() {
    this.calcularTotales();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.rendicionActual == null) {
      const payload = {
        ...this.form.value,
        tramos: JSON.stringify(this.tramos),
        gastos: this.gastos.value,
        usucre: localStorage.getItem('login'),
        feccre: new Date(),
        usmod: null,
        fecmod: null
      };

      this.rendicionService.crearRendicion(payload)
        .subscribe({
          next: () => {
            this.obtenerListado();
            this.volverARendiciones();
            Swal.fire('Guardado', 'Rendición guardada correctamente.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo crear la rendición.', 'error')
        });
    } else {
      const payload = {
        ...this.form.value,
        id_rendicion: this.rendicionActual.id_rendicion,
        tramos: JSON.stringify(this.tramos),
        gastos: this.gastos.value,
        usmod: localStorage.getItem('login'),
        fecmod: new Date()
      };

      this.rendicionService.editarRendicion(this.rendicionActual.id_rendicion, payload)
        .subscribe({
          next: () => {
            this.obtenerListado();
            this.volverARendiciones();
            Swal.fire('Guardado', 'Rendición guardada correctamente.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo crear la rendición.', 'error')
        });
    }
  }

  editar(r: any) {
    console.log('Editar', r);
    this.form.patchValue({
      cliente: r.cliente,
      fecha_desembolso: r.fecha_desembolso ? new Date(r.fecha_desembolso) : new Date(),
      conductor: Number(r.conductor),
      monto: r.monto,
      tramos: r.tramos,
      total_gastos: r.total_gastos,
      saldo_empresa: r.saldo_empresa,
      saldo_conductor: r.saldo_conductor
    });

    this.tramos = r.tramos;

    this.gastos.clear();

    this.rendicionService.listarGastos(r.id_rendicion).subscribe({
      next: (data) => {
        data.forEach(g => this.agregarGasto(g));
        this.calcularTotales();
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de rendiciones.', 'error'),
    });
    // r.gastos.forEach((g: any) => {
    // this.gastos.push(this.crearGasto(g));
    // });
    this.rendicionActual = r;
    this.verRendicion = true;
    // router.navigate(['/rendiciones/editar', r.id_rendicion])
  }

  imprimir(rendicion: any) {
    console.log('Imprimir', rendicion);
    this.rendicionActual = rendicion;
    this.generarPDF();
    // this.generarExcel();
    // this.rendicionService.imprimirRendicion(rendicion.id_rendicion)
    //   .subscribe(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `Rendicion_${rendicion.id_rendicion}.xlsx`;
    //     a.click();
    //   });
  }


  eliminar(r: any) {
    Swal.fire({
          title: '¿Estás seguro?',
          text: `¿Deseas eliminar la rendición "${r.id_rendicion}"?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.rendicionService.eliminarRendicion(r.id_rendicion).subscribe({
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

  volverARendiciones() {
    this.verRendicion = false;
    this.rendicionActual = null;
  }


  nuevoTramo() {
    this.tramoActual = {
      tipo: '',
      origen: '',
      destino: '',
      cargas_transportadas: ''
    };
    this.editTramoIndex = null;
    this.tramoVisible = true;
  }

  guardarTramo() {
    if (this.editTramoIndex != null) {
      this.tramos[this.editTramoIndex] = this.tramoActual;
    } else {
      this.tramos.push(this.tramoActual);
    }
    if (this.rendicionActual) {
      this.rendicionActual.tramos = JSON.stringify(this.tramos);
    }

    this.form.patchValue({
      tramos: JSON.stringify(this.tramos)
    });
    this.tramoVisible = false;
  }

  editarTramo(i: number) {
    this.editTramoIndex = i;
    this.tramoActual = { ...this.tramos[i] }; // clonar
    this.tramoVisible = true;
  }

  eliminarTramo(i: number) {
    this.tramos.splice(i, 1);
    if (this.rendicionActual) {
      this.rendicionActual.tramos = JSON.stringify(this.tramos);
    }

    this.form.patchValue({
      tramos: JSON.stringify(this.tramos)
    });
  }

  generarExcel() {

    console.log('Generar Excel para rendición:', this.rendicionActual);
    this.rendicionService.listarGastos(this.rendicionActual.id_rendicion).subscribe({
      next: (data) => {
        data.forEach(g => this.agregarGasto(g));
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Rendicion');

        sheet.pageSetup = {
          paperSize: undefined,
          orientation: 'portrait',
          margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
        };

        sheet.getColumn('A').width = 8.44;
        sheet.getColumn('B').width = 16.78;
        sheet.getColumn('C').width = 16.56;
        sheet.getColumn('D').width = 37.89;
        sheet.getColumn('E').width = 27.67;
        sheet.getColumn('F').width = 16.22;

        sheet.addRow([]);
        sheet.addRow([]);
        sheet.mergeCells('A3:F4');

        const titleCell = sheet.getCell('A3');
        titleCell.value = 'RENDICIÓN - GASTOS DE TRANSPORTE';
        titleCell.font = { size: 18, bold: true, underline: 'single' };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        // 1️⃣ Datos Generales
        sheet.mergeCells('A5:C5');
        sheet.getCell('A5').value = 'EMPRESA';
        sheet.mergeCells('D5:F5');
        sheet.getCell('D5').value = this.getClienteNombre(this.rendicionActual.cliente);
        sheet.mergeCells('A6:C6');
        sheet.getCell('A6').value = 'FECHA DE DESEMBOLSO:';
        sheet.mergeCells('D6:F6');
        sheet.getCell('D6').value = this.rendicionActual.fecha_desembolso ? new Date(this.rendicionActual.fecha_desembolso).toLocaleDateString() : '';
        sheet.mergeCells('A7:C7');
        sheet.getCell('A7').value = 'CONDUCTOR RESPONSABLE DEL GASTO:';
        sheet.mergeCells('D7:F7');
        sheet.getCell('D7').value = this.getVehiculoNombre(this.rendicionActual.conductor);
        sheet.addRow([]);
        sheet.mergeCells('A9:C9');
        sheet.getCell('A9').value = 'PLACA:';
        sheet.getCell('D9').value = this.rendicionActual.conductor ? this.getVehiculoNombre(this.rendicionActual.conductor) : '';
        sheet.addRow([]);
        sheet.mergeCells('A11:B11');
        const titleCell2 = sheet.getCell('A11');
        titleCell2.value = 'MONTO DESEMBOLSADO';
        titleCell2.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
        const titleCell3 = sheet.getCell('C11');
        titleCell3.value = 'Bs.';
        titleCell3.alignment = { vertical: 'middle', horizontal: 'right' };
        const titleCell4 = sheet.getCell('D11');
        titleCell4.value = this.rendicionActual.monto;
        sheet.addRow([]); // fila vacía

        // 2️⃣ Tramos
        sheet.mergeCells('B13:C13');
        const titleCell5 = sheet.getCell('B13');
        titleCell5.value = 'TRAMOS';
        titleCell5.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell5.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
        titleCell5.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        sheet.mergeCells('D13:F13');
        const titleCell6 = sheet.getCell('D13');
        titleCell6.value = 'CARGAS TRANSPORTADAS';
        titleCell6.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell6.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
        titleCell6.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        (this.rendicionActual.tramos || []).forEach((t: { tipo: any; origen: any; destino: any; cargas_transportadas: any; }) => {
          // 1️⃣ Agregamos fila con celdas suficientes (6 columnas en total)
          const row = sheet.addRow([t.tipo, t.origen, t.destino, t.cargas_transportadas, null, null]);

          // 2️⃣ Combinar las columnas 4,5,6 (cargas_transportadas)
          const currentRow = row.number; // número de fila actual
          sheet.mergeCells(currentRow, 4, currentRow, 6); // startRow, startCol, endRow, endCol

          // 3️⃣ Opcional: centrar y negrita
          sheet.getCell(currentRow, 4).alignment = { horizontal: 'center', vertical: 'middle' };
          sheet.getCell(currentRow, 4).font = { bold: true };

          // 4️⃣ Opcional: bordes
          [1, 2, 3, 4].forEach(col => {
            sheet.getCell(currentRow, col).border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });


        sheet.addRow([]); // fila vacía

        sheet.mergeCells('A17:F17');
        const titleCell7 = sheet.getCell('A17');
        titleCell7.value = 'GASTOS REALIZADOS';
        titleCell7.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell7.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell7.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
        // 3️⃣ Gastos
        // Agregamos fila vacía para los encabezados
        const headerRow = sheet.addRow(['N°', 'FECHA', 'DESCRIPCIÓN DEL GASTO', null, 'N° RESPALDO', 'MONTO']);

        // Número de fila recién creada
        const rowNum = headerRow.number;

        // 1️⃣ Combinar columnas 3 y 4 (DESCRIPCIÓN DEL GASTO)
        sheet.mergeCells(rowNum, 3, rowNum, 4); // startRow, startCol, endRow, endCol

        // 2️⃣ Estilo del encabezado
        [1, 2, 3, 5, 6].forEach(col => {
          const cell = sheet.getCell(rowNum, col);
          cell.font = { bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' }
          };
        });

        // Celda combinada también necesita estilo
        const mergedCell = sheet.getCell(rowNum, 3);
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        mergedCell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };

        (this.gastos.value || []).forEach((g: { fecha: any; descripcion: any; monto: any; respaldo: any; }, index: number) => {

          // index empieza en 0, así que le sumamos 1 para que empiece en 1
          const correlativo = index + 1;

          // 1️⃣ Agregamos fila con espacio para columnas combinadas
          const row = sheet.addRow([correlativo, g.fecha, g.descripcion, null, g.respaldo, g.monto]);
          // columnas: 1:N°, 2:FECHA, 3+4:DESCRIPCIÓN, 5:N° RESPALDO, 6:MONTO

          // 2️⃣ Número de fila actual
          const rowNum = row.number;

          // 3️⃣ Combinar columnas 3 y 4 (DESCRIPCIÓN DEL GASTO)
          sheet.mergeCells(rowNum, 3, rowNum, 4);

          // 4️⃣ Opcional: estilo (bordes, centrado)
          [1, 2, 3, 5, 6].forEach(col => {
            const cell = sheet.getCell(rowNum, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });

          // Estilo de la celda combinada
          const mergedCell = sheet.getCell(rowNum, 3);
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        agregarTotal('TOTAL GASTOS', this.rendicionActual.total_gastos);          // totalGastos = suma de montos
        sheet.addRow([]);
        agregarTotal('SALDO A DEVOLVER A LA EMPRESA', this.rendicionActual.saldo_empresa);
        agregarTotal('SALDO A REEMBOLSAR CONDUCTOR', this.rendicionActual.saldo_conductor);

        sheet.addRow([]);
        sheet.addRow([]);
        sheet.addRow([]);
        sheet.addRow([]);

        const rowFirmas = sheet.addRow([]);

        // ===== FILA PRINCIPAL DE FIRMAS =====
        sheet.getCell(`B${rowFirmas.number}`).value = 'RESPONSABLE DEL GASTO';
        sheet.getCell(`D${rowFirmas.number}`).value = 'ADMINISTRACIÓN';
        sheet.getCell(`F${rowFirmas.number}`).value = 'V°B°';

        ['B', 'D', 'F'].forEach(col => {
          const cell = sheet.getCell(`${col}${rowFirmas.number}`);

          cell.font = { bold: true }; // 🔥 NEGRITA
          cell.alignment = { horizontal: 'center' };
          cell.border = {
            top: { style: 'thin' } // ─ borde superior simple
          };
        });

        // ===== FILA SECUNDARIA =====
        const rowSub = sheet.addRow([]);

        sheet.getCell(`B${rowSub.number}`).value = 'RECIBÍ CONFORME';
        sheet.getCell(`D${rowSub.number}`).value = 'ENTREGUÉ CONFORME';

        ['B', 'D'].forEach(col => {
          const cell = sheet.getCell(`${col}${rowSub.number}`);

          cell.font = { bold: true }; // 🔥 NEGRITA
          cell.alignment = { horizontal: 'center' };
        });


        // 5️⃣ Descargar archivo
        workbook.xlsx.writeBuffer().then((data: any) => {
          const blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          fs.saveAs(blob, `Rendicion_${new Date().getTime()}.xlsx`);
        });

        function agregarTotal(texto: string, monto: number | string) {
          const row = sheet.addRow([texto, null, null, null, null, monto]);
          const rowNum = row.number;

          // Combinar primeras 5 columnas
          sheet.mergeCells(rowNum, 1, rowNum, 5);

          // Estilos
          const mergedCell = sheet.getCell(rowNum, 1);
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          mergedCell.font = { bold: true };

          // Bordes para todas las columnas
          [1, 2, 3, 4, 5, 6].forEach(col => {
            const cell = sheet.getCell(rowNum, col);
            cell.border = {
              top: { style: 'medium' },
              left: { style: 'medium' },
              bottom: { style: 'medium' },
              right: { style: 'medium' }
            };
          });
        }
      },
      error: (err) =>
        Swal.fire('Error', 'No se pudo cargar la lista de rendiciones.', 'error'),
    });


  }

  async generarPDF() {

  this.rendicionService
    .listarGastos(this.rendicionActual.id_rendicion)
    .subscribe({

      next: (data) => {

        // ===============================
        // CARGAR GASTOS
        // ===============================
        data.forEach(g => this.agregarGasto(g));

        // ===============================
        // TRAMOS
        // ===============================
        const tramosArray = Array.isArray(this.rendicionActual.tramos)
  ? this.rendicionActual.tramos
  : Object.values(this.rendicionActual.tramos || {});

const tramosBody = tramosArray.map((t: any) => ([
  t.tipo || '',
  this.getCiudadNombre(t.origen || ''),
  this.getCiudadNombre(t.destino || ''),
  { text: t.cargas_transportadas || '', colSpan: 3, alignment: 'center', bold: true },
  {}, {}
]));

        // const tramosBody = (this.rendicionActual.tramos || []).map((t: { tipo: any; origen: any; destino: any; cargas_transportadas: any; }) => ([
        //   t.tipo || '',
        //   t.origen || '',
        //   t.destino || '',
        //   { text: t.cargas_transportadas || '', colSpan: 3, alignment: 'center', bold: true },
        //   {}, {}
        // ]));

        // ===============================
        // GASTOS
        // ===============================
        const gastosBody = (this.gastos.value || []).map((g: { fecha: any; descripcion: any; respaldo: any; monto: any; }, i: number) => (
          [
          i + 1,
          g.fecha ? new Date(g.fecha).toLocaleDateString()  : '',
          { text: g.descripcion || '', colSpan: 2 },
          {},
          g.respaldo || '',
          { text: g.monto || 0, alignment: 'right' }
        ]));

        // ===============================
        // PDF
        // ===============================
        const docDefinition: any = {

          pageSize: 'A4',
          pageMargins: [40, 40, 40, 40],

          content: [

            // ===== TÍTULO =====
            {
              text: 'RENDICIÓN - GASTOS DE TRANSPORTE',
              style: 'title'
            },

            // ===== DATOS GENERALES =====
            {
              margin: [0, 20, 0, 15],
              table: {
                widths: ['40%', '60%'],
                body: [
                  ['EMPRESA:', 'TRANSPORTES OSCORI S.R.L.'],
                  ['FECHA DE DESEMBOLSO:',
                    this.rendicionActual.fecha_desembolso
                      ? new Date(this.rendicionActual.fecha_desembolso).toLocaleDateString()
                      : ''
                  ],
                  ['CONDUCTOR RESPONSABLE:', this.getVehiculoConductor(this.rendicionActual.conductor)]
                ]
              },
               layout: 'noBorders'
            },

            {
              margin: [0, 0, 0, 0],
              table: {
                widths: ['40%', '60%'],
                body: [
                  ['PLACA:', this.getVehiculoPlaca(this.rendicionActual.conductor)]
                ]
              },
               layout: 'noBorders'
            },

            // ===== MONTO =====
            {
              margin: [0, 10, 0, 20],
              table: {
                widths: ['30%', '10%', '60%'],
                body: [
                  [
                    {
                      text: 'MONTO DESEMBOLSADO',
                      fillColor: '#808080',
                      color: '#FFFFFF',
                      bold: true,
                      alignment: 'center'
                    },
                    { text: 'Bs.', alignment: 'right' },
                    { text: this.rendicionActual.monto || 0, bold: true}
                  ]
                ]
              },
              layout: 'noBorders'
            },

            // ===== TRAMOS =====
            {
              margin: [0, 0, 0, 20],
              table: {
                widths: ['15%', '15%', '15%', '18%', '18%', '19%'],
                body: [
                  [
                    { text: '', border: [false, false, false, false] },
                    { text: 'TRAMOS', colSpan: 2, fillColor: '#808080', color: '#FFFFFF', bold: true, alignment: 'center' },
                     {},
                    { text: 'CARGAS TRANSPORTADAS', colSpan: 3, fillColor: '#808080', color: '#FFFFFF', bold: true, alignment: 'center' },
                    {}, {}
                  ],
                  ...tramosBody
                ]
              }
            },

            // ===== GASTOS REALIZADOS =====
            // {
            //   text: 'GASTOS REALIZADOS',
            //   style: 'section'
            // },
            {
              margin: [0, 10, 0, 0],
              table: {
                widths: ['100%'],
                body: [
                  [
                    {
                      text: 'GASTOS REALIZADOS',
                      fillColor: '#808080',
                      color: '#FFFFFF',
                      bold: true,
                      alignment: 'center'
                    }
                  ]
                ]
              },
              layout: 'noBorders'
            },

            {
              table: {
                widths: ['6%', '14%', '30%', '5%', '20%', '25%'],
                body: [
                  [
                    { text: 'N°', bold: true, alignment: 'center' },
                    { text: 'FECHA', bold: true, alignment: 'center' },
                    { text: 'DESCRIPCIÓN DEL GASTO', bold: true, colSpan: 2, alignment: 'center' }, {},
                    { text: 'N° RESPALDO', bold: true, alignment: 'center' },
                    { text: 'MONTO', bold: true, alignment: 'center' }
                  ],
                  ...gastosBody,
                  this.filaTotal('TOTAL GASTOS', this.rendicionActual.total_gastos)
                ]
              }
            },

            {
              margin: [0, 20, 0, 0],
              table: {
                widths: ['6%', '14%', '30%', '5%', '20%', '25%'],
                body: [
                  this.filaTotal('SALDO A DEVOLVER A LA EMPRESA', this.rendicionActual.saldo_empresa),
                  this.filaTotal('SALDO A REEMBOLSAR CONDUCTOR', this.rendicionActual.saldo_conductor)
                ]
              }
            },

            // ===== FIRMAS =====
            {
              margin: [0, 60, 0, 0],
              table: {
                widths: ['30%','3%', '30%','3%', '34%'],
                body: [
                  [
                    { text: 'RESPONSABLE DEL GASTO', bold: true, alignment: 'center', border: [false, true, false, false] },
                    { text: '', border: [false, false, false, false] },
                    { text: 'ADMINISTRACIÓN', bold: true, alignment: 'center', border: [false, true, false, false] },
                    { text: '', border: [false, false, false, false] },
                    { text: 'V°B°', bold: true, alignment: 'center', border: [false, true, false, false] }
                  ],
                  [
                    { text: 'RECIBÍ CONFORME', bold: true, alignment: 'center', border: [false, false, false, false] },
                    { text: '', border: [false, false, false, false] },
                    { text: 'ENTREGUÉ CONFORME', bold: true, alignment: 'center', border: [false, false, false, false] },
                    { text: '', border: [false, false, false, false] },
                    { text: '', border: [false, false, false, false] }
                  ]
                ]
              }
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
          .download(`Rendicion_${Date.now()}.pdf`);
      },

      error: () => {
        Swal.fire('Error', 'No se pudo generar el PDF', 'error');
      }
    });
    this.gastos.clear();
}
filaTotal(texto: string, monto: any) {
  return [
    { text: texto, colSpan: 5, bold: true, alignment: 'center' },
    {}, {}, {}, {},
    { text: monto || 0, bold: true, alignment: 'right' }
  ];
}



}
