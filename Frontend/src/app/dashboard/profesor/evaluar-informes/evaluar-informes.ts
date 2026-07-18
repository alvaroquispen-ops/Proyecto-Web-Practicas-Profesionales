import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InformeService } from '../informe.service';

@Component({
  selector: 'app-evaluar-informes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluar-informes.html',
  styleUrl: './evaluar-informes.css',
})
export class EvaluarInformes implements OnInit {
  docenteNombre: string = '';

  informes: any[] = [];
  informesFiltrados: any[] = [];

  // Filtro
  inputEstado: string = '';
  filtroPendiente: boolean = false;

  // Control de vista: 'lista' | 'revision'
  vista: 'lista' | 'revision' = 'lista';
  informeSeleccionado: any = null;

  // true si el informe YA estaba calificado cuando se abrió (modo "Editar")
  modoEdicion: boolean = false;

  // Formulario de evaluación
  calificacionInput: string = '';
  comentarioInput: string = '';

  mostrarModalEnviar: boolean = false;

  constructor(
    private informeService: InformeService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuarioLogueado');
      if (usuarioSesion) {
        const usuario = JSON.parse(usuarioSesion);
        this.docenteNombre = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();
        this.cargarInformes();
      }
    }
  }

  cargarInformes(): void {
    if (!this.docenteNombre) return;

    this.informeService.obtenerInformesDocente(this.docenteNombre).subscribe({
      next: (data: any[]) => {
        this.informes = data || [];
        this.informesFiltrados = [...this.informes];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar informes del docente:', err);
        this.informes = [];
        this.informesFiltrados = [];
        this.cdr.detectChanges();
      }
    });
  }

  onFiltroChange(): void {
    this.filtroPendiente = true;
  }

  buscarConFiltros(): void {
    this.filtroPendiente = false;
    const estadoAFiltrar = (this.inputEstado || '').trim().toLowerCase();

    if (estadoAFiltrar === '') {
      this.informesFiltrados = [...this.informes];
      return;
    }

    this.informesFiltrados = this.informes.filter(i => (i.estado || '').toLowerCase() === estadoAFiltrar);
  }

  // ================= VISTA DE REVISIÓN =================

  fueEvaluado(informe: any): boolean {
    return (informe?.estado || '').toLowerCase() === 'calificado';
  }

  abrirRevision(informe: any): void {
    this.informeSeleccionado = informe;
    this.modoEdicion = this.fueEvaluado(informe);
    this.calificacionInput = informe.calificacion || '';
    this.comentarioInput = informe.comentario || '';
    this.vista = 'revision';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.informeSeleccionado = null;
  }

  verArchivo(): void {
    if (!this.informeSeleccionado?.archivo?.url) return;
    const url = `https://proyecto-web-practicas-profesionales.onrender.com${this.informeSeleccionado.archivo.url}`;
    window.open(url, '_blank');
  }

  pedirConfirmacionEnviar(): void {
    if (!this.calificacionInput || !this.calificacionInput.trim()) {
      alert('Ingresa una calificación antes de continuar.');
      return;
    }
    this.mostrarModalEnviar = true;
  }

  cancelarEnviar(): void {
    this.mostrarModalEnviar = false;
  }

  confirmarEnviar(): void {
    const id = this.informeSeleccionado?._id || this.informeSeleccionado?.id;
    if (!id) return;

    this.informeService.evaluarInforme(id, this.calificacionInput.trim(), this.comentarioInput).subscribe({
      next: () => {
        this.mostrarModalEnviar = false;
        this.vista = 'lista';
        this.informeSeleccionado = null;
        this.informes = [];
        this.informesFiltrados = [];
        this.cargarInformes();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al enviar la evaluación del informe:', err);
        alert('Hubo un problema al enviar la evaluación. Intenta de nuevo.');
      }
    });
  }
}