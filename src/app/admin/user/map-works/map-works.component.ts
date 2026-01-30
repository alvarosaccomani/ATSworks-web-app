import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { GeocoderService, GeocodingResult } from '../../../core/services/geocoder.service';

interface Cliente {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
}

interface Recorrido {
  id: string;
  nombre: string;
  clientes: Cliente[];
}

@Component({
  selector: 'app-map-works',
  imports: [
    FormsModule
  ],
  templateUrl: './map-works.component.html',
  styleUrl: './map-works.component.scss'
})
export class MapWorksComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapContainer!: ElementRef;

  public map!: Map;

  // Datos estructurados por recorrido
  public recorridos: Recorrido[] = [
    {
      id: 'r1',
      nombre: 'Recorrido Centro',
      clientes: [
        { id: '1', nombre: 'Cliente A', lat: -34.6037, lng: -58.3816 },
        { id: '2', nombre: 'Cliente B', lat: -34.6175, lng: -58.3633 }
      ]
    }
  ];

  // Estado UI
  public busqueda = '';
  public resultados: GeocodingResult[] = [];
  public clienteTemporal: Cliente | null = null;
  public recorridoExpandidoId: string | null = null;
  public clienteSeleccionado: Cliente | null = null;

  constructor(
    private _geocoderService: GeocoderService
  ) { }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  public initializeMap(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-58.3816, -34.6037],
      zoom: 11
    });

    this.map.on('load', () => {
      this.renderClusteredMarkers();
    });
  }

  // === BÚSQUEDA Y GUARDADO ===
  public buscarDireccion(): void {
    if (!this.busqueda.trim()) return;
    this._geocoderService.search(this.busqueda).subscribe({
      next: (res) => (this.resultados = res),
      error: (err) => console.error('Error en geocodificación', err)
    });
  }

  public seleccionarDireccion(resultado: GeocodingResult): void {
    const nuevoCliente: Cliente = {
      id: crypto.randomUUID(),
      nombre: resultado.display_name,
      lat: parseFloat(resultado.lat),
      lng: parseFloat(resultado.lon)
    };

    this.clienteTemporal = nuevoCliente;
    this.resultados = [];
    this.busqueda = '';
    this.map.flyTo({ center: [nuevoCliente.lng, nuevoCliente.lat], zoom: 15 });
  }

  public guardarCliente(cliente: Cliente, recorridoId: string): void {
    const recorrido = this.recorridos.find(r => r.id === recorridoId);
    if (recorrido) {
      recorrido.clientes.push(cliente);
      this.renderClusteredMarkers(); // Actualiza clusters
    }
    this.clienteTemporal = null;
  }

  // === CLUSTERING ===
  private renderClusteredMarkers(): void {
    // Limpiar capas anteriores
    ['clusters', 'cluster-count', 'unclustered-point'].forEach(id => {
      if (this.map.getLayer(id)) this.map.removeLayer(id);
    });
    if (this.map.getSource('clientes')) this.map.removeSource('clientes');

    const allClientes = this.recorridos.flatMap(r => r.clientes);

    const geojson = {
      type: 'FeatureCollection' as const,
      features: allClientes.map(c => ({
        type: 'Feature' as const,
        properties: { ...c },
        geometry: {
          type: 'Point' as const,
          coordinates: [c.lng, c.lat]
        }
      }))
    };

    this.map.addSource('clientes', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Clusters
    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clientes',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#51bbd6',
        'circle-radius': 20
      }
    });

    // Número en cluster
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clientes',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 12
      }
    });

    // Puntos individuales
    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'clientes',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#0074d9',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Interacción
    this.map.on('click', 'unclustered-point', (e) => {
      const props = e.features?.[0].properties as Cliente;
      this.clienteSeleccionado = props;
      this.centrarEnCliente(props);
    });

    this.map.on('click', 'clusters', async (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length) return;

      const feature = features[0];
      const clusterId = feature.properties?.['cluster_id'];
      if (clusterId == null) return;

      const source = this.map.getSource('clientes');
      if (!source || !(source instanceof maplibregl.GeoJSONSource)) return;

      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);

        // Verificar geometría
        if (feature.geometry.type !== 'Point') return;
        const coordinates = feature.geometry.coordinates;

        this.map.easeTo({
          center: coordinates as [number, number],
          zoom
        });
      } catch (err) {
        console.error('Error al expandir cluster:', err);
      }
    });
  }

  // === INTERACCIÓN ===
  public toggleRecorrido(id: string): void {
    this.recorridoExpandidoId = this.recorridoExpandidoId === id ? null : id;
  }

  public centrarEnCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.map.flyTo({
      center: [cliente.lng, cliente.lat],
      zoom: 14,
      essential: true
    });
  }
}
