import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html'
})
export class PerfilComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  cliente: any = {};
  cargando = true;
  guardando = false;

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
      this.router.navigate(['/login']);
      return;
    }
    const user = JSON.parse(usuarioStr);

    // Obtener datos actuales
    this.http.get(`http://localhost:8080/api/web/cliente/${user.id}`).subscribe({
      next: (res) => {
        this.cliente = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  guardarCambios() {
    this.guardando = true;
    // Enviamos el objeto cliente tal cual al endpoint PUT
    // Adaptamos campos si el backend espera nombres distintos, pero en ClienteWebService hicimos match
    const dto = {
        nombre: this.cliente.nombre,
        apellidos: this.cliente.apellidos,
        email: this.cliente.email,
        telefono: this.cliente.telefono,
        direccion: this.cliente.direccionPrincipal, // Ojo con el nombre del campo en el DTO del backend
        referenciaDireccion: this.cliente.referenciaDireccion,
        edad: this.cliente.edad,
        password: '' // No enviamos password si no se cambia
    };

    this.http.put(`http://localhost:8080/api/web/cliente/${this.cliente.idClienteWeb}`, dto).subscribe({
      next: (res) => {
        alert('Datos actualizados correctamente');
        this.guardando = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar perfil');
        this.guardando = false;
      }
    });
  }
}