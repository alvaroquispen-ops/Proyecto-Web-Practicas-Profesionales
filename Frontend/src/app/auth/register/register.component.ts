// src/app/auth/register/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  selectedRole: 'Estudiante' | 'Empresa' | 'Profesor' = 'Estudiante';

  // Formulario único que contiene todos los campos necesarios
  registerForm: FormGroup = this.fb.group({
    role: ['Estudiante'],
    // Campos Estudiante / Profesor
    nombres: [''],
    apellidos: [''],
    dni: [''],
    correo: ['', [Validators.required, Validators.email]],
    carrera: [''],
    curso: [''],
    // Solo Estudiante
    genero: [''],
    fechaNacimiento: [''],
    docenteCargo: [''],
    codigoEstudiante: [''],
    // Solo Profesor
    codigoCurso: [''],
    // Solo Empresa
    nombreEmpresa: [''],
    ruc: [''],
    nombreContacto: [''],
    cargo: [''],
    telefono: [''],
    // Seguridad
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  setRole(role: 'Estudiante' | 'Empresa' | 'Profesor') {
    this.selectedRole = role;
    this.registerForm.patchValue({ role: role });
  }

  isCurrentFormValid(): boolean {
    return this.registerForm.valid && 
           (this.registerForm.value.password === this.registerForm.value.confirmPassword);
  }

  onSubmit() {
    if (this.isCurrentFormValid()) {
      console.log('Enviando registro:', this.registerForm.value);
      this.authService.register(this.registerForm.value).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => console.error(err)
      });
    }
  }
}