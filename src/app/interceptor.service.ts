import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap, filter, take } from 'rxjs/operators';

const VALID_TOKEN = 'VALID_TOKEN';
const REFRESH_TOKEN_API = "http://localhost:8080/api/refreshToken";

@Injectable({
  providedIn: 'root'
})
export class InterceptorService {

  refreshingInProgress: boolean = false;

  private accessTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('Inside the 200 success resoponse event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('Inside the error response catchError ==>', error);
        if (error.status === 401) {
          console.log('====== API call to refreshing the token =======')
          return this.refreshToken(req, next);
        }
        return throwError(error);
      })
    )
  }

  private refreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("Inside the private 'refreshToken' method");
    console.log("====> this.refreshingInProgress <===", this.refreshingInProgress);
    if (!this.refreshingInProgress) {
      console.log('========= Inside the IF condition =====')
      this.refreshingInProgress = true;
      console.log("====> this.refreshingInProgress set to true <===");
      this.accessTokenSubject.next(null);
      return this.http.get(REFRESH_TOKEN_API).pipe(
        switchMap((res: { token: string }) => {
          console.log(' =========== INSIDE the switchMap Callback ======= | res =>', res)
          this.refreshingInProgress = false;
          this.accessTokenSubject.next(res.token);
          // repeat failed request with new token
          return next.handle(this.addAuthorizationHeader(request, res.token));
        })
      );
    } else {
      console.log('========= Inside the ELSE condition =====')
      // wait while getting new token
      return this.accessTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          // repeat failed request with new token
          return next.handle(this.addAuthorizationHeader(request, token));
        }));
    }
  }

  private addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    console.log('Inside the "addAuthorizationHeader" method | token', token);
    if (token) {
      localStorage.setItem('token', token);
      console.log('Setting the new VALID_TOKEN token')
      console.log('**** Cloning the request and making api call again with valid token****')
      console.log('########## REQUEST headers ==>', request.headers);
      return request.clone({ setHeaders: { token } });
    }
    return request;
  }

}
