import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../empresa.service';

@Component({
  selector: 'app-mis-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-ofertas.html',
  styleUrls: ['./mis-ofertas.css']
})
export class MisOfertas implements OnInit {
  empresaId: string = '';
  todasLasOfertas: any[] = [];   
  ofertasFiltradas: any[] = [];  

  // Inputs de búsqueda
  buscarArea: string = '';
  buscarPuesto: string = '';
  buscarModalidad: string = '';

  // Modales
  mostrarModalEliminar: boolean = false;
  mostrarModalEditar: boolean = false; // 🌟 Modal retro "¿Desea guardar cambios?"
  mostrarModalConfirmacion: boolean = false; // 🌟 Modal retro "Cambios guardados correctamente"
  idOfertaSeleccionada: string = '';

  busquedaRealizada: boolean = false;

  // Estados de Vista
  verDetalle: boolean = false;       
  ofertaSeleccionada: any = null;    

  // 🌟 NUEVAS VARIABLES PARA LA EDICIÓN
  enModoEdicion: boolean = false;    // Activa la vista de formulario editable
  ofertaEditada: any = {};          // Copia temporal de la oferta con los cambios del usuario

  constructor(
    private empresaService: EmpresaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuarioLogueado');
      if (usuarioSesion) {
        const usuario = JSON.parse(usuarioSesion);
        this.empresaId = usuario._id || usuario.id;
        this.cargarOfertas();
      }
    }
  }

  cargarOfertas(): void {
    if (!this.empresaId) return;
    this.empresaService.obtenerMisOfertas(this.empresaId).subscribe({
      next: (data) => {
        this.todasLasOfertas = data;
        this.ofertasFiltradas = []; 
        this.busquedaRealizada = false;
      },
      error: (err) => console.error('Error al recuperar ofertas:', err)
    });
  }

  buscarConFiltros(): void {
    this.verDetalle = false; 
    this.enModoEdicion = false; // Cierra edición si se busca de nuevo
    this.busquedaRealizada = true; 

    const areaAFiltrar = this.buscarArea.trim().toLowerCase();
    const puestoAFiltrar = this.buscarPuesto.trim().toLowerCase();
    const modalidadAFiltrar = this.buscarModalidad.toLowerCase();

    this.ofertasFiltradas = this.todasLasOfertas.filter(oferta => {
      const coincideArea = areaAFiltrar === '' || 
        (oferta.area && oferta.area.toLowerCase().includes(areaAFiltrar));
      const campoPuesto = (oferta.puesto || oferta.titulo || '').toLowerCase();
      const coincidePuesto = puestoAFiltrar === '' || campoPuesto.includes(puestoAFiltrar);
      const coincideModalidad = modalidadAFiltrar === '' || 
        (oferta.modalidad && oferta.modalidad.toLowerCase() === modalidadAFiltrar);

      return coincideArea && coincidePuesto && coincideModalidad;
    });
  }

  abrirDetalle(oferta: any): void {
    this.ofertaSeleccionada = oferta;
    this.verDetalle = true; 
    this.enModoEdicion = false;
  }

  volverALista(): void {
    this.verDetalle = false;
    this.enModoEdicion = false;
    this.ofertaSeleccionada = null;
  }

  // 🌟 FUNCIÓN PARA ABRIR LA VISTA DE EDICIÓN
  abrirEditar(oferta: any): void {
    this.verDetalle = false;
    this.enModoEdicion = true;
    // Hacemos una copia profunda (clon) para no alterar la lista original hasta guardar en BD
    this.ofertaEditada = JSON.parse(JSON.stringify(oferta));
  }

  // 🌟 ABRE EL MODAL DE PREGUNTA RETRO
  solicitarGuardarCambios(): void {
    this.mostrarModalEditar = true;
  }

confirmarGuardarCambios(): void {
    const id = this.ofertaEditada._id || this.ofertaEditada.id;
    if (!id) {
      alert('Error: No se encontró el ID de la oferta.');
      return;
    }

    // 1. Cerramos ventanas modales y vistas inmediatamente
    this.mostrarModalEditar = false;
    this.enModoEdicion = false;
    this.verDetalle = false;

    // Actualizamos el objeto seleccionado en memoria con los nuevos datos (ej: Modalidad: Híbrida)
    this.ofertaSeleccionada = { ...this.ofertaEditada };

    // 🌟 REFACTORIZACIÓN CRÍTICA: Actualizamos la lista maestra global
    this.todasLasOfertas = this.todasLasOfertas.map(o => 
      (o._id || o.id) === id ? { ...this.ofertaEditada } : o
    );

    // 🌟 VOLVEMOS A FILTRAR EN TIEMPO REAL:
    // Al ejecutar la búsqueda justo aquí, si el filtro arriba dice "Presencial" 
    // y tu oferta ahora es "Híbrida", se excluirá de inmediato y la pantalla se actualizará sola.
    const areaAFiltrar = this.buscarArea.trim().toLowerCase();
    const puestoAFiltrar = this.buscarPuesto.trim().toLowerCase();
    const modalidadAFiltrar = this.buscarModalidad.toLowerCase();

    this.ofertasFiltradas = this.todasLasOfertas.filter(oferta => {
      const coincideArea = areaAFiltrar === '' || 
        (oferta.area && oferta.area.toLowerCase().includes(areaAFiltrar));
      const campoPuesto = (oferta.puesto || oferta.titulo || '').toLowerCase();
      const coincidePuesto = puestoAFiltrar === '' || campoPuesto.includes(puestoAFiltrar);
      const coincideModalidad = modalidadAFiltrar === '' || 
        (oferta.modalidad && oferta.modalidad.toLowerCase() === modalidadAFiltrar);

      return coincideArea && coincidePuesto && coincideModalidad;
    });

    // Marcamos que la búsqueda sigue activa para que el HTML evalúe si el arreglo quedó en 0
    this.busquedaRealizada = true;

    // Formateamos las fechas para el envío al servidor
    const datosEnviar = {
      ...this.ofertaEditada,
      fechaInicio: this.ofertaEditada.fechaInicio ? new Date(this.ofertaEditada.fechaInicio) : null,
      fechaFin: this.ofertaEditada.fechaFin ? new Date(this.ofertaEditada.fechaFin) : null
    };

    // 2. Guardamos en MongoDB Atlas en segundo plano
    this.empresaService.actualizarOferta(id, datosEnviar).subscribe({
      next: (response) => {
        console.log('Guardado exitoso en MongoDB:', response);
        // Mantenemos la persistencia sincronizando desde el servidor por detrás
        this.empresaService.obtenerMisOfertas(this.empresaId).subscribe(data => {
          this.todasLasOfertas = data;
        });
      },
      error: (err) => {
        if (err.status === 200 || err.statusText === 'OK' || (err.error && err.error.text === 'OK')) {
          console.log('Guardado exitoso (texto plano).');
        } else {
          console.error('Error real en MongoDB:', err);
          alert('Hubo un error real al guardar los cambios en el servidor.');
          this.cargarOfertas();
        }
      }
    });
  }

  // 🌟 CIERRA TODO Y TE DEVUELVE A LA LISTA LIMPIA CON LOS CAMBIOS HECHOS
  finalizarFlujoEdicion(): void {
    this.mostrarModalConfirmacion = false;
    this.enModoEdicion = false;
    this.cargarOfertas(); // Recarga desde MongoDB para reflejar los cambios
  }

  solicitarEliminar(id: string): void {
    this.idOfertaSeleccionada = id;
    this.mostrarModalEliminar = true;
  }

 confirmarEliminar(): void {
    if (!this.idOfertaSeleccionada) return;

    const idBorrar = this.idOfertaSeleccionada;

    // 1. Cerramos las pantallas y modales de inmediato
    this.mostrarModalEliminar = false;
    this.enModoEdicion = false;
    this.verDetalle = false;

    // 🔥 EL TRUCO DEFINITIVO: Eliminamos la tarjeta de la interfaz LOCAL instantáneamente
    // Filtramos los arreglos para remover la oferta borrada sin esperar la recarga
    this.todasLasOfertas = this.todasLasOfertas.filter(o => (o._id || o.id) !== idBorrar);
    this.ofertasFiltradas = this.ofertasFiltradas.filter(o => (o._id || o.id) !== idBorrar);

    // 2. Ejecutamos la petición hacia MongoDB en segundo plano
    this.empresaService.eliminarOferta(idBorrar).subscribe({
      next: (response) => {
        console.log('Oferta eliminada con éxito de MongoDB:', response);
        // Volvemos a sincronizar por si acaso
        this.cargarOfertas(); 
      },
      error: (err) => {
        // Contingencia por respuestas de texto plano "OK"
        if (err.status === 200 || err.statusText === 'OK' || (err.error && err.error.text === 'OK')) {
          console.log('Eliminación confirmada en segundo plano.');
        } else {
          console.error('Error real al eliminar de MongoDB:', err);
          alert('Hubo un error real en el servidor al intentar eliminar.');
          // Si hubo un error real, recargamos para que vuelva a aparecer la tarjeta
          this.cargarOfertas();
        }
      }
    });
  }
}