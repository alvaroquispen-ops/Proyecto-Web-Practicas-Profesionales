import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core'; // 👈 1. Importamos ChangeDetectorRef
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../empresa.service'; 

@Component({
  selector: 'app-publicar-oferta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicar-oferta.html',
  styleUrls: ['./publicar-oferta.css']
})
export class PublicarOferta implements OnInit {
  empresaId: string = '';
  
  nuevaOferta: any = {
    titulo: '',
    distrito: '',
    area: '',
    puesto: '',
    fechaInicio: '',
    fechaFin: '',
    modalidad: '',
    descripcion: '',
    habilidades: '',
    contacto: '',
    estado: 'Activo'
  };

  constructor(
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef, // 👈 2. Inyectamos el detector de cambios manualmente
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuarioLogueado');
      if (usuarioSesion) {
        const usuario = JSON.parse(usuarioSesion);
        this.empresaId = usuario._id || usuario.id;
      }
    }
  }

  publicar(): void {
    if (!this.empresaId) return;

    // 1. VALIDACIÓN estricta antes de enviar al servidor
    if (
      !this.nuevaOferta.titulo?.trim() ||
      !this.nuevaOferta.distrito?.trim() ||
      !this.nuevaOferta.area?.trim() ||
      !this.nuevaOferta.puesto?.trim() ||
      !this.nuevaOferta.fechaInicio ||
      !this.nuevaOferta.fechaFin ||
      !this.nuevaOferta.modalidad?.trim() ||
      !this.nuevaOferta.descripcion?.trim() ||
      !this.nuevaOferta.contacto?.trim()
    ) {
      alert('⚠️ Por favor, debe completar todos los campos antes de publicar la oferta.');
      return;
    }

    const datosOferta = {
      ...this.nuevaOferta,
      empresaId: this.empresaId,
      fechaPublicacion: new Date()
    };

    this.empresaService.publicarOferta(datosOferta).subscribe({
      next: (res) => {
        // El alert detiene el hilo del navegador
        alert('¡Oferta Publicada con Éxito!'); 
        
        // 3. Limpiamos las variables del objeto inmediatamente
        this.nuevaOferta = {
          titulo: '',
          distrito: '',
          area: '',
          puesto: '',
          fechaInicio: '',
          fechaFin: '',
          modalidad: '',
          descripcion: '',
          habilidades: '',
          contacto: '',
          estado: 'Activo'
        };

        // 🌟 EL TRUCO MAESTRO: Forzamos a Angular a escanear el objeto y actualizar la pantalla al instante
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al publicar:', err);
        alert('Hubo un error al guardar la oferta en el servidor.');
      }
    });
  }
}