import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // Guardar token al hacer login
  login(token: string) {
    localStorage.setItem('token', token);
  }

  // Borrar token al salir
  logout() {
    localStorage.removeItem('token');
  }

  // Verificar si está logueado
  estaLogueado(): boolean {
    const token = localStorage.getItem('token');
    // Aquí podrías agregar lógica para verificar si el token expiró
    return !!token; 
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }
}