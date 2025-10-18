import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NgForOf, NgIf } from '@angular/common';
import {MatTooltip} from "@angular/material/tooltip";

export interface MenuOption {
  icon: string;
  label: string;
  action: string; // Nombre de la acción que se emitirá
  color?: string; // Color opcional para el icono
}

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    NgForOf,
    NgIf,
    MatTooltip
  ],
  template: `
    <div class="action-buttons-container">
      <!-- Botón de Editar -->
      <button
        *ngIf="showEdit"
        mat-icon-button
        class="text-warning"
        matTooltip="Editar"
        (click)="onEdit()">
        <mat-icon>edit</mat-icon>
      </button>

      <!-- Botón de Ver -->
      <button
        *ngIf="showView"
        mat-icon-button
        class="text-primary"
        matTooltip="Ver detalles"
        (click)="onView()">
        <mat-icon>visibility</mat-icon>
      </button>

      <!-- Botón de Descargar -->
      <button
        *ngIf="showDownload"
        mat-icon-button
        class="text-success"
        matTooltip="Descargar"
        (click)="onDownload()">
        <mat-icon>download</mat-icon>
      </button>

      <!-- Botón de Eliminar -->
      <button
        *ngIf="showDelete"
        mat-icon-button
        class="text-danger"
        matTooltip="Eliminar"
        (click)="onDelete()">
        <mat-icon>delete</mat-icon>
      </button>

      <!-- Menú de opciones adicionales (3 puntos) -->
      <button
        *ngIf="menuOptions && menuOptions.length > 0"
        mat-icon-button
        [matMenuTriggerFor]="menu"
        matTooltip="Más opciones">
        <mat-icon>more_vert</mat-icon>
      </button>

      <mat-menu #menu="matMenu" class="border">
        <button
          *ngFor="let option of menuOptions"
          mat-menu-item
          (click)="onMenuAction(option.action)">
          <mat-icon [style.color]="option.color || 'inherit'">
            {{ option.icon }}
          </mat-icon>
          <span>{{ option.label }}</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .action-buttons-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 100%;
    }
  `]
})
export class ActionButtonsComponent implements ICellRendererAngularComp {
  params: any;
  rowData: any;
  showEdit: boolean = true;
  showView: boolean = true;
  showDownload: boolean = false;
  showDelete: boolean = true;
  menuOptions: MenuOption[] = [];

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.rowData = params.data;

    // Configurar visibilidad de botones por defecto
    const colDef = params.colDef as any;
    if (colDef.cellRendererParams) {
      this.showEdit = colDef.cellRendererParams.showEdit !== false;
      this.showView = colDef.cellRendererParams.showView !== false;
      this.showDownload = colDef.cellRendererParams.showDownload === true;
      this.showDelete = colDef.cellRendererParams.showDelete !== false;
      this.menuOptions = colDef.cellRendererParams.menuOptions || [];
    }
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onEdit() {
    if (this.params.context?.componentParent?.onEdit) {
      this.params.context.componentParent.onEdit(this.rowData);
    }
  }

  onView() {
    if (this.params.context?.componentParent?.onView) {
      this.params.context.componentParent.onView(this.rowData);
    }
  }

  onDownload() {
    if (this.params.context?.componentParent?.onDownload) {
      this.params.context.componentParent.onDownload(this.rowData);
    }
  }

  onDelete() {
    if (this.params.context?.componentParent?.onDelete) {
      this.params.context.componentParent.onDelete(this.rowData);
    }
  }

  onMenuAction(actionName: string) {
    if (this.params.context?.componentParent?.onMenuAction) {
      this.params.context.componentParent.onMenuAction(actionName, this.rowData);
    }
  }
}
