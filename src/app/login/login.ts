import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// CORRECCIÓN: Importamos environment
import { environment } from '../environments/environment/environment';

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

    // CORRECCIÓN: Usamos la URL del environment y AÑADIMOS '/api'
    const url = `${environment.apiUrl}/api/web/auth/login`;

    this.http.post<any>(url, this.credenciales)
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          
          const usuarioData = {
            id: res.id,
            nombre: res.nombre,
            rol: res.rol
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioData));
          
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