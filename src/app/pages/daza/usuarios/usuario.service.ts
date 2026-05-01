import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HandleError, HttpErrorHandler } from '@/app/http-error-handler.service';
import { UserDto } from './user-dto';


@Injectable()
export class UsuarioService {
    private readonly apiUrl = 'https://dummyjson.com/users';
    private handleError: HandleError;

    constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('UsuarioService');
    }

    getUsers(): Observable<UserDto> {
        return this.http.get<UserDto>(this.apiUrl).pipe(
            catchError(this.handleError<UserDto>('getUsers', { users: [], total: 0, skip: 0, limit: 0 }))
        );
    }
}