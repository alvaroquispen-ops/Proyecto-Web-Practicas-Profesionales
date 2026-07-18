import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Reemplaza el puerto 3000 por el puerto real de tu backend si es diferente
  private readonly baseUrl = 'https://proyecto-web-practicas-profesionales.onrender.com/api'; 

  // Método para el Login
 // En tu auth.service.ts
login(credentials: any): Observable<any> {
  // Pasamos el objeto "credentials" completo directamente sin romper sus propiedades
  return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
    tap(response => {
      // Si tu backend devuelve un token al loguearse, lo guardamos
      if (response && response.token) {
        this.setToken(response.token);
      }
    })
  );
}

  // Método para el Registro
register(userData: any): Observable<any> {
  const payload = {
    // 1. TRADUCCIONES CRÍTICAS PARA MONGODB:
    email: userData.correo,          // Mapea 'correo' a 'email'
    contrasena: userData.password,   // Mapea 'password' a 'contrasena'
    rol: userData.role?.toLowerCase(), // Mapea 'role' a 'rol' (ej: 'estudiante')

    // 2. Campos generales que ya coinciden con tu UsuarioSchema:
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    dni: userData.dni,
    correoInstitucional: userData.correo, 
    genero: userData.genero,
    fechaNacimiento: userData.fechaNacimiento,
    carrera: userData.carrera,
    curso: userData.curso,
    // FIX: el formulario manda 'docenteCargo', pero el schema de Mongoose
    // espera 'docenteACargo'. Antes este dato se perdía silenciosamente.
    docenteACargo: userData.docenteCargo,
    codigoEstudiante: userData.codigoEstudiante,
    codigoCurso: userData.codigoCurso,
    nombreEmpresa: userData.nombreEmpresa,
    ruc: userData.ruc,
    nombreContacto: userData.nombreContacto,
    cargo: userData.cargo,
    telefono: userData.telefono
  };

  // Enviamos el objeto corregido al backend
  return this.http.post<any>(`${this.baseUrl}/register`, payload);
}
  // Métodos auxiliares para el Token
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}