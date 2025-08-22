import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';

@Injectable({
    providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

    constructor(private spinnerservice: SpinnerService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.spinnerservice.llamarSpinner();
        const token = localStorage.getItem('token');
        const reqClone = req.clone();
        if (token) {
            req = req.clone({ headers: req.headers.set('token', token) });
        }
        if (!req.headers.has('Content-Type')) {
            req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
        }
        return next.handle(req).pipe(
            finalize(()=> {
                this.spinnerservice.detenerSpinner();
            })
        );;
    }
}
