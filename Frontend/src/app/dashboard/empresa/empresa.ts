import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; 
import { Router } from '@angular/router';
import { EmpresaService } from './empresa.service'; 

// Importaciones de tus subcomponentes independientes
import { MisOfertas } from './mis-ofertas/mis-ofertas';
import { HistorialPostulaciones } from './historial-postulaciones/historial-postulaciones';
import { PublicarOferta } from './publicar-oferta/publicar-oferta';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, MisOfertas, HistorialPostulaciones, PublicarOferta],
  templateUrl: './empresa.html',
  styleUrls: ['./empresa.css']
})
export class EmpresaComponent implements OnInit {
  
  // Control de Vistas internas del Dashboard
  vistaActual: string = 'publicar'; 

  // Modal de éxito de publicación que se dispara desde el HTML padre
  mostrarModalExitoPublicacion: boolean = false;

  // Datos dinámicos de la empresa logueada
  empresaLogueada: any = null;

  // Inyectamos el Router, el EmpresaService y el identificador de plataforma de Angular
  constructor(
    private router: Router, 
    private empresaService: EmpresaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // PROTECCIÓN SSR: Evita que falle el servidor Node.js al buscar 'localStorage'
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuarioLogueado');
      
      if (usuarioSesion) {
        const usuarioParseado = JSON.parse(usuarioSesion);
        
        this.empresaLogueada = {
          id: usuarioParseado._id || usuarioParseado.id,
          nombre: usuarioParseado.nombre,
          rubro: usuarioParseado.rubro || 'Rubro no especificado',
          correo: usuarioParseado.correo
        };
      } else {
        // Redirección si intentan forzar la entrada sin iniciar sesión
        this.router.navigate(['/login']);
      }
    }
  }

  // Función para cambiar de sección mediante el menú lateral
  cambiarVista(vista: string): void {
    this.vistaActual = vista;
  }

  // Acción para cerrar sesión
  onLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado'); // Limpia la sesión en el navegador
      this.router.navigate(['/login']); 
    }
  }
}
