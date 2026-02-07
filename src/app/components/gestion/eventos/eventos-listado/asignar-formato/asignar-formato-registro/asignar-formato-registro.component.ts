import {Component, inject, Inject, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatLabel} from "@angular/material/input";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatSelect} from "@angular/material/select";
import {MatOption} from "@angular/material/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  TbEvento, TbEventoFormatoCertificado,
  TbFormatoCertificado,
  TbTipoParticipante
} from "~shared/interfaces";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {TbEventoFormatoCertificadoService, TbFormatoCertificadoService, TbTipoParticipanteService} from "app/services";
import {MatSnackBar} from "@angular/material/snack-bar";

interface DialogData {
  action: 'Registrar' | 'Editar' | 'Ver';
  evento: TbEvento;
}

interface FormData {
  formato: number;
  participante: number;
}

@Component({
  selector: 'app-asignar-formato-registro',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatCardHeader,
    MatCardTitle,
    MatError,
    MatLabel,
    NgIf,
    ReactiveFormsModule,
    MatError,
    MatFormField,
    MatSelect,
    MatOption,
    MatIcon,
  ],
  templateUrl: './asignar-formato-registro.component.html',
  styleUrl: './asignar-formato-registro.component.scss'
})
export class AsignarFormatoRegistroComponent implements OnInit {

  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _dialogRef: MatDialogRef<AsignarFormatoRegistroComponent> = inject(MatDialogRef<AsignarFormatoRegistroComponent>);
  private readonly _tbTipoParticipanteService: TbTipoParticipanteService = inject(TbTipoParticipanteService);
  private readonly _tbFormatoCertificadoService: TbFormatoCertificadoService = inject(TbFormatoCertificadoService);
  private readonly _tbEventoFormatoCertificadoService: TbEventoFormatoCertificadoService = inject(TbEventoFormatoCertificadoService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);

  asignarFormatoForm!: FormGroup;

  isLoading = false;
  isEditMode = false;
  isReadOnlyMode = false;

  tipoParticipantesDisponibles!: TbTipoParticipante[];
  formatoCertificadosDisponibles!: TbFormatoCertificado[];


  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}


  ngOnInit() {
    this.initializeForm();
    this.loadTipoParticipanteData();
    this.loadFormatoCertificadoData();
  }

  private initializeForm() {
    this.asignarFormatoForm = this._formBuilder.group({
      formato: ['', [Validators.required, Validators.minLength(3)]],
      participante: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit() {
      if(this.asignarFormatoForm.valid){
        const formaData = this.asignarFormatoForm.value as FormData;

        console.log(formaData);
        const sendData: TbEventoFormatoCertificado = {
          id: {
            idtbEvento: this.data.evento.id,
            idtbFormatoCertificado: formaData.formato,
            idtbTipoParticipante: formaData.participante
          }
        }

        this._tbEventoFormatoCertificadoService.insert(sendData).subscribe({
          next: (res) => {
            this._dialogRef.close({success: true, data: res});
            this.showMessage('Formato asignado correctamente', 'success');
          },
          error: (error) => {
            this.showMessage('Error al asignar formato', 'error');
          }
        });
      }
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


  // Getters para facilitar el acceso a los controles del formulario
  get f() { return this.asignarFormatoForm.controls; }

  getErrorMessage(fieldName: string): string {
    const control = this.asignarFormatoForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      formato: 'Formato',
      participante: 'Participante',
    };
    return labels[fieldName] || fieldName;
  }

  private loadFormatoCertificadoData(): void {
    this._tbFormatoCertificadoService.findAll().subscribe({
      next: (formatoCertificado) => {
        this.formatoCertificadosDisponibles = formatoCertificado;
      },
      error: (error) => {
        console.error('Error al cargar los formatos:', error);
      }
    });
  }

  private loadTipoParticipanteData(): void {
    this._tbTipoParticipanteService.findAllByEstado(true).subscribe({
      next: (tipoParticipantes) => {
        this.tipoParticipantesDisponibles = tipoParticipantes;
      },
      error: (error) => {
        console.error('Error al cargar tipos de participante:', error);
      }
    });
  }

  onCancel() {
    this._dialogRef.close({ success: false });
  }
}
