import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratoService } from '../../empresa/contrato.service';

@Component({
  selector: 'app-revisar-contrato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revisar-contrato.html',
  styleUrl: './revisar-contrato.css',
})
export class RevisarContrato implements OnInit {
  docenteNombre: string = '';

  contratos: any[] = [];
  contratosFiltrados: any[] = [];

  // Filtro
  inputEstado: string = '';
  filtroPendiente: boolean = false;

  // Control de vista: 'lista' | 'revision'
  vista: 'lista' | 'revision' = 'lista';
  contratoSeleccionado: any = null;

  // Formulario de evaluación
  estadoInput: string = '';
  observacionInput: string = '';

  mostrarModalEnviar: boolean = false;

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
        this.docenteNombre = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();
        this.cargarContratos();
      }
    }
  }

  cargarContratos(): void {
    if (!this.docenteNombre) return;

    this.contratoService.obtenerContratosDocente(this.docenteNombre).subscribe({
      next: (data: any[]) => {
        this.contratos = data || [];
        this.contratosFiltrados = [...this.contratos];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar contratos del docente:', err);
        this.contratos = [];
        this.contratosFiltrados = [];
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
      this.contratosFiltrados = [...this.contratos];
      return;
    }

    this.contratosFiltrados = this.contratos.filter(c => (c.estado || '').toLowerCase() === estadoAFiltrar);
  }

  // ================= VISTA DE REVISIÓN =================

  fueEvaluado(contrato: any): boolean {
    return (contrato?.estado || '').toLowerCase() !== 'pendiente';
  }

  abrirRevision(contrato: any): void {
    this.contratoSeleccionado = contrato;
    // Si ya fue evaluado, precargamos lo que el docente había puesto (modo "Editar")
    this.estadoInput = this.fueEvaluado(contrato) ? contrato.estado : '';
    this.observacionInput = contrato.observacion || '';
    this.vista = 'revision';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.contratoSeleccionado = null;
  }

  verArchivo(): void {
    if (!this.contratoSeleccionado?.archivo?.url) return;
    const url = `http://localhost:3000${this.contratoSeleccionado.archivo.url}`;
    window.open(url, '_blank');
  }

  pedirConfirmacionEnviar(): void {
    if (!this.estadoInput) {
      alert('Selecciona un estado (Aceptado o Rechazado) antes de enviar.');
      return;
    }
    this.mostrarModalEnviar = true;
  }

  cancelarEnviar(): void {
    this.mostrarModalEnviar = false;
  }

  confirmarEnviar(): void {
    const id = this.contratoSeleccionado?._id || this.contratoSeleccionado?.id;
    if (!id) return;

    this.contratoService.evaluarContrato(id, this.estadoInput as 'aceptado' | 'rechazado', this.observacionInput).subscribe({
      next: () => {
        this.mostrarModalEnviar = false;
        this.vista = 'lista';
        this.contratoSeleccionado = null;
        this.contratos = [];
        this.contratosFiltrados = [];
        this.cargarContratos();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al enviar la revisión del contrato:', err);
        alert('Hubo un problema al enviar la revisión. Intenta de nuevo.');
      }
    });
  }
}