import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostulacionService } from '../../empresa/postulacion.service'; 

@Component({
  selector: 'app-mis-postulaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-postulaciones.html',
  styleUrl: './mis-postulaciones.css'
})
export class MisPostulaciones implements OnInit {
  alumnoId: string = '';
  misPostulaciones: any[] = [];
  misPostulacionesFiltradas: any[] = [];

  // Variables espejo de los inputs de filtro
  inputEmpresa: string = '';
  inputPuesto: string = '';

  // Se activa al tocar cualquier filtro sin haber presionado "Buscar" todavía
  filtroPendiente: boolean = false;

  // Control de vista: 1 = lista de postulaciones, 2 = detalle de una postulación
  pasoVista: number = 1;
  postulacionSeleccionada: any = null;
  mostrarModalEliminar: boolean = false;

  // Ícono de respaldo generado localmente (SVG en base64), ya que
  // via.placeholder.com dejó de responder (net::ERR_CONNECTION_CLOSED).
  logoPorDefecto: string = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect width="40" height="40" rx="6" fill="#0c46b4"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">CORP</text>
    </svg>
  `);

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
        this.alumnoId = usuario._id || usuario.id;
        this.cargarHistorialPostulaciones();
      }
    }
  }

  cargarHistorialPostulaciones(): void {
    if (!this.alumnoId) {
      console.warn("No hay un alumnoId válido en la sesión.");
      return;
    }

    this.postulacionService.obtenerPostulacionesAlumno(this.alumnoId).subscribe({
      next: (data: any[]) => {
        this.misPostulaciones = (data || []).map(postulacion => ({
          ...postulacion,
          puesto: postulacion.puesto || (postulacion.ofertaId?.puesto || postulacion.ofertaId?.titulo) || 'Puesto de Prácticas',
          empresa: postulacion.empresa || (postulacion.ofertaId?.empresa || 'Empresa'),
          logo: postulacion.logo || this.logoPorDefecto,
          estado: postulacion.estado ? postulacion.estado.toUpperCase() : 'PENDIENTE'
        }));

        this.misPostulacionesFiltradas = [...this.misPostulaciones];

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al traer postulaciones del alumno:', err);
        this.misPostulaciones = []; 
        this.misPostulacionesFiltradas = [];
        this.cdr.detectChanges();
      }
    });
  }

  onFiltroChange(): void {
    this.filtroPendiente = true;
  }

  buscarConFiltros(): void {
    this.filtroPendiente = false;

    const empresaAFiltrar = (this.inputEmpresa || '').trim().toLowerCase();
    const puestoAFiltrar = (this.inputPuesto || '').trim().toLowerCase();

    if (empresaAFiltrar === '' && puestoAFiltrar === '') {
      this.misPostulacionesFiltradas = [...this.misPostulaciones];
      return;
    }

    this.misPostulacionesFiltradas = this.misPostulaciones.filter(post => {
      const coincideEmpresa = empresaAFiltrar === '' ||
        (post.empresa && post.empresa.toLowerCase().includes(empresaAFiltrar));

      const coincidePuesto = puestoAFiltrar === '' ||
        (post.puesto && post.puesto.toLowerCase().includes(puestoAFiltrar));

      return coincideEmpresa && coincidePuesto;
    });
  }

  // ================= VISTA DE DETALLE =================

  abrirDetalle(post: any): void {
    this.postulacionSeleccionada = post;
    this.pasoVista = 2;
  }

  volverALaLista(): void {
    this.pasoVista = 1;
    this.postulacionSeleccionada = null;
  }

  estaPendiente(post: any): boolean {
    return (post?.estado || '').toUpperCase() === 'PENDIENTE';
  }

  // ================= ELIMINAR POSTULACIÓN =================

  pedirConfirmacionEliminar(): void {
    if (!this.estaPendiente(this.postulacionSeleccionada)) {
      return; // seguro extra: solo se puede eliminar si está pendiente
    }
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
  }

  confirmarEliminar(): void {
    const id = this.postulacionSeleccionada?._id || this.postulacionSeleccionada?.id;
    if (!id) return;

    this.postulacionService.eliminarPostulacion(id).subscribe({
      next: () => {
        this.mostrarModalEliminar = false;
        this.pasoVista = 1;
        this.postulacionSeleccionada = null;

        // Refrescamos la lista para que la postulación eliminada ya no aparezca
        this.misPostulaciones = [];
        this.misPostulacionesFiltradas = [];
        this.cargarHistorialPostulaciones();

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al eliminar la postulación:', err);
        alert('Hubo un problema al eliminar la postulación. Intenta de nuevo.');
      }
    });
  }
}