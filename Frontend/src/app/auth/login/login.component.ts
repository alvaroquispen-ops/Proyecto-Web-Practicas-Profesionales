// src/app/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Define el formulario reactivo
  loginForm: FormGroup = this.fb.group({
    userType: ['Alumno', Validators.required], // Valor por defecto
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Métodos para cambiar el tipo de usuario (los botones de arriba)
  setUserType(type: string) {
    this.loginForm.patchValue({ userType: type });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password, userType } = this.loginForm.value;

      // 1. Mapeamos el rol removiendo espacios por seguridad
      let rolMapeado = userType.trim().toLowerCase();
      if (rolMapeado === 'alumno') {
        rolMapeado = 'estudiante';
      } else if (rolMapeado === 'docente') {
        rolMapeado = 'profesor';
      }

      // 2. Usamos .trim() para eliminar cualquier espacio accidental al inicio o final
      const credenciales = {
        email: username.trim(),
        contrasena: password.trim(), 
        rol: rolMapeado
      };

      console.log('Enviando credenciales 100% limpias:', credenciales);

      this.authService.login(credenciales).subscribe({
        next: (response) => {
          console.log('¡Login exitoso!', response);
          
          // 🌟 CORRECCIÓN: Guardamos los datos del usuario en el navegador para que el dashboard no rebote al Login
          localStorage.setItem('usuarioLogueado', JSON.stringify(response.usuario));

          alert('¡Bienvenido! Inició sesión exitosamente.');

          // Extraemos el rol que viene directamente de tu MongoDB Atlas
          const rolUsuario = response.usuario.rol; 

          // Redireccionamiento inteligente según el rol detectado
          if (rolUsuario === 'estudiante') {
            this.router.navigateByUrl('/dashboard/estudiante'); // Muestra interfaz CUS-05
          } else if (rolUsuario === 'profesor') {
            this.router.navigateByUrl('/dashboard/profesor');   // Muestra interfaz CUS-09
          } else if (rolUsuario === 'empresa') {
            this.router.navigateByUrl('/dashboard/empresa');    // Muestra interfaz CUS-03
          } else {
            // Caso de emergencia por si hay un rol no registrado
            alert('Rol no reconocido en el sistema.');
            this.router.navigateByUrl('/login');
          }
        },
        error: (err) => {
          console.error('Error de login recibido:', err);
          alert('Error al iniciar sesión: ' + (err.error?.msg || 'Credenciales incorrectas'));
        }
      });

    } else {
      this.loginForm.markAllAsTouched(); 
    }
  }
}