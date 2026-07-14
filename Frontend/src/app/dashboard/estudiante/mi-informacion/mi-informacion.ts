import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-mi-informacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-informacion.html',
  styleUrl: './mi-informacion.css',
})
export class MiInformacion implements OnInit {
  nombreCompleto: string = '';
  correo: string = '';
  dni: string = '';
  genero: string = '';
  fechaNacimiento: string = '';
  carrera: string = '';
  curso: string = '';
  docenteACargo: string = '';
  codigoEstudiante: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuarioLogueado');
      if (usuarioSesion) {
        const usuario = JSON.parse(usuarioSesion);
        this.nombreCompleto = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();
        this.correo = usuario.correoInstitucional || usuario.email || '';
        this.dni = usuario.dni || '';
        this.genero = usuario.genero === 'M' ? 'Masculino' : usuario.genero === 'F' ? 'Femenino' : (usuario.genero || '');
        this.fechaNacimiento = usuario.fechaNacimiento || '';
        this.carrera = usuario.carrera || '';
        this.curso = usuario.curso || '';
        this.docenteACargo = usuario.docenteACargo || '';
        this.codigoEstudiante = usuario.codigoEstudiante || '';
      }
    }
  }
}