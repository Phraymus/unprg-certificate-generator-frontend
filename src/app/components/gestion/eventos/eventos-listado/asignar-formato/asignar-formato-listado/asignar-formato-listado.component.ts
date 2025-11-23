import {Component, Inject, inject} from '@angular/core';
import {AgGridAngular} from "ag-grid-angular";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatChip, MatChipRemove, MatChipSet} from "@angular/material/chips";
import {NgForOf, NgIf} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {TbEvento} from "~shared/interfaces";
import {MatButton} from "@angular/material/button";
import {AgGridAngularCustomComponent} from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";

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

  tbEvento: TbEvento;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.tbEvento = data.tbEvento;
  }

  onCancel() {
    this._dialogRef.close({ success: false });
  }
}
