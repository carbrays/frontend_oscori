import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from 'src/app/services/operaciones/operaciones.service';
import Swal from 'sweetalert2';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export interface Operacion {
  camion: string;
  origen: string;
  fechaOrigen: string;
  destino: string;
  fechaDestino: string;
  nuevoDestino?: string;
  fechaNuevoDestino?: string;
  estados: string[];
  progreso: number; // 0 a 100
}

@Component({
  selector: 'app-operaciones',
  templateUrl: './operaciones.component.html',
  styleUrls: ['./operaciones.component.css']
})
export class OperacionesComponent implements OnInit {

  operaciones = [
    {
      camion: 'VOLVO FH-540',
      origen: 'Iquique',
      fechaOrigen: '20/02/2026',
      destino: 'La Paz',
      fechaDestino: '22/02/2026',
      nuevoDestino: 'Santa Cruz',
      fechaNuevoDestino: '24/02/2026',
      estados: ['Cargado', 'En tránsito', 'En aduana'],
      progreso: 65
    },
    {
      camion: 'SCANIA R500',
      origen: 'Arica',
      fechaOrigen: '18/02/2026',
      destino: 'Oruro',
      fechaDestino: '19/02/2026',
      estados: ['Cargado', 'En tránsito', 'Entregado'],
      progreso: 100
    }
  ];

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

  constructor(private operacionesService: OperacionesService, private fb: FormBuilder) { }

  ngOnInit(): void {
    
  }

  
}
