import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private router = inject(Router);
  
  usuarioLogueado: any = null;

  ngOnInit() {
    // 1. Verificar sesión al iniciar la app
    this.verificarSesion();

    // 2. Suscribirse a eventos de navegación para detectar login/registro/logout
    // Esto permite que la barra se actualice automáticamente al cambiar de página
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.verificarSesion();
    });
  }

  verificarSesion() {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (token && usuarioStr) {
      try {
        this.usuarioLogueado = JSON.parse(usuarioStr);
      } catch (e) {
        console.error('Error al leer datos del usuario', e);
        this.usuarioLogueado = null;
      }
    } else {
      this.usuarioLogueado = null;
    }
  }

  logout() {
    // Limpiar todo el almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioDatos'); // Si usaste este nombre en otras partes
    
    this.usuarioLogueado = null;
    
    // Redirigir al inicio o login
    this.router.navigate(['/login']);
  }
}