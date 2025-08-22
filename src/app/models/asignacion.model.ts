export class AsignacionModel {
    constructor( 
    public id_usuario: number,
    public razon_social: string,
    public nit: string,
    public rotulo_comercial: string,
    public departamento: string,
    public ciudad: string,
    public zona: string,
    public calle: string,
    public numero: string,
    public entre_calles: string,
    public edificio: string,
    public fax: string,
    public email: string,
    public pagina: string,
    public actividad_principal: string,
    public tipo_sector: string,
    public login: string
    )
    {}
}