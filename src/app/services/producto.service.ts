import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz espejo de tu ProductoDTO de Java
export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string; // URL relativa que viene del backend
  categoriaNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  // CAMBIA localhost POR TU URL DE RAILWAY
  private apiUrl = 'https://carpeta-backend-production.up.railway.app/api/productos'; 

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }
}
