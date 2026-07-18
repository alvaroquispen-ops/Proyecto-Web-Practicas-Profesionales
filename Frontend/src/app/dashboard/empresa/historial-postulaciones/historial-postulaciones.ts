import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostulacionService } from '../postulacion.service';

@Component({
  selector: 'app-historial-postulaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-postulaciones.html',
  styleUrls: ['./historial-postulaciones.css']
})
export class HistorialPostulaciones implements OnInit {
  empresaId: string = '';
  postulaciones: any[] = [];
  postulacionesFiltradas: any[] = [];

  // Variables espejo de los inputs de filtro
  inputPuesto: string = '';
  inputEstado: string = '';

  // Se activa al tocar cualquier filtro sin haber presionado "Buscar" todavía
  filtroPendiente: boolean = false;

  // Variables para el control de tus modales retro de evaluación
  mostrarModalCV: boolean = false;
  mostrarModalConfirmacion: boolean = false;

  postulanteSeleccionado: any = null;
  estadoSeleccionado: 'aceptado' | 'rechazado' | null = null;

  constructor(
    private postulacionService: PostulacionService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuarioLogueado');
      if (usuarioSesion) {
        const usuario = JSON.parse(usuarioSesion);
        this.empresaId = usuario._id || usuario.id;
        this.cargarPostulaciones();
      }
    }
  }

  cargarPostulaciones(): void {
    if (!this.empresaId) return;

    this.postulacionService.obtenerPostulacionesEmpresa(this.empresaId).subscribe({
      next: (data: any) => {
        this.postulaciones = data || [];
        this.postulacionesFiltradas = [...this.postulaciones];
        // Forzamos la detección de cambios por si el proyecto corre en modo
        // zoneless (mismo problema que resolvimos en los otros componentes).
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar colección postulaciones desde MongoDB:', err);
        this.postulaciones = [];
        this.postulacionesFiltradas = [];
        this.cdr.detectChanges();
      }
    });
  }

  onFiltroChange(): void {
    this.filtroPendiente = true;
  }

  buscarConFiltros(): void {
    this.filtroPendiente = false;

    const puestoAFiltrar = (this.inputPuesto || '').trim().toLowerCase();
    const estadoAFiltrar = (this.inputEstado || '').trim().toLowerCase();

    if (puestoAFiltrar === '' && estadoAFiltrar === '') {
      this.postulacionesFiltradas = [...this.postulaciones];
      return;
    }

    this.postulacionesFiltradas = this.postulaciones.filter(post => {
      const campoPuesto = (post.ofertaId?.puesto || post.puesto || '').toLowerCase();
      const coincidePuesto = puestoAFiltrar === '' || campoPuesto.includes(puestoAFiltrar);

      const coincideEstado = estadoAFiltrar === '' ||
        (post.estado || '').toLowerCase() === estadoAFiltrar;

      return coincidePuesto && coincideEstado;
    });
  }

  // Base del backend para armar la URL completa de descarga de cada documento
  backendBase: string = 'https://proyecto-web-practicas-profesionales.onrender.com';

  mostrarModalDocumentos: boolean = false;
  documentosSeleccionados: { nombre: string, url: string }[] = [];
  candidatoDocumentos: string = '';

  verCV(postulacion: any): void {
    this.postulanteSeleccionado = postulacion;
    this.mostrarModalCV = true;
  }

  verDocumentos(postulacion: any): void {
    this.documentosSeleccionados = postulacion.documentosAdjuntos || [];
    this.candidatoDocumentos = postulacion.nombreAlumno || 'el postulante';
    this.mostrarModalDocumentos = true;
  }

  urlDocumento(doc: { nombre: string, url: string }): string {
    if (!doc?.url) return '#';
    return doc.url.startsWith('http') ? doc.url : `${this.backendBase}${doc.url}`;
  }

  cambiarEstado(postulacion: any, estado: 'aceptado' | 'rechazado'): void {
    this.postulanteSeleccionado = postulacion;
    this.estadoSeleccionado = estado;
    this.mostrarModalConfirmacion = true;
  }

  procesarDecision(): void {
    if (this.postulanteSeleccionado && this.estadoSeleccionado) {
      const id = this.postulanteSeleccionado._id || this.postulanteSeleccionado.id;

      this.postulacionService.cambiarEstadoPostulacion(id, this.estadoSeleccionado).subscribe({
        next: (res: any) => {
          alert(`Postulación marcada como ${this.estadoSeleccionado?.toUpperCase()} con éxito.`);
          this.mostrarModalConfirmacion = false;
          this.mostrarModalCV = false;
          this.cargarPostulaciones();
        },
        error: (err: any) => console.error('Error al actualizar estado en la base de datos:', err)
      });
    }
  }
}