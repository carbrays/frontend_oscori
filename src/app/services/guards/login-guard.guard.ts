import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { tap } from 'rxjs';
import { UsuarioService } from '../service.index';

 export const loginGuardGuard: CanActivateFn = (route, state) => {
  const usuario: UsuarioService=inject(UsuarioService);
  const router = inject(Router);
  /* if(token) { 
  
  return true;
  } else {
    router.navigate(['login']);
    return false;
  } */

  return usuario.validarToken()
        .pipe(
          tap( estaAutenticado =>  {
            if ( !estaAutenticado ) {
              router.navigateByUrl('/login');
            }
          })
        );
};  

