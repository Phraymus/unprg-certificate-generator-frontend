// action-buttons.component.ts
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-action-buttons',
  template: `
    <div class="action-buttons-container d-flex gap-2 align-items-center justify-content-center">
      <button
        mat-icon-button
        class="text-warning"
        matTooltip="Editar"
        (click)="onEdit()">
        <mat-icon>edit</mat-icon>
      </button>

      <button
        mat-icon-button
        class="text-primary"
        matTooltip="Ver detalles"
        (click)="onView()">
        <mat-icon>visibility</mat-icon>
      </button>

      <button
        mat-icon-button
        class="text-success"
        matTooltip="Descargar"
        (click)="onDownload()">
        <mat-icon>download</mat-icon>
      </button>

      <button
        mat-icon-button
        class="text-danger"
        matTooltip="Eliminar"
        (click)="onDelete()">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .action-buttons-container {
      height: 100%;
      padding: 4px;
    }

    .mat-mdc-icon-button {
      width: 42px;
      height: 32px;
      line-height: 32px;
    }

    .mat-mdc-icon-button .mat-icon {
      font-size: 20px;
      width: 24px;
      height: 18px;
    }
  `],
  imports: [
    MatIconButton,
    MatIcon,
    MatTooltip
  ],
  standalone: true
})
export class ActionButtonsComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  onEdit() {
    // Aquí puedes emitir un evento o llamar a un método del componente padre
    if (this.params.context?.componentParent?.onEdit) {
      this.params.context.componentParent.onEdit(this.params.data);
    }
  }

  onView() {
    if (this.params.context?.componentParent?.onView) {
      this.params.context.componentParent.onView(this.params.data);
    }
  }

  onDownload() {
    if (this.params.context?.componentParent?.onDownload) {
      this.params.context.componentParent.onDownload(this.params.data);
    }
  }

  onDelete() {
    if (this.params.context?.componentParent?.onDelete) {
      this.params.context.componentParent.onDelete(this.params.data);
    }
  }
}
