import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import { SessionService } from '../../../core/services/session.service';
import { FullAddress, GeocoderService, GeocodingResult } from '../../../core/services/geocoder.service';
import { WorksService } from '../../../core/services/works.service';

export interface Cliente {
  id: string;
  nombre: string;
  lat: number | null;
  lng: number | null;
}

interface Recorrido {
  id: string;
  nombre: string;
  clientes: Cliente[];
}

export interface MapStyleOption {
  name: string;
  value: string;
  imageUrl: string;
}

@Component({
  selector: 'app-map-works',
  imports: [
    FormsModule,
    NzSelectModule
  ],
  templateUrl: './map-works.component.html',
  styleUrl: './map-works.component.scss'
})
export class MapWorksComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapContainer!: ElementRef;

  public busquedaDireccion = false;

  protected mapStyles: MapStyleOption[] = [
    { name: "No Base", value: "https://demotiles.maplibre.org/style.json", imageUrl: "assets/imgs/tipos_mapas/no_base.png" },
    { name: "Voyager", value: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json", imageUrl: "assets/imgs/tipos_mapas/voyager.png" },
    { name: "Voyager no labels", value: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json", imageUrl: "assets/imgs/tipos_mapas/voyager_nolabels.png" },
    { name: "Positron", value: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", imageUrl: "assets/imgs/tipos_mapas/positron.png" },
    { name: "Positron no labels", value: "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json", imageUrl: "assets/imgs/tipos_mapas/positron_nolabels.png" },
    { name: "Dark Matter", value: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", imageUrl: "assets/imgs/tipos_mapas/dark_matter.png" },
    { name: "Dark Matter no labels", value: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json", imageUrl: "assets/imgs/tipos_mapas/dark_matter_nolabels.png" }
  ];

  public map!: MapLibreMap;

  // Estilo actual (usa el primero por defecto)
  protected selectedStyleUrl = this.mapStyles[0].value;

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

  private cmp_uuid!: string;

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  // Variables para filtros
  public searchWorkState: string = "bcaa7b3b-cdbf-4b02-8a91-78a67b5aa823";
  public searchRoute: string = "";
  public fieldSortValue: string = "wrk_workdate";
  public sortValue: string = "ASC";

  // Estado UI
  public busqueda = '';
  public resultados: GeocodingResult[] = [];
  public clienteTemporal: Cliente | null = null;
  public recorridoExpandidoId: string | null = null;
  public clienteSeleccionado: Cliente | null = null;
  private marcadorTemporal: maplibregl.Marker | null = null;

  constructor(
    private _sessionService: SessionService,
    private _geocoderService: GeocoderService,
    private _worksService: WorksService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    this.initializeMap();
    this._worksService.getPendingWorks(this.cmp_uuid, this.searchWorkState, this.searchRoute, this.page, this.perPage, this.fieldSortValue, this.sortValue)
      .subscribe(
        response => {
          console.info(response);
          if(response.data) {
            this.recorridos = this.convertirAPendientes(response.data);
          }
        },
        error => {
          console.log(<any>error);
        }
      );
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  /**
   * Convierte el array de trabajos pendientes del backend a un array de recorridos.
   * Agrupa los trabajos por wrks_uuid y rou_name para formar recorridos,
   * y dentro de cada recorrido agrega los clientes únicos con su ubicación.
   */
  private convertirAPendientes(data: any[]): Recorrido[] {
    const recorridosMap: Map<string, Recorrido> = new Map();

    for (const trabajo of data) {
      const rouUuid = trabajo.adr?.cus?.rou?.rou_uuid;
      const rouName = trabajo.adr?.cus?.rou?.rou_name || 'Sin nombre';
      const clienteId = trabajo.adr?.cus?.cus_uuid;
      const clienteNombre = trabajo.adr?.cus?.cus_fullname || 'Cliente sin nombre';
      const lat = trabajo.adr?.adr_lat ?? null;
      const lng = trabajo.adr?.adr_lng ?? null;

      // Si no hay cliente identificado, lo omitimos
      if (!clienteId) continue;

      // Crear o recuperar el recorrido
      if (!recorridosMap.has(rouUuid)) {
        recorridosMap.set(rouUuid, {
          id: rouUuid,
          nombre: rouName,
          clientes: []
        });
      }

      const recorrido = recorridosMap.get(rouUuid)!;

      // Evitar duplicados de cliente en el mismo recorrido
      const clienteYaExiste = recorrido.clientes.some((c: any) => c.id === clienteId);
      if (!clienteYaExiste) {
        recorrido.clientes.push({
          id: clienteId,
          nombre: clienteNombre,
          lat,
          lng
        });
      }
    }

    return Array.from(recorridosMap.values());
  }

  public initializeMap(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: this.selectedStyleUrl,
      center: [-58.3816, -34.6037],
      zoom: 11
    });

    this.map.on('load', () => {
      this.renderClusteredMarkers();
    });

    this.map.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // Opcional: mostrar marcador temporal
      this.mostrarMarcadorTemporal([lng, lat]);

      // Convertir coordenadas a dirección (geocodificación inversa)
      this.obtenerDireccionDesdeCoordenadas(lat, lng).then(direccionCompleta => {
        const nuevoCliente: Cliente = {
          id: crypto.randomUUID(),
          nombre: direccionCompleta.address|| `Cliente en ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat: direccionCompleta.lat,
          lng: direccionCompleta.lng
        };
        this.clienteTemporal = nuevoCliente;
      });
    });
  }

  // Método para cambiar el estilo
  public changeMapStyle(styleUrl: string): void {
    this.selectedStyleUrl = styleUrl;
  
    // Guarda una copia de los datos antes de cambiar
    const allClientes = this.recorridos.flatMap(r => r.clientes);

    // Cambia el estilo
    this.map.setStyle(styleUrl);

    // Cuando el nuevo estilo esté listo, vuelve a agregar los datos
    this.map.once('styledata', () => {
      this.renderClusteredMarkers();
    });
  }

  public getStyleByValue(value: string): MapStyleOption | undefined {
    return this.mapStyles.find(style => style.value === value);
  }

  private mostrarMarcadorTemporal(lngLat: [number, number]): void {
    if (this.marcadorTemporal) {
      this.marcadorTemporal.remove();
    }

    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.background = 'red';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';

    this.marcadorTemporal = new maplibregl.Marker({ element: el })
      .setLngLat(lngLat)
      .addTo(this.map);
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

    if (nuevoCliente.lat == null || nuevoCliente.lng == null) return;

    this.map.flyTo({ center: [nuevoCliente.lng, nuevoCliente.lat], zoom: 15 });
  }

  public guardarCliente(cliente: Cliente, recorridoId: string): void {
    const recorrido = this.recorridos.find(r => r.id === recorridoId);
    if (recorrido) {
      recorrido.clientes.push(cliente);
      this.renderClusteredMarkers(); // Actualiza clusters
    }
    this.clienteTemporal = null;
    if (this.marcadorTemporal) {
      this.marcadorTemporal.remove();
      this.marcadorTemporal = null;
    }
  }

  private async obtenerDireccionDesdeCoordenadas(lat: number, lng: number): Promise<FullAddress> {
    return new Promise((resolve) => {
      this._geocoderService.reverseGeocode(lat, lng).subscribe({
        next: (direccionCompleta) => resolve(direccionCompleta),
        error: () => {
          // En caso de error, devolvemos un FullAddress mínimo
          resolve({
            lat,
            lng,
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
            provincia: undefined,
            ciudad: undefined,
            codigoPostal: undefined
          });
        }
      });
    });
  }

  // === CLUSTERING ===
  private renderClusteredMarkers(): void {
    // Limpiar capas anteriores
    ['clusters', 'cluster-count', 'unclustered-point'].forEach(id => {
      if (this.map.getLayer(id)) this.map.removeLayer(id);
    });
    if (this.map.getSource('clientes')) this.map.removeSource('clientes');

    const allClientes = this.recorridos
      .flatMap(r => r.clientes)
      .filter(cliente => cliente.lat != null && cliente.lng != null);

    const geojson = {
      type: 'FeatureCollection' as const,
      features: allClientes.map(cliente => ({
        type: 'Feature' as const,
        properties: {
          ...cliente,
          lat: cliente.lat!, // ahora sabemos que no es null
          lng: cliente.lng!
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [cliente.lng!, cliente.lat!] // ← sin null
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
    if (cliente.lat == null || cliente.lng == null) return;

    this.clienteSeleccionado = cliente;
    this.map.flyTo({
      center: [cliente.lng, cliente.lat],
      zoom: 14,
      essential: true
    });
  }
}
