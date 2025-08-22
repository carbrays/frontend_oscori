export interface GastosForm{
    tipo: string,
    descripcion: string,
    flete:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    seguro:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    enbarque:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    pesaje:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    fundicion:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    refinacion:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    castigo:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    merma:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    tratamiento:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    otro:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    total:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    valor:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    calculo:  {
        trimUno: number,
        trimDos: number,
        trimTres: number,
        trimCuatro: number,
        total: number
    },
    observacion_trimestre:  {
        trimUno: string,
        trimDos: string,
        trimTres: string,
        trimCuatro: string,
        total: string
    },
    observacion_general:  {
        trimUno: string,
        trimDos: string,
        trimTres: string,
        trimCuatro: string,
        total: string
    }
}

export class GastosModel implements GastosForm {
    tipo = '';
    descripcion = '';
    flete = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    seguro = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    enbarque = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    pesaje = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    fundicion = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    refinacion = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    castigo = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    merma = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    tratamiento = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    otro = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    total = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    valor = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    calculo = {
        trimUno: 0,
        trimDos: 0,
        trimTres: 0,
        trimCuatro: 0,
        total: 0
    };
    observacion_trimestre = {
        trimUno: '',
        trimDos: '',
        trimTres: '',
        trimCuatro: '',
        total: ''
    };
    observacion_general = {
        trimUno: '',
        trimDos: '',
        trimTres: '',
        trimCuatro: '',
        total: ''
    };
    constructor(init?: Partial<GastosModel>) {
      Object.assign(this, init); 
    }
  }

