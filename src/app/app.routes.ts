import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { BrandingComponent } from "app/layouts/branding/branding.component";
import { FormularioParticipanteComponent } from './pages/formulario-participante/formulario-participante.component';
import {
  InscripcionExitosaComponent
} from "app/pages/formulario-participante/inscripcion-exitosa/inscripcion-exitosa.component";

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'gestion',
        loadChildren: () =>
          import('./components/gestion/gestion.routes').then((m) => m.GestionRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
    ],
  },
  {
    path: 'branding',
    component: BrandingComponent,
  },
  // Rutas públicas para inscripción de participantes
  {
    path: 'inscripcion',
    component: BlankComponent,
    children: [
      {
        path: 'evento/:id',
        component: FormularioParticipanteComponent,
        title: 'Inscripción al Evento'
      },
      {
        path: 'exitosa',
        component: InscripcionExitosaComponent,
        title: 'Inscripción Exitosa'
      }
    ]
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
