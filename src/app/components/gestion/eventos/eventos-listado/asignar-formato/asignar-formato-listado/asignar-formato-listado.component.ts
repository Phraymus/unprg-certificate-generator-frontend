import {Component, Inject, inject} from '@angular/core';
import {AgGridAngular} from "ag-grid-angular";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatChip, MatChipRemove, MatChipSet} from "@angular/material/chips";
import {NgForOf, NgIf} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {TbEvento} from "~shared/interfaces";
import {MatButton} from "@angular/material/button";
import {AgGridAngularCustomComponent} from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import {ColDef} from "ag-grid-community";
import {MenuOption} from "~shared/classes/ActionButtonsComponent";
import {
  AsignarFormatoRegistroComponent
} from "app/components/gestion/eventos/eventos-listado/asignar-formato/asignar-formato-registro/asignar-formato-registro.component";
import {MatSnackBar} from "@angular/material/snack-bar";

interface DialogData {
  tbEvento: TbEvento;
}

@Component({
  selector: 'app-asignar-formato-listado',
  imports: [
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatButton,
    AgGridAngularCustomComponent
  ],
  templateUrl: './asignar-formato-listado.component.html',
  styleUrl: './asignar-formato-listado.component.scss'
})
export class AsignarFormatoListadoComponent {

  private _dialogRef: MatDialogRef<AsignarFormatoListadoComponent> = inject(MatDialogRef<AsignarFormatoListadoComponent>);
  private _matDialog: MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  tbEvento: TbEvento;
  menuOptions: MenuOption[];
  rowData: any[];
  colDefs: ColDef[] = [
    {field: "codigo", headerName: "Código", width: 120},
    {field: "nombreFormato", headerName: "Nombre del Formato", flex: 1, minWidth: 200},
    {field: "tipoParticipante", headerName: "Tipo de formato", flex: 1, minWidth: 200},
    {
      field: "rutaFormato",
      headerName: "Archivo",
      width: 150,
      cellRenderer: (params: any) => {
        if (params.value) {
          const fileName = params.value.split('/').pop() || 'Archivo';
          return `<span class="file-link" title="${params.value}">${fileName}</span>`;
        }
        return '<span class="no-file">Sin archivo</span>';
      }
    },
  ]

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.tbEvento = data.tbEvento;
  }

  onCancel() {
    this._dialogRef.close({success: false});
  }

  onAdd() {
    const data = {
      action: 'Registrar' as const,
      title: 'Registrar Evento',
      evento: {} as TbEvento
    };

    const dialogRef = this._matDialog.open(AsignarFormatoRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'create') {
          this.showMessage('Evento creado exitosamente', 'success');
          // this.loadEventos();
        }
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'end' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };

    this._snackBar.open(message, 'Cerrar', config);
  }

  onEdit($event: any) {

  }

  onView($event: any) {

  }

  onDownload($event: any) {

  }

  onDelete($event: any) {

  }

  onGridReady($event: any) {

  }

  handleMenuAction($event: { action: string; data: any }) {

  }
}
