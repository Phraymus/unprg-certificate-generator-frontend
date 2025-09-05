import { Routes } from '@angular/router';
import {FlashCardComponent} from "./flash-card/flash-card.component";
import {FirmasListadoComponent} from "app/components/gestion/firmas/firmas-listado/firmas-listado.component";
import {EventosListadoComponent} from "app/components/gestion/eventos/eventos-listado/eventos-listado.component";
import {FormatosListadoComponent} from "app/components/gestion/formatos/formatos-listado/formatos-listado.component";
import {UsuariosListadoComponent} from "app/components/gestion/usuarios/usuarios-listado/usuarios-listado.component";

export const GestionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'flashcards',
        component: FlashCardComponent,
      },
      {
        path: 'usuarios',
        component: UsuariosListadoComponent,
      },
      {
        path: 'eventos',
        component: EventosListadoComponent,
      },
      {
        path: 'formatos',
        component: FormatosListadoComponent,
      },
      {
        path: 'firmas',
        component: FirmasListadoComponent,
      },
      {
        path: 'flashcards',
        component: FlashCardComponent,
      },
    ],
  },
];
