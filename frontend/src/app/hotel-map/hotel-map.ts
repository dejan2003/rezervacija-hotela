import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

type Coordinates = [number, number];

interface NearbyPlace {
  name: string;
  type: string;
  distance: string;
  position: Coordinates;
}

const HOTEL_POSITION: Coordinates = [44.8125, 20.4633];

const NEARBY_PLACES: NearbyPlace[] = [
  {
    name: 'Tašmajdan park',
    type: 'Park',
    distance: '5 min peške',
    position: [44.8096, 20.4702],
  },
  {
    name: 'Narodna skupština',
    type: 'Znamenitost',
    distance: '7 min peške',
    position: [44.8118, 20.4658],
  },
  {
    name: 'Trg Republike',
    type: 'Centar grada',
    distance: '12 min peške',
    position: [44.8163, 20.4600],
  },
  {
    name: 'Knez Mihailova',
    type: 'Šetalište',
    distance: '15 min peške',
    position: [44.8186, 20.4569],
  },
];

@Component({
  selector: 'app-hotel-map',
  standalone: true,
  templateUrl: './hotel-map.html',
  styleUrl: './hotel-map.css',
})
export class HotelMap implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  readonly places = NEARBY_PLACES;

  private map?: L.Map;
  private markers = new Map<string, L.Marker>();

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  focusPlace(place: NearbyPlace): void {
    this.map?.setView(place.position, 16);
    this.markers.get(place.name)?.openPopup();
  }

  private initMap(): void {
    if (!this.mapContainer) {
      return;
    }

    this.map = L.map(this.mapContainer.nativeElement, {
      scrollWheelZoom: false,
    }).setView(HOTEL_POSITION, 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const hotelIcon = L.divIcon({
      className: 'hotel-marker',
      html: '<span>H</span>',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36],
    });

    L.marker(HOTEL_POSITION, { icon: hotelIcon })
      .addTo(this.map)
      .bindPopup('<strong>Hotel Beograd</strong><br>Odlična lokacija u centru grada.');

    L.circle(HOTEL_POSITION, {
      radius: 800,
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.08,
      weight: 2,
    }).addTo(this.map);

    this.places.forEach((place, index) => {
      const marker = L.marker(place.position, {
        icon: L.divIcon({
          className: 'place-marker',
          html: `<span>${index + 1}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -28],
        }),
      })
        .addTo(this.map!)
        .bindPopup(`<strong>${place.name}</strong><br>${place.type}<br>${place.distance}`);

      this.markers.set(place.name, marker);
    });

    setTimeout(() => this.map?.invalidateSize(), 0);
  }
}