import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformeService {
  private apiUrl = 'http://localhost:3000/api/informes';

  constructor(private http: HttpClient) {}

  // 1. Alumno envía un informe (FormData: texto + archivo real)
  enviarInforme(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { responseType: 'text' });
  }

  // 2. Informes enviados por un alumno específico
  obtenerInformesAlumno(alumnoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/alumno/${alumnoId}`);
  }

  // 3. Informes asignados a un docente (por nombre)
  obtenerInformesDocente(nombreDocente: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/docente/${encodeURIComponent(nombreDocente)}`);
  }

  // 4. Docente evalúa (o edita) calificación + comentario
  evaluarInforme(id: string, calificacion: string, comentario: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/evaluar`, { calificacion, comentario }, { responseType: 'text' });
  }

  // 5. Alumno anula su envío (solo si está pendiente)
  anularInforme(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}