import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HandleError, HttpErrorHandler } from '@/app/http-error-handler.service';
import { RecipeDto } from './recipe-dto';



@Injectable()
export class RecitasService {
    private readonly apiUrl = 'https://dummyjson.com/recipes';
    private handleError: HandleError;

    constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('RecitasService');
    }

    getRecipes(limit: number = 5, skip: number = 0): Observable<RecipeDto> {
        const params = new HttpParams()
            .set('limit', limit)
            .set('skip', skip);

        return this.http.get<RecipeDto>(this.apiUrl, { params }).pipe(
            catchError(this.handleError<RecipeDto>('getRecipes', { recipes: [], total: 0, skip: 0, limit: 0 }))
        );
    }

}