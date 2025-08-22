export interface GuardarPostulante{
    ci: string;
    nombres: string;
    ap_pat: string;
    ap_mat?: string;
    celular?: string;
    correo?: string;
    fecnac?: Date;
    domicilio?: string;
    depto?: number;
    id_escuela?: number;
    cod_boucher?: string;
    fec_boucher?: Date;
    total_boucher?: number;
    img_boucher?: string;
    id_usuario_asig?: number;
    estado?: string;
    usucre: string;
    feccre?: Date;
    usumod?: string;
    fecmod?: Date;
}
