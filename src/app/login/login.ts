import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styles: [`
    .login-container { min-height: 80vh; background-color: #fff7ee; }
    .titulo-login { font-family: 'Playfair Display', serif; color: #d67a0a; font-weight: bold; }
    .btn-naranja { background-color: #f38b0b; color: white; border: none; font-weight: bold; }
    .btn-naranja:hover { background-color: #e07b00; }
  `]
})
export class Login {
  private http = inject(HttpClient);
  private router = inject(Router);

  credenciales = {
    email: '',
    password: ''
  };

  cargando = false;
  errorLogin = false;
  mensajeError = '';

  login() {
    this.cargando = true;
    this.errorLogin = false;

    // Conectar con tu backend real
    this.http.post<any>('http://localhost:8080/api/web/auth/login', this.credenciales)
      .subscribe({
        next: (res) => {
          // 1. Guardar el token
          localStorage.setItem('token', res.token);
          
          // 2. ¡CORRECCIÓN IMPORTANTE! Guardar datos del usuario
          // El backend devuelve: { token, id, nombre, rol }
          const usuarioData = {
            id: res.id,
            nombre: res.nombre,
            rol: res.rol
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioData));
          
          // 3. Redirigir al menú
          this.router.navigate(['/menu']);
        },
        error: (err) => {
          console.error(err);
          this.errorLogin = true;
          this.mensajeError = 'Credenciales incorrectas o error en el servidor.';
          this.cargando = false;
        }
      });
  }
}