import { Routes } from '@angular/router';
import {FlashCardComponent} from "./flash-card/flash-card.component";

export const GestionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'flashcards',
        component: FlashCardComponent,
      },
    ],
  },
];
