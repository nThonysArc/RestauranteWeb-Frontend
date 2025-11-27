import { Component, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router'
import * as L from 'leaflet';

@Component({
  selector: 'app-sobre-nosotros',
  imports: [RouterModule],
  templateUrl: './sobre-nosotros.html',
  styleUrls: ['./sobre-nosotros.scss']   
})
export class SobreNosotros implements AfterViewInit {
  ngAfterViewInit(): void {
    const map = L.map('map').setView([-14.067011976776257, -75.73624289313076], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([-14.067011976776257, -75.73624289313076]).addTo(map)
      .bindPopup('📍 Restaurante - Prol. Fermín Tanguis 250, Urb. San Miguel, Ica')
      .openPopup();

  
  }
}
