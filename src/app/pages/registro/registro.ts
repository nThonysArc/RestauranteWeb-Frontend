// Archivo: src/app/pages/registro/registro.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class Registro {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Modelo que coincide con el DTO del backend
  cliente = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    edad: null,
    direccion: '',
    referenciaDireccion: ''
  };

  cargando = false;
  mensajeError = '';

  registrar() {
    // Validaciones básicas
    if (!this.cliente.nombre || !this.cliente.email || !this.cliente.password || !this.cliente.direccion) {
      this.mensajeError = 'Por favor completa los campos obligatorios.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const url = 'http://localhost:8080/api/web/auth/register';

    this.http.post<any>(url, this.cliente).subscribe({
      next: (res) => {
        // El backend devuelve el token (AuthResponse) al registrarse exitosamente
        localStorage.setItem('token', res.token);
        // Guardamos datos básicos del usuario para usarlos en el Delivery
        localStorage.setItem('usuarioDatos', JSON.stringify({
          nombre: res.nombre,
          id: res.id,
          // Nota: El endpoint de login/registro actual devuelve ID, Nombre y Rol.
          // Si necesitas guardar direccion/telefono en localStorage, deberías agregarlos al AuthResponse del backend
          // O hacer una petición extra para obtener el perfil ("api/web/perfil").
        }));

        alert('¡Registro exitoso! Bienvenido a Raíz Iqueña.');
        this.router.navigate(['/menu']); // Redirigir al menú o delivery
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = err.error?.message || 'Error al registrar usuario.';
        this.cargando = false;
      }
    });
  }
}