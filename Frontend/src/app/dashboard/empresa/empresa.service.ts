import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  // Apunta directamente al prefijo base '/api' configurado en tu Express
  private API_URL = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  // ==========================================================================
  // OFERTAS DE PRÁCTICAS (Módulo: Publicar y Mis Ofertas)
  // ==========================================================================

  // Conecta con POST -> http://localhost:3000/api/publicar
  publicarOferta(oferta: any): Observable<any> {
    return this.http.post(`${this.API_URL}/publicar`, oferta);
  }

  actualizarOferta(id: string, datos: any): Observable<any> {
  return this.http.put(`http://localhost:3000/api/ofertas/${id}`, datos);
}

  // Conecta con GET -> http://localhost:3000/api/mis-ofertas/:empresaId
  obtenerMisOfertas(empresaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/mis-ofertas/${empresaId}`);
  }

  // Conecta con DELETE -> http://localhost:3000/api/eliminar/:id
  eliminarOferta(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/eliminar/${id}`);
  }

  // ==========================================================================
  // POSTULACIONES (Módulo: Historial de Postulaciones)
  // ==========================================================================
  // Nota: Estas quedan listas aquí para cuando implementemos sus rutas en el backend
  
  obtenerPostulaciones(empresaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/postulaciones/empresa/${empresaId}`);
  }

  actualizarEstadoPostulacion(id: string, estado: string): Observable<any> {
    return this.http.put(`${this.API_URL}/postulaciones/estado/${id}`, { estado });
  }

  // 🌟 Agrega este método dentro de tu EmpresaService para consultar el catálogo global
// 🌟 Método corregido para usar la propiedad exacta de tu clase
 obtenerTodasLasOfertasGlobales(): Observable<any> {
  return this.http.get<any[]>(`${this.API_URL}/todas`); 
}
}