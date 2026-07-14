import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratoService } from '../../empresa/contrato.service';

@Component({
  selector: 'app-adjuntar-contrato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adjuntar-contrato.html',
  styleUrl: './adjuntar-contrato.css',
})
export class AdjuntarContrato implements OnInit {
  alumnoId: string = '';
  alumnoNombre: string = '';
  docenteNombre: string = '';

  contratos: any[] = [];

  // Control de vista: 'lista' | 'nuevo' | 'detalle'
  vista: 'lista' | 'nuevo' | 'detalle' = 'lista';
  contratoSeleccionado: any = null;

  // Formulario de nuevo envío
  descripcionInput: string = '';
  archivoSeleccionado: File | null = null;

  // Modales
  mostrarModalEnviar: boolean = false;
  mostrarModalAnular: boolean = false;

  constructor(
    private contratoService: ContratoService,
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
        this.cargarContratos();
      }
    }
  }

  cargarContratos(): void {
    if (!this.alumnoId) return;

    this.contratoService.obtenerContratosAlumno(this.alumnoId).subscribe({
      next: (data: any[]) => {
        this.contratos = data || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar contratos del alumno:', err);
        this.contratos = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ================= NUEVO ENVÍO =================

  abrirNuevo(): void {
    this.descripcionInput = '';
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

  pedirConfirmacionEnviar(): void {
    if (!this.archivoSeleccionado) {
      alert('Debes subir un archivo de contrato antes de enviar.');
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
    formData.append('descripcion', this.descripcionInput || '');
    if (this.archivoSeleccionado) {
      formData.append('contrato', this.archivoSeleccionado, this.archivoSeleccionado.name);
    }

    this.contratoService.enviarContrato(formData).subscribe({
      next: () => {
        this.mostrarModalEnviar = false;
        this.vista = 'lista';
        this.contratos = [];
        this.cargarContratos();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al enviar el contrato:', err);
        alert('Hubo un problema al enviar tu contrato. Intenta de nuevo.');
      }
    });
  }

  // ================= VER DETALLE =================

  abrirDetalle(contrato: any): void {
    this.contratoSeleccionado = contrato;
    this.vista = 'detalle';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.contratoSeleccionado = null;
  }

  estaPendiente(contrato: any): boolean {
    return (contrato?.estado || '').toLowerCase() === 'pendiente';
  }

  // ================= ANULAR ENVÍO =================

  pedirConfirmacionAnular(): void {
    if (!this.estaPendiente(this.contratoSeleccionado)) return;
    this.mostrarModalAnular = true;
  }

  cancelarAnular(): void {
    this.mostrarModalAnular = false;
  }

  confirmarAnular(): void {
    const id = this.contratoSeleccionado?._id || this.contratoSeleccionado?.id;
    if (!id) return;

    this.contratoService.anularContrato(id).subscribe({
      next: () => {
        this.mostrarModalAnular = false;
        this.vista = 'lista';
        this.contratoSeleccionado = null;
        this.contratos = [];
        this.cargarContratos();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al anular el contrato:', err);
        alert('Hubo un problema al anular tu contrato. Intenta de nuevo.');
      }
    });
  }

  urlArchivo(archivo: { nombre: string, url: string } | undefined): string {
    if (!archivo?.url) return '#';
    return `http://localhost:3000${archivo.url}`;
  }
}