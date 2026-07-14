import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {
  private apiUrl = 'http://localhost:3000/api/postulaciones';

  constructor(private http: HttpClient) {}

  // 1. Registrar una nueva postulación (Alumno presiona "Enviar")
  // CAMBIO: ahora recibe un FormData (texto + archivos reales) en vez de
  // un objeto JSON plano. NO seteamos el header 'Content-Type' a mano:
  // el navegador arma automáticamente el boundary correcto para multipart.
  registrarPostulacion(postulacion: FormData): Observable<any> {
    return this.http.post(this.apiUrl, postulacion, {
      responseType: 'text'
    });
  }

  // 2. Traer las prácticas de un alumno específico ("Mis Postulaciones")
  obtenerPostulacionesAlumno(alumnoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/alumno/${alumnoId}`);
  }

  // 3. Traer postulaciones recibidas por una empresa ("Historial")
  obtenerPostulacionesEmpresa(empresaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresa/${empresaId}`);
  }

  // 4. Actualizar el estado (Desde la ventana Evaluar de la Empresa)
  cambiarEstadoPostulacion(id: string, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, {
      estado: nuevoEstado.toLowerCase()
    }, { responseType: 'text' });
  }

  // 5. Eliminar una postulación (solo permitido si está pendiente)
  eliminarPostulacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}