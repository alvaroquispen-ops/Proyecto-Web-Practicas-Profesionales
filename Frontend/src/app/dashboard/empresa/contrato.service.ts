import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {
  private apiUrl = 'http://localhost:3000/api/contratos';

  constructor(private http: HttpClient) {}

  // 1. Alumno envía su contrato (FormData: texto + archivo real)
  enviarContrato(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { responseType: 'text' });
  }

  // 2. Contratos enviados por un alumno específico
  obtenerContratosAlumno(alumnoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/alumno/${alumnoId}`);
  }

  // 3. Contratos asignados a un docente (por nombre, ver nota en el backend)
  obtenerContratosDocente(nombreDocente: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/docente/${encodeURIComponent(nombreDocente)}`);
  }

  // 4. Docente evalúa (acepta/rechaza) con observación
  evaluarContrato(id: string, estado: 'aceptado' | 'rechazado', observacion: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/evaluar`, { estado, observacion }, { responseType: 'text' });
  }

  // 5. Alumno anula su envío (solo si está pendiente)
  anularContrato(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}