import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HotelMap } from '../../hotel-map/hotel-map';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    HotelMap
  ],
  templateUrl: './info.html',
  styleUrl: './info.css'
})
export class Info {
  readonly highlights = [
    {
      icon: 'hotel',
      title: 'Udobne sobe',
      text: 'Sobe su opremljene za miran boravak, rad i odmor, uz pažljivo odabrane pogodnosti.'
    },
    {
      icon: 'room_service',
      title: 'Usluga tokom dana',
      text: 'Naše osoblje je dostupno za prijavu, informacije, podršku i dodatne zahteve gostiju.'
    },
    {
      icon: 'location_on',
      title: 'Dobra lokacija',
      text: 'Hotel je pozicioniran tako da su gradski sadržaji, restorani i prevoz lako dostupni.'
    }
  ];

  readonly contactItems = [
    { icon: 'call', label: 'Telefon', value: '+381 60 123 4567' },
    { icon: 'mail', label: 'Email', value: 'recepcija@hotelbeograd.rs' },
    { icon: 'schedule', label: 'Recepcija', value: '00-24h' }
  ];
}