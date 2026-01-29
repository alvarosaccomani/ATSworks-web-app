import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import maplibregl, { Map, Marker } from 'maplibre-gl';

interface Cliente {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-map-works',
  imports: [],
  templateUrl: './map-works.component.html',
  styleUrl: './map-works.component.scss'
})
export class MapWorksComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapContainer!: ElementRef;

  map!: Map;
  clientes: Cliente[] = [
    { id: '1', nombre: 'Cliente A', lat: -34.6037, lng: -58.3816 },
    { id: '2', nombre: 'Cliente B', lat: -34.6175, lng: -58.3633 },
    // Agrega tus clientes reales aquí
  ];

  private markers: Marker[] = [];

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  public initializeMap(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json', // Puedes usar tu propio estilo
      center: [-58.3816, -34.6037], // Buenos Aires como ejemplo
      zoom: 11
    });

    this.map.on('load', () => {
      this.addMarkers();
    });
  }

  public addMarkers(): void {
    this.clientes.forEach(cliente => {
      const marker = new maplibregl.Marker()
        .setLngLat([cliente.lng, cliente.lat])
        .setPopup(new maplibregl.Popup().setText(cliente.nombre))
        .addTo(this.map);
      this.markers.push(marker);
    });
  }

  public centrarEnCliente(cliente: Cliente): void {
    this.map.flyTo({
      center: [cliente.lng, cliente.lat],
      zoom: 14,
      essential: true
    });
  }

  public trackById(index: number, item: Cliente): string {
    return item.id;
  }

}
