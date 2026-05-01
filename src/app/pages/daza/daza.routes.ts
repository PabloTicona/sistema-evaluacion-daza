
import { RecetasComponent } from "./recetas/recetas.component";
import { Usuarios } from "./usuarios/usuarios";
import { Routes } from '@angular/router';

export default [
    { path: 'usuarios', data: { breadcrumb: 'Usuarios' }, component: Usuarios },
    { path: 'recetas', data: { breadcrumb: 'Recetas' }, component: RecetasComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
