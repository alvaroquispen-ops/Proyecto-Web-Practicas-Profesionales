import { Component } from '@angular/core';
import { Router } from '@angular/router'; // 👈 SÁCALO de core y ponlo en su propia línea aquí
import { MiInformacion } from './mi-informacion/mi-informacion';
import { RevisarContrato } from './revisar-contrato/revisar-contrato';
import { EvaluarInformes } from './evaluar-informes/evaluar-informes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profesor',
  imports: [CommonModule,
    MiInformacion,
    RevisarContrato,
    EvaluarInformes],
  templateUrl: './profesor.html',
  styleUrl: './profesor.css',
})
export class ProfesorComponent {
  constructor(private router: Router) {}
  vistaActual: string = 'contrato';

  // Función para cambiar de panel desde el menú de la barra lateral
  cambiarVista(vista: string): void {
    this.vistaActual = vista;
  }
  // 👈 3. Creamos la función que ejecutará el botón
  onLogout(): void {
    // Aquí puedes limpiar tokens o datos de sesión más adelante (ej: localStorage.clear();)
    
    // Redirige automáticamente a la ruta exacta de tu login
    this.router.navigate(['/login']); 
  }
}
