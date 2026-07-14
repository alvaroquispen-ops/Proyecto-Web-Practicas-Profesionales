import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 👈 SÁCALO de core y ponlo en su propia línea aquí
import { OfertasPracticas } from './ofertas-practicas/ofertas-practicas';
import { MisPostulaciones } from './mis-postulaciones/mis-postulaciones';
import { MiInformacion } from './mi-informacion/mi-informacion';
import { AdjuntarContrato } from './adjuntar-contrato/adjuntar-contrato';
import { MisInformes } from './mis-informes/mis-informes';

@Component({
  selector: 'app-estudiante',
  imports: [CommonModule, 
    OfertasPracticas, 
    MisPostulaciones, 
    MiInformacion, 
    AdjuntarContrato, 
    MisInformes],
  templateUrl: './estudiante.html',
  styleUrl: './estudiante.css',
})
export class EstudianteComponent {


vistaActual: string = 'ofertas'; 

  // Función que se ejecuta al hacer click en los botones del menú lateral
  cambiarVista(vista: string): void {
    this.vistaActual = vista;
  }

  constructor(private router: Router) {}

  // 👈 3. Creamos la función que ejecutará el botón
  onLogout(): void {
    // Aquí puedes limpiar tokens o datos de sesión más adelante (ej: localStorage.clear();)
    
    // Redirige automáticamente a la ruta exacta de tu login
    this.router.navigate(['/login']); 
  }
}
