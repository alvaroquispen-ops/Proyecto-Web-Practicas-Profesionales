import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InformeService } from '../../profesor/informe.service';

@Component({
  selector: 'app-mis-informes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-informes.html',
  styleUrl: './mis-informes.css',
})
export class MisInformes implements OnInit {
  alumnoId: string = '';
  alumnoNombre: string = '';
  docenteNombre: string = '';

  informes: any[] = [];

  // Control de vista: 'lista' | 'nuevo' | 'detalle'
  vista: 'lista' | 'nuevo' | 'detalle' = 'lista';
  informeSeleccionado: any = null;

  // Formulario de nuevo envío
  tituloInput: string = '';
  archivoSeleccionado: File | null = null;

  // Modales
  mostrarModalEnviar: boolean = false;
  mostrarModalAnular: boolean = false;

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
        this.alumnoId = usuario._id || usuario.id;
        this.alumnoNombre = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();
        this.docenteNombre = usuario.docenteACargo || 'Docente no asignado';
        this.cargarInformes();
      }
    }
  }

  cargarInformes(): void {
    if (!this.alumnoId) return;

    this.informeService.obtenerInformesAlumno(this.alumnoId).subscribe({
      next: (data: any[]) => {
        this.informes = data || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar informes del alumno:', err);
        this.informes = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ================= NUEVO ENVÍO =================

  abrirNuevo(): void {
    this.tituloInput = '';
    this.archivoSeleccionado = null;
    this.vista = 'nuevo';
  }

  onArchivoSeleccionado(event: any): void {
    const archivo = event.target.files?.[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;
    }
    event.target.value = '';
  }

  quitarArchivo(): void {
    this.archivoSeleccionado = null;
  }

  pedirConfirmacionEnviar(): void {
    if (!this.tituloInput || !this.tituloInput.trim()) {
      alert('Debes escribir un título para el informe.');
      return;
    }
    if (!this.archivoSeleccionado) {
      alert('Debes subir un archivo de informe antes de enviar.');
      return;
    }
    this.mostrarModalEnviar = true;
  }

  cancelarEnviar(): void {
    this.mostrarModalEnviar = false;
  }

  confirmarEnviar(): void {
    const formData = new FormData();
    formData.append('alumnoId', this.alumnoId);
    formData.append('alumnoNombre', this.alumnoNombre);
    formData.append('docenteNombre', this.docenteNombre);
    formData.append('titulo', this.tituloInput.trim());
    if (this.archivoSeleccionado) {
      formData.append('informe', this.archivoSeleccionado, this.archivoSeleccionado.name);
    }

    this.informeService.enviarInforme(formData).subscribe({
      next: () => {
        this.mostrarModalEnviar = false;
        this.vista = 'lista';
        this.informes = [];
        this.cargarInformes();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al enviar el informe:', err);
        alert('Hubo un problema al enviar tu informe. Intenta de nuevo.');
      }
    });
  }

  // ================= VER DETALLE =================

  abrirDetalle(informe: any): void {
    this.informeSeleccionado = informe;
    this.vista = 'detalle';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.informeSeleccionado = null;
  }

  estaPendiente(informe: any): boolean {
    return (informe?.estado || '').toLowerCase() === 'pendiente';
  }

  // ================= ANULAR ENVÍO =================

  pedirConfirmacionAnular(): void {
    if (!this.estaPendiente(this.informeSeleccionado)) return;
    this.mostrarModalAnular = true;
  }

  cancelarAnular(): void {
    this.mostrarModalAnular = false;
  }

  confirmarAnular(): void {
    const id = this.informeSeleccionado?._id || this.informeSeleccionado?.id;
    if (!id) return;

    this.informeService.anularInforme(id).subscribe({
      next: () => {
        this.mostrarModalAnular = false;
        this.vista = 'lista';
        this.informeSeleccionado = null;
        this.informes = [];
        this.cargarInformes();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al anular el informe:', err);
        alert('Hubo un problema al anular tu informe. Intenta de nuevo.');
      }
    });
  }

  urlArchivo(archivo: { nombre: string, url: string } | undefined): string {
    if (!archivo?.url) return '#';
    return `https://proyecto-web-practicas-profesionales.onrender.com${archivo.url}`;
  }
}