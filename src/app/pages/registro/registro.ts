import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment/environment'; //

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

  // Este objeto coincide exactamente con RegistroClienteDTO.java del backend
  cliente = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    edad: null,
    direccion: '', // Nota: En Java se llama "direccion"
    referenciaDireccion: ''
  };

  cargando = false;
  mensajeError = '';

  registrar() {
    // 1. Validaciones básicas antes de enviar
    if (!this.cliente.nombre || !this.cliente.email || !this.cliente.password || !this.cliente.direccion || !this.cliente.telefono) {
      this.mensajeError = 'Por favor completa todos los campos obligatorios (*).';
      return;
    }

    if (this.cliente.password.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    // CORRECCIÓN: Usar la URL del environment
    const url = `${environment.apiUrl}/api/web/auth/register`;

    this.http.post<any>(url, this.cliente).subscribe({
      next: (res) => {
        // 2. Si el registro es exitoso, el backend devuelve un AuthResponse con el token
        if (res.token) {
          localStorage.setItem('token', res.token);
          
          // Opcional: Guardar datos básicos del usuario para mostrar en la UI
          const usuarioData = {
            id: res.id,
            nombre: res.nombre,
            rol: res.rol
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioData));
        }

        alert(`¡Registro exitoso! Bienvenido, ${res.nombre}.`);
        
        // 3. Redirigir al menú para que pueda empezar a pedir
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.cargando = false;
        
        // Manejo de errores específicos del backend
        if (err.status === 400) {
           // Si el backend devuelve errores de validación (ej. email duplicado)
           this.mensajeError = err.error?.message || 'Datos inválidos. Verifica que el correo no esté ya registrado.';
        } else {
           this.mensajeError = 'Ocurrió un error al intentar registrarte. Intenta nuevamente.';
        }
      }
    });
  }
}