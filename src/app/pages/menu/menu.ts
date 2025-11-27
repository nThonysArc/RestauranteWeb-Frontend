import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-menu',
  standalone: true, 
  imports: [RouterModule, CommonModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})

export class Menu {
  comidasPrincipales = [
    { nombre: 'Seco de Res', descripcion: 'Carne de res con salsa criolla y arroz.', precio: 15, imagen: 'imagenes/secoderes.jpg' },
    { nombre: 'Cau Cau', descripcion: 'Guiso de mondongo con papas y especias.', precio: 13, imagen: 'imagenes/cau cau.jpg' },
    { nombre: 'Arroz con Pollo', descripcion: 'Clásico arroz amarillo con pollo jugoso.', precio: 14, imagen: 'imagenes/arroz con pollo.jpg' },
    { nombre: 'Frejoles', descripcion: 'Frejoles guisados acompañados de arroz.', precio: 12, imagen: 'imagenes/frejoles.jpg' },
    { nombre: 'Pollada', descripcion: 'Pollo asado con especias criollas.', precio: 14, imagen: 'imagenes/pollada.jpg' },
    { nombre: 'Chaufa con Broster', descripcion: 'Arroz chaufa con pollo broster y verduras.', precio: 15, imagen: 'imagenes/chaufaconbroaster.jpg' },
    { nombre: 'Chicharrón de Pollo', descripcion: 'Crujientes trozos de pollo frito.', precio: 14, imagen: 'imagenes/chicharrondepollo.jpg' },
    { nombre: 'Carapulcra', descripcion: 'Guiso de papa seca con carne y especias tradicionales.', precio: 16, imagen: 'imagenes/carapulcr.jpg' }
  ];

  platosALaCarta = [
    { nombre: 'Lomo Saltado de Pollo/Res', descripcion: 'Salteado con cebolla, tomate y papas fritas.', precio: 16, imagen: 'imagenes/lomosaltado.jpg' },
    { nombre: 'Tallarin Saltado de Pollo/Res', descripcion: 'Tallarines salteados al estilo criollo.', precio: 17, imagen: 'imagenes/tallarin saltado.jpg' },
    { nombre: 'Pollo al Cilindro', descripcion: 'Pollo al cilindro jugoso con papas doradas.', precio: 24, imagen: 'imagenes/polloalcilindro.jpg' },
    { nombre: 'Chancho al Cilindro', descripcion: 'Chancho al cilindro con sabor único y jugoso.', precio: 28, imagen: 'imagenes/chanchoalcilindro.jpg' }
  ];
}
