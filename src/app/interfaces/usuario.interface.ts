export interface Usuario {
  id_usuario?: number;
  login: string;
  password?: string;
  nombre: string;
  paterno: string;
  materno: string;
  ci: string;
  direccion: string;
  cargo: string;
  rol: number;
  telefono: number;
  telefono_chile: number;
  correo: string;
  estado: string;
  persona_ref: string;
  telefono_ref: string;
  licencia_categoria: string;
  licencia_vencimiento: string; 
  fecha_inicio: string;         
  usucre?: string;
  feccre?: string;
  usumod?: string;
  fecmod?: string;
}