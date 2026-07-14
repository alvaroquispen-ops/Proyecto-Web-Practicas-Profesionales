import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../empresa/empresa.service';
import { PostulacionService } from '../../empresa/postulacion.service';

@Component({
  selector: 'app-ofertas-practicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ofertas-practicas.html',
  styleUrl: './ofertas-practicas.css',
})
export class OfertasPracticas implements OnInit {
  alumnoId: string = '';
  todasLasOfertas: any[] = [];
  ofertasFiltradas: any[] = [];

  // Variables Espejo para los Inputs del HTML
  inputArea: string = '';
  inputPuesto: string = '';
  inputModalidad: string = '';

  // Variables de control de Filtros
  buscarArea: string = '';
  buscarPuesto: string = '';
  buscarModalidad: string = '';
  busquedaRealizada: boolean = false;
  filtroPendiente: boolean = false;

  // Control de Vistas Unificado (1: Buscador/Lista, 2: Detalle, 3: Formulario Extendido)
  pasoVista: number = 1;   
  ofertaSeleccionada: any = null;

  // Campos del Formulario Extendido (Sin Teléfono)
  nombreInput: string = '';
  apellidoInput: string = '';
  generoInput: string = '';
  fechaNacimientoInput: string = '';
  dniInput: string = '';
  correoInput: string = '';
  carreraInput: string = '';

  // Control de Múltiples Archivos Adjuntos (Hasta 3)
  archivosSeleccionados: { archivo: File, nombre: string }[] = [];

  constructor(
    private empresaService: EmpresaService,
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
        
        // Autocompletado desde MongoDB Atlas (Sesión local)
        this.nombreInput = usuario.nombre || usuario.nombres || '';
        this.apellidoInput = usuario.apellido || usuario.apellidos || '';
        this.dniInput = usuario.dni || '';
        this.correoInput = usuario.correo || usuario.correoInstitucional || '';
        this.carreraInput = usuario.carrera || '';
        this.generoInput = usuario.genero || '';
        this.fechaNacimientoInput = usuario.fechaNacimiento || '';
      }
      this.cargarOfertasGlobales();
    }
  }

  cargarOfertasGlobales(): void {
    if (this.todasLasOfertas && this.todasLasOfertas.length > 0) {
      return; 
    }

    this.empresaService.obtenerTodasLasOfertasGlobales().subscribe({
      next: (data: any) => {
        this.todasLasOfertas = data || [];
        if (this.busquedaRealizada) {
          this.buscarConFiltros();
        } else {
          this.ofertasFiltradas = [...this.todasLasOfertas];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR AL CONECTAR AL BACKEND:', err);
      }
    });
  }

  onFiltroChange(): void {
    this.filtroPendiente = true;
  }

  buscarConFiltros(): void {
    this.pasoVista = 1;
    this.busquedaRealizada = true; 
    this.filtroPendiente = false;

    this.buscarArea = (this.inputArea || '').trim();
    this.buscarPuesto = (this.inputPuesto || '').trim();
    this.buscarModalidad = (this.inputModalidad || '').trim();

    const areaAFiltrar = this.buscarArea.toLowerCase();
    const puestoAFiltrar = this.buscarPuesto.toLowerCase();
    const modalidadAFiltrar = this.buscarModalidad.toLowerCase();

    const esModalidadGlobal = modalidadAFiltrar === 'todas' || modalidadAFiltrar === '';

    if (areaAFiltrar === '' && puestoAFiltrar === '' && esModalidadGlobal) {
      this.ofertasFiltradas = [...this.todasLasOfertas];
      return;
    }

    this.ofertasFiltradas = this.todasLasOfertas.filter(oferta => {
      const coincideArea = areaAFiltrar === '' || (oferta.area && oferta.area.toLowerCase().includes(areaAFiltrar));
      const campoPuesto = (oferta.puesto || oferta.titulo || '').toLowerCase();
      const coincidePuesto = puestoAFiltrar === '' || campoPuesto.includes(puestoAFiltrar);
      
      let coincideModalidad = false;
      if (esModalidadGlobal) {
        coincideModalidad = true;
      } else {
        const modBaseDatos = (oferta.modalidad || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const modBuscador = modalidadAFiltrar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        coincideModalidad = modBaseDatos.substring(0, 5).includes(modBuscador.substring(0, 5));
      }
      return coincideArea && coincidePuesto && coincideModalidad;
    });
  }

  abrirDetalle(oferta: any): void {
    this.ofertaSeleccionada = oferta;
    this.pasoVista = 2;
  }

  abrirFormularioPostulacion(): void {
    this.pasoVista = 3;
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuarioLogueado');
      if (usuarioSesion) {
        const usuario = JSON.parse(usuarioSesion);
        this.nombreInput = usuario.nombre || usuario.nombres || this.nombreInput;
        this.apellidoInput = usuario.apellido || usuario.apellidos || this.apellidoInput;
        this.dniInput = usuario.dni || this.dniInput;
        this.correoInput = usuario.correo || usuario.correoInstitucional || this.correoInput;
        this.carreraInput = usuario.carrera || this.carreraInput;
        this.generoInput = usuario.genero || this.generoInput;
        this.fechaNacimientoInput = usuario.fechaNacimiento || this.fechaNacimientoInput;
      }
    }
  }

  // Captura y acumula hasta un máximo de 3 archivos
  onArchivoSeleccionado(event: any): void {
    const archivosLista = event.target.files;
    
    for (let i = 0; i < archivosLista.length; i++) {
      if (this.archivosSeleccionados.length >= 3) {
        alert('Solo puedes adjuntar un máximo de 3 archivos.');
        break;
      }
      
      const archivo = archivosLista[i];
      // Evitamos duplicar el mismo archivo si lo vuelven a subir
      const yaExiste = this.archivosSeleccionados.some(a => a.nombre === archivo.name);
      if (!yaExiste) {
        this.archivosSeleccionados.push({
          archivo: archivo,
          nombre: archivo.name
        });
      }
    }
    // Reseteamos el valor del input por si desean borrar y volver a subir el mismo archivo
    event.target.value = '';
  }

  // Eliminar un archivo individual de la lista
  eliminarArchivo(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
  }

  enviarFormulario(): void {
    if (!this.nombreInput || !this.apellidoInput) {
      alert('Por favor, ingrese al menos su Nombre y Apellido.');
      return;
    }

    const quierePostular = confirm('¿Quieres enviar tu postulación?');
    if (!quierePostular) {
      return;
    }

    const nombresDocumentos = this.archivosSeleccionados.map(a => a.nombre);
    const nombreCompleto = `${this.nombreInput.trim()} ${this.apellidoInput.trim()}`;

    // CAMBIO: en vez de mandar un objeto JSON, armamos un FormData con los
    // campos de texto + los archivos reales, para que el backend los guarde
    // de verdad en el servidor (antes solo se mandaba el nombre del archivo).
    const formData = new FormData();
    formData.append('ofertaId', this.ofertaSeleccionada?._id || this.ofertaSeleccionada?.id || '');
    formData.append('alumnoId', this.alumnoId || 'ALUMNO_ANONIMO');
    formData.append('nombreAlumno', nombreCompleto);
    formData.append('nombres', this.nombreInput);
    formData.append('apellidos', this.apellidoInput);
    formData.append('genero', this.generoInput || 'No especificado');
    formData.append('fechaNacimiento', this.fechaNacimientoInput || '');
    formData.append('dni', this.dniInput || '00000000');
    formData.append('correoInstitucional', this.correoInput || '');
    formData.append('carrera', this.carreraInput || 'General');
    formData.append('puesto', this.ofertaSeleccionada?.puesto || this.ofertaSeleccionada?.titulo || 'Puesto de Prácticas');
    formData.append('empresa', this.ofertaSeleccionada?.empresa || this.ofertaSeleccionada?.titulo || 'Empresa Privada');
    formData.append('modalidad', this.ofertaSeleccionada?.modalidad || '');
    formData.append('area', this.ofertaSeleccionada?.area || '');

    // Adjuntamos los archivos reales bajo el mismo nombre de campo ('documentos')
    // que espera multer en el backend (upload.array('documentos', 3)).
    this.archivosSeleccionados.forEach(item => {
      formData.append('documentos', item.archivo, item.nombre);
    });

    this.postulacionService.registrarPostulacion(formData).subscribe({
      next: (res: any) => {
        alert('¡Postulación enviada con éxito! Ya se encuentra en el historial de la empresa.');

        // FIX: forzamos manualmente la detección de cambios de Angular.
        // Si el proyecto corre en modo zoneless (o el callback async
        // queda fuera del ciclo de Angular), esto garantiza que la
        // vista se repinte de inmediato sin necesitar un clic extra.
        this.limpiarFormulario();
        this.pasoVista = 1;
        this.todasLasOfertas = [];
        this.cdr.detectChanges();

        this.cargarOfertasGlobales();
      },
      error: (err: any) => {
        console.error('Error detallado de respuesta:', err);
        alert('Hubo un problema al procesar el envío.');
      }
    });
  }
  limpiarFormulario(): void {
    this.nombreInput = '';
    this.apellidoInput = '';
    this.generoInput = '';
    this.fechaNacimientoInput = '';
    this.dniInput = '';
    this.correoInput = '';
    this.carreraInput = '';
    this.archivosSeleccionados = [];
    this.ofertaSeleccionada = null;
  }
}