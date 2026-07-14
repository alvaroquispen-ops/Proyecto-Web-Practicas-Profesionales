// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  // 1. Mantenemos intactos tus accesos de login y registro existentes
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

  // 2. AGREGAMOS tus 3 rutas para que redirija según el rol de Atlas
  // 2. AGREGAMOS tus 3 rutas para que redirija según el rol de Atlas
  { 
    path: 'dashboard/estudiante', 
    loadComponent: () => import('./dashboard/estudiante/estudiante').then(m => m.EstudianteComponent) 
  },
  { 
    path: 'dashboard/profesor', 
    loadComponent: () => import('./dashboard/profesor/profesor').then(m => m.ProfesorComponent) 
  },
  { 
    path: 'dashboard/empresa', 
    loadComponent: () => import('./dashboard/empresa/empresa').then(m => m.EmpresaComponent) 
  },

  // 3. Tus redirecciones automáticas por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
