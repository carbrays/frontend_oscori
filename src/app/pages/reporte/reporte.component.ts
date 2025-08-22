import 'lodash';
import { CodificacionService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';
import { GastosModel } from '../../interfaces/gastos.interface';
import { GuardarPostulante } from '../../interfaces/guardarpostulante.interface';

import { ReporteService } from '../../services/reporte/reporte.service';
import { Table } from 'primeng/table';
import { now } from 'moment';

import { Component, OnInit } from '@angular/core';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { eventNames } from 'process';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import 'jspdf-autotable';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit{
  postulantes: any[] = [];
  departamentos: any;
  escuelas: any;
  sexos =
    [{"id": 0, "sexo": "TODO" },
    {"id": 1, "sexo": "VARON" },
    {"id": 2, "sexo": "MUJER"}];
  centros: any;

  departamento: number = 0;
  escuela: number = 0;
  sexo: number = 0;
  centro: number = 0;
  loading: boolean = true;

  constructor(private reporteService: ReporteService) { }

  ngOnInit() {
    this.listarPostulantes(this.departamento,this.escuela, this.sexo, this.centro);
    this.listarDepartamentos();
    this.listarEscuelas();
    this.listarCentros();
    this.loading = false;
  }

  listarPostulantes(depto: any, esc: any, sex: any, cen: any) {
    this.reporteService.getPostulantes(depto, esc, sex, cen).subscribe((data: any[]) => {
      this.postulantes = data;
    });
  }

  listarDepartamentos() {
    this.reporteService.getDepartamentos().subscribe((data: any[]) => {
      this.departamentos = data;
      this.departamentos.push({id_depto: 0, departamento: 'TODO'});
      console.log(this.departamentos);
    });
  }

  listarEscuelas() {
    this.reporteService.getEscuelas().subscribe((data: any[]) => {
      this.escuelas = data;
      this.escuelas.push({id_escuela: 0, nombre: 'TODO'});
      console.log(this.escuelas);
    });
  }

  listarCentros() {
    this.reporteService.getCentros().subscribe((data: any[]) => {
      this.centros = data;
      this.centros.push({id_centro: 0, nombre: 'TODO'});
      console.log(this.centros);
    });
  }

  onEscuelaChange(event: any) {
    this.escuela = event.id_escuela;
    this.listarPostulantes(this.departamento,this.escuela, this.sexo, this.centro);
  }

  onDeptoChange(event: any) {
    this.departamento = event.id_depto;
    this.listarPostulantes(this.departamento,this.escuela, this.sexo, this.centro);
  }

  onSexoChange(event: any) {
    this.sexo = event.id;
    this.listarPostulantes(this.departamento,this.escuela, this.sexo, this.centro);
  }
  onCentroChange(event: any) {
    this.centro = event.id_centro;
    this.listarPostulantes(this.departamento,this.escuela, this.sexo, this.centro);
  }

  exportExcel() {    
    let date = new Date();
    let formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.postulantes);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer,"Reporte01-" + formattedDate);
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  exportPDF() {    
    let date = new Date();
    let formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const doc = new jsPDF();

    // Título del reporte
    doc.text(`Reporte - ${formattedDate}`, 14, 16);

    // Columnas y datos de la tabla
    const columns = ["ID", "Nombre", "Apellido", "Celular"]; // Ajusta los nombres de las columnas
    const rows = this.postulantes.map(postulante => [
        postulante.id_postulante,
        postulante.nombres,
        postulante.ap_pat,
        postulante.celular
    ]);

    // Genera la tabla
    (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 20,
    });

    const pdfBlob = doc.output('blob');

    const fileName = `Reporte01-${formattedDate}.pdf`;
    FileSaver.saveAs(pdfBlob, fileName);

    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    // Guarda el archivo PDF
    // doc.save(`Reporte01-${formattedDate}.pdf`);
}
}
