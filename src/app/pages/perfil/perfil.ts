import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment/environment'; //

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

    // Obtener datos actuales desde el backend en Railway
    this.http.get(`${environment.apiUrl}/api/web/cliente/${user.id}`).subscribe({
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
    const dto = {
        nombre: this.cliente.nombre,
        apellidos: this.cliente.apellidos,
        email: this.cliente.email,
        telefono: this.cliente.telefono,
        direccion: this.cliente.direccionPrincipal, 
        referenciaDireccion: this.cliente.referenciaDireccion,
        edad: this.cliente.edad,
        password: '' // No enviamos password si no se cambia
    };

    // Actualizar datos en Railway
    this.http.put(`${environment.apiUrl}/api/web/cliente/${this.cliente.idClienteWeb}`, dto).subscribe({
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