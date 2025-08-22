import 'lodash';
import { CodificacionService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';
import { GastosModel } from '../../interfaces/gastos.interface';
import { GuardarPostulante } from '../../interfaces/guardarpostulante.interface';

import { PostulantesService } from '../../services/postulantes/postulantes.service';
import { Table } from 'primeng/table';
import { now } from 'moment';

import { Component, OnInit } from '@angular/core';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

declare var _:any;
@Component({
  selector: 'app-postulante',
  templateUrl: './postulante.component.html',
  styleUrls: ['./postulante.component.css']
})
export class PostulanteComponent implements OnInit{
  postulantes: any[] = [];
  selectedPostulantes: any[] = [];

  loading: boolean = true;

  vnuevo: boolean = false;
  vmedico: boolean = false;
  vpsico: boolean = false;
  vodonto: boolean = false;

  filterValue: string = '';

  postulante: any;
  idPostulante: any;

  resetPostulante() {
    this.postulante = {
    ci: '',
    nombres: '',
    ap_pat: '',
    ap_mat: '',
    celular: '',
    correo: '',
    fecnac: undefined,
    domicilio: '',
    depto: undefined,
    id_escuela: undefined,
    cod_boucher: '',
    fec_boucher: undefined,
    total_boucher: 0,
    img_boucher: '',
    id_usuario_asig: undefined,
    estado: '',
    usucre: '',
    feccre: undefined,
    usumod: '',
    fecmod: undefined,
  };
  }

  departamentos: any;

  escuelas: any;
  datosPostulante: any;
  data: any;

  vguardapost: boolean = false;
  vactpost: boolean = false;

  archivador: string = "123";

  constructor(private postulantesService: PostulantesService) { }

  ngOnInit() {
    this.resetPostulante();
    this.listarPostulantes();
    this.listarDepartamentos();
    this.listarEscuelas();
    this.loading = false;
  }

  listarPostulantes() {
    this.postulantesService.getPostulantes().subscribe((data: any[]) => {
      this.postulantes = data;
    });
  }

  listarDepartamentos() {
    this.postulantesService.getDepartamentos().subscribe((data: any[]) => {
      this.departamentos = data;
    });
  }

  listarEscuelas() {
    this.postulantesService.getEscuelas().subscribe((data: any[]) => {
      this.escuelas = data;
    });
  }

  clear(table: any) {
    table.clear();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'APROBADO':
        return 'success';
      case 'PENDIENTE':
        return 'warning';
      case 'RECHAZADO':
        return 'danger';
      default:
        return null;
    }
  }

  evaluar(i: number) {
    if (i == 0) {
      this.resetPostulante();
      this.vnuevo = true;
      this.vguardapost = false;
      this.vactpost = true;
    }
    if (i == 1) {
      this.vmedico = true;
    }
    if (i == 2) {
      this.vpsico = true;
    }
    if (i == 3) {
      this.vodonto = true;
    }
  }

  onUpload(doc:any) {
    console.log(doc);
  }

  prueba() { 
  //   Swal.fire({
  // title: "<strong>HTML <u>example</u></strong>",
  // icon: "info",
  // html: `
  //   You can use <b>bold text</b>,
  //   <a href="#" autofocus>links</a>,
  //   and other HTML tags
  // `,
  // showCloseButton: true,
  // showCancelButton: true,
  // focusConfirm: false,
  // confirmButtonText: `
  //   <i class="fa fa-thumbs-up"></i> Great!
  // `,
  // confirmButtonAriaLabel: "Thumbs up, great!",
  // cancelButtonText: `
  //   <i class="fa fa-thumbs-down"></i>
  // `,
  // cancelButtonAriaLabel: "Thumbs down"
  //   });
    Swal.fire({
  title: 'Guardado',
  text: 'El postulante ha sido registrado con éxito',
  icon: 'success',
  confirmButtonText: "Generar PDF",
  footer: `
    <div>
      <div>SU NÚMERO DE ARCHIVADOR ES:</div>
      <a href="#" style="font-size: 120px; font-weight: bold; color: #4CAF50; text-decoration: none;">
        ${this.archivador}
      </a>
      
    </div>
  `
}).then((result) => {
  if (result.isConfirmed) {
    this.generarPDF();
  }
  })
  }

  guardarPostulante() {
    this.postulante.img_boucher = 'prueba.jpg';
    this.postulante.id_usuario_asig = Number(localStorage.getItem('id'));
    this.postulante.estado= 'ELABORADO';
    this.postulante.usucre= 'admin';
    this.postulante.feccre= new Date();
    this.postulantesService.createPostulante(this.postulante).subscribe(
      response => {
        this.idPostulante = response;
        this.archivador = this.idPostulante[0].id_postulante;
        Swal.fire({
          title: 'Guardado',
          text: 'El postulante ha sido registrado con exito',
          icon: 'success',
          confirmButtonColor: "#324225",
          footer: `<div><div>SU NÚMERO DE ARCHIVADOR ES:</div>
          <a href="#" style="font-size: 120px; font-weight: bold; color: #4CAF50; text-decoration: none;">
          ${this.archivador} '</a>
          <div><button pButton pRipple type="button" icon="mdi mdi-heart-pulse mdi-24px" class="p-button-rounded p-button-danger"
                    (click)="generarPDF()"></button></div></div>`
        })
        this.listarPostulantes();
    },
    error => {
      console.error('Error al guardar el postulante:', error);
      // Manejar errores
    }
  );
  }

  editarPostulante(id: any) {
    this.vnuevo = true;
    this.vguardapost = true;
    this.vactpost = false;
    this.postulantesService.getPostulante(id).subscribe(
      response => {
        this.datosPostulante = response
        this.data = this.datosPostulante[0];
        console.log(this.data.fecnac2);
        this.postulante.ci = this.data.ci;
        this.postulante.nombres = this.data.nombres;
        this.postulante.ap_pat = this.data.ap_pat;
        this.postulante.ap_mat = this.data.ap_mat;
        this.postulante.celular = this.data.celular;
        this.postulante.correo = this.data.correo;
        this.postulante.fecnac = this.data.fecnac2;
        this.postulante.domicilio = this.data.domicilio;
        this.postulante.depto = this.data.depto;
        this.postulante.id_escuela = this.data.id_escuela;
        this.postulante.cod_boucher = this.data.cod_boucher;
        this.postulante.fec_boucher = new Date(this.data.fec_boucher);
        this.postulante.total_boucher = this.data.total_boucher;
        this.postulante.img_boucher = this.data.img_boucher;
        this.postulante.id_usuario_asig = this.data.id_usuario_asig;
        this.postulante.estado = this.data.estado;
        this.postulante.usucre = this.data.usucre;
        this.postulante.feccre = this.data.feccre;
        this.postulante.usumod = this.data.usumod;
        this.postulante.fecmod = this.data.fecmod;
    },
    error => {
      console.error('Error al cargar el postulante:', error);
      // Manejar errores
    })
  }

  guardarEditarPostulante() {
    this.postulante.img_boucher = 'prueba.jpg';
    this.postulante.id_usuario_asig = Number(localStorage.getItem('id'));
    this.postulante.estado= 'ELABORADO';
    this.postulante.usumod= 'admin';
    this.postulante.fecmod= new Date();
    this.postulantesService.updatePostulante(this.postulante).subscribe(
    response => {
      console.log('Postulante guardado:', response);
      Swal.fire({
              title: 'Guardado',
              text: 'El postulante ha sido registrado con exito',
              icon: 'success'
      })
        this.listarPostulantes();
        this.postulante = null;
    },
    error => {
      console.error('Error al guardar el postulante:', error);
      // Manejar errores
    }
  );
  }

  guardarExamen() {
    this.postulante.img_boucher = 'prueba.jpg';
    this.postulante.id_usuario_asig = Number(localStorage.getItem('id'));
    this.postulante.estado= 'ELABORADO';
    this.postulante.usucre= 'admin';
    this.postulante.feccre= new Date();
    this.postulante.usumod= '';
    this.postulante.fecmod= new Date();
    this.postulantesService.createPostulante(this.postulante).subscribe(
    response => {
      console.log('Postulante guardado:', response);
      Swal.fire({
              title: 'Guardado',
              text: 'El postulante ha sido registrado con exito',
              icon: 'success'
      })
        this.listarPostulantes();
        this.postulante = null;
    },
    error => {
      console.error('Error al guardar el postulante:', error);
      // Manejar errores
    }
  );
  }

  editarExamen(id: any) {
    this.vnuevo = true;
    this.postulantesService.getPostulante(id).subscribe(
      response => {
        this.datosPostulante = response
        this.data = this.datosPostulante[0]
        this.postulante.ci = this.data.ci
        this.postulante.nombres = this.data.nombres;
        this.postulante.ap_pat = this.data.ap_pat;
        this.postulante.ap_mat = this.data.ap_mat;
        this.postulante.celular = this.data.celular;
        this.postulante.correo = this.data.correo;
        this.postulante.fecnac = this.data.fecnac;
        this.postulante.domicilio = this.data.domicilio;
        this.postulante.depto = this.data.depto;
        this.postulante.id_escuela = this.data.id_escuela;
        this.postulante.cod_boucher = this.data.cod_boucher;
        this.postulante.fec_boucher = this.data.fec_boucher;
        this.postulante.total_boucher = this.data.total_boucher;
        this.postulante.img_boucher = this.data.img_boucher;
        this.postulante.id_usuario_asig = this.data.id_usuario_asig;
        this.postulante.estado = this.data.estado;
        this.postulante.usucre = this.data.usucre;
        this.postulante.feccre = this.data.feccre;
        this.postulante.usumod = this.data.usumod;
        this.postulante.fecmod = this.data.fecmod;
    },
    error => {
      console.error('Error al cargar el postulante:', error);
      // Manejar errores
    })
  }

  cancelar(i: number) {
    if (i == 0) {
      this.vnuevo = false;
    }
    if (i == 1) {
      this.vmedico = false;
    }
    if (i == 2) {
      this.vpsico = false;
    }
    if (i == 3) {
      this.vodonto = false;
    }
  }

  generarPDF(){
    let docDefinition:any = {
      pageSize: { width: 283.46, height: 160.73 },
      pageMargins: [10, 10, 10, 10], 

      content: [
    { text: 'bryan rodri', fontSize: 20, bold: true, alignment: 'center' }, // Texto con tamaño 20
    { text: '2012', fontSize: 60, bold: true, alignment: 'center', color: '#4CAF50' } // Texto con tamaño 100
      ],
      
      styles: {
    strong: {
      bold: true,
      color: "#282828"
    }
  },

  defaultStyle: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#4F4F4F"
  }
    };

    pdfMake.createPdf(docDefinition).open();

  }

}
