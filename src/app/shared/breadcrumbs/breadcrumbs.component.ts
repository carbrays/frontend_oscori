import { Component } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { ActivationEnd, Router, ActivatedRoute, Event, RouterEvent, ActivatedRouteSnapshot } from '@angular/router';
import { filter,map } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent {
  titulo!: string;
  constructor (private router: Router, private title: Title, private meta: Meta) {

    this.getDataRoute()
    .subscribe(
      data => {
      this.titulo=data.titulo;
      this.title.setTitle('INE '+this.titulo);

      const metaTag: MetaDefinition = {
        name: 'Description',
        content: this.titulo
      };

      this.meta.updateTag(metaTag);
      }
      );
  }

  getDataRoute(){ //funcion que contruye el breakcrumbs a partir del ActivationEnd
    return this.router.events.pipe(
      filter(eventoss => eventoss instanceof ActivationEnd),
      //filter((eventoss: ActivationEnd)=> eventoss.snapshot.firstChild===null)
      //map((evento: ActivationEnd)=> evento.snapshot.data)
      filter(event => (<ActivationEnd>event).snapshot.firstChild==null),
      map(snapshot => (<ActivationEnd>snapshot).snapshot.data)
      //map((event: ActivationEnd)=> event.snapshot.data)
    )
  }

  

}
