import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        console.log('Ruta actual:', this.currentRoute);
      });
  }

  public getCurrentRoute(): string {
    return this.currentRoute;
  }

  public getCurrentRouteWithoutParams(): string {
    return this.currentRoute.split('?')[0];
  }
}
