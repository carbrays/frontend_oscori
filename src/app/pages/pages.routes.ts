import { RouterModule, Routes } from "@angular/router";
import { loginGuardGuard } from "../services/guards/login-guard.guard";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { PagesComponent } from "./pages.component";

import { AdmUsuariosComponent } from "./administrador/adm-usuarios/adm-usuarios.component";
import { CodAsignarComponent } from "./codificacion/cod-asignar/cod-asignar.component";
import { CodSeleccionarComponent } from "./codificacion/cod-seleccionar/cod-seleccionar.component";
import { CodVerificacionComponent } from "./codificacion/cod-verificacion/cod-verificacion.component";
import { PostulanteComponent } from "./postulante/postulante.component";
import { ReporteComponent } from "./reporte/reporte.component";

import { UsuarioComponent } from "./usuario/usuario.component";
import { ClientesComponent } from "./clientes/clientes.component";
import { ContenedoresComponent } from "./contenedor/contenedor.component";
import { DespachosComponent } from "./despachos/despachos.component";
import { VehiculosComponent } from "./vehiculos/vehiculos.component";
import { MercanciaComponent } from "./mercancia/mercancia.component";
import { CotizacionComponent } from "./cotizacion/cotizacion.component";
import { NavierasComponent } from "./navieras/navieras.component";

const pagesRoutes: Routes = [
    {
        path:'', 
        component: PagesComponent,
        canActivate: [loginGuardGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent, data: { titulo: 'Dashboard' } },
            { path: 'postulantes', component: PostulanteComponent, data: { titulo: 'Postulantes' } },
            { path: 'reporte', component: ReporteComponent, data: { titulo: 'Reporte' } },

            { path: 'usuarios', component: UsuarioComponent, data: { titulo: 'Usuarios' } },
            { path: 'clientes', component: ClientesComponent, data: { titulo: 'Clientes' } },
            { path: 'contenedor', component: ContenedoresComponent, data: { titulo: 'Contenedor' } },
            { path: 'despachos', component: DespachosComponent, data: { titulo: 'Despachos' } },
            { path: 'vehiculos', component: VehiculosComponent, data: { titulo: 'Vehiculos' } },
            { path: 'navieras', component: NavierasComponent, data: { titulo: 'Navieras' } },
            { path: 'mercancias', component: MercanciaComponent, data: { titulo: 'Mercancias' } },
            { path: 'cotizacion', component: CotizacionComponent, data: { titulo: 'Cotizacion' } },

            /* MEMORANDUM */
            { path: 'cod-asignar', component: CodAsignarComponent, data: { titulo: 'Nuevo Memorandum' }},
            { path: 'cod-seleccionar/:idd/:nit', component: CodSeleccionarComponent, data: { titulo: 'Lista Memorandum' }},
            { path: 'verificacion/:idFuncionario/:idFirma/:idRegistro/:id', component: CodVerificacionComponent, data: { titulo: 'Editar Memorandum' }},
            
            /* ADMINISTRADOR */
            { path: 'usuarios', component: AdmUsuariosComponent, data: { titulo: 'Registro de usuarios' }},
            
            {path:'', redirectTo: '/dashboard', pathMatch: 'full'},
        ]
    },
];


export const PAGES_ROUTES = RouterModule.forChild(pagesRoutes);