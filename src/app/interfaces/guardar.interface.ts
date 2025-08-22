export interface GuardarForm{
    id_registro: number;
    id_funcionario: number;
	funcionario: string;
    apellido: string;
	puesto?: string;
	fecha: string;
    numero: string;
    id_referenciamemos: number;
    id_funcionario_firma: number;
    funcionario_firma: string;
    puesto_firma?: string;
    asunto: string;
    contenido: string;
    cc: string;
    usucre: string;
    categoria: string;
}