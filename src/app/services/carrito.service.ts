import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from './producto.service';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  observaciones: string;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // BehaviorSubject permite a los componentes suscribirse a los cambios en tiempo real
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    // Al iniciar, intentamos recuperar el carrito del localStorage
    if (typeof localStorage !== 'undefined') {
      const guardado = localStorage.getItem('carrito');
      if (guardado) {
        try {
          this.itemsSubject.next(JSON.parse(guardado));
        } catch (e) {
          console.error('Error al cargar el carrito', e);
          localStorage.removeItem('carrito');
        }
      }
    }
  }

  agregarProducto(producto: Producto, cantidad: number = 1, observaciones: string = '') {
    const itemsActuales = this.itemsSubject.value;
    
    // Verificar si el producto ya existe en el carrito
    const itemExistente = itemsActuales.find(item => item.producto.idProducto === producto.idProducto);

    if (itemExistente) {
      // Si existe, aumentamos la cantidad
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
      // Concatenar observaciones si son diferentes
      if (observaciones && !itemExistente.observaciones.includes(observaciones)) {
        itemExistente.observaciones += `, ${observaciones}`;
      }
    } else {
      // Si no existe, lo agregamos nuevo
      itemsActuales.push({
        producto: producto,
        cantidad: cantidad,
        observaciones: observaciones,
        subtotal: cantidad * producto.precio
      });
    }

    this.actualizarEstado(itemsActuales);
  }

  eliminarProducto(idProducto: number) {
    const itemsFiltrados = this.itemsSubject.value.filter(item => item.producto.idProducto !== idProducto);
    this.actualizarEstado(itemsFiltrados);
  }

  limpiarCarrito() {
    this.actualizarEstado([]);
  }

  obtenerTotal(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.subtotal, 0);
  }

  obtenerCantidadItems(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.cantidad, 0);
  }

  private actualizarEstado(items: ItemCarrito[]) {
    this.itemsSubject.next(items);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('carrito', JSON.stringify(items));
    }
  }
}