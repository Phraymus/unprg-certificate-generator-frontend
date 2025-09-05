import {Component, Inject, OnInit, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {CommonModule, NgIf} from '@angular/common';
import {TbEvento} from "~shared/interfaces";
import {TbEventoService} from "app/services";
import {
  ParticipantesListadoComponent
} from "app/components/gestion/eventos/eventos-registro/participantes/participantes-listado/participantes-listado.component";

interface DialogData {
  action: 'Registrar' | 'Editar' | 'Ver';
  title: string;
  evento: TbEvento;
  readOnly?: boolean;
}

@Component({
  selector: 'app-eventos-registro',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardFooter,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgIf,
  ],
  templateUrl: './eventos-registro.component.html',
  styleUrl: './eventos-registro.component.scss',
  providers: [],
})
export class EventosRegistroComponent implements OnInit {
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _tbEventoService: TbEventoService = inject(TbEventoService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _dialogRef: MatDialogRef<EventosRegistroComponent> = inject(MatDialogRef<EventosRegistroComponent>);

  eventoForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  isReadOnlyMode = false;
  minDate = new Date(); // Fecha mínima es hoy

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.isEditMode = this.data.action === 'Editar';
    this.isReadOnlyMode = this.data.action === 'Ver' || this.data.readOnly === true;
  }

  ngOnInit() {
    this.initializeForm();
    if ((this.isEditMode || this.isReadOnlyMode) && this.data.evento) {
      this.loadEventoData();
    }

    if (this.isReadOnlyMode) {
      this.eventoForm.disable();
    }
  }

  private initializeForm() {
    this.eventoForm = this._formBuilder.group({
      codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]]
    }, {
      validators: this.dateRangeValidator
    });
  }

  private dateRangeValidator(form: FormGroup) {
    const fechaInicio = form.get('fechaInicio');
    const fechaFin = form.get('fechaFin');

    if (fechaInicio?.value && fechaFin?.value) {
      const inicio = new Date(fechaInicio.value);
      const fin = new Date(fechaFin.value);

      if (fin < inicio) {
        fechaFin?.setErrors({dateRange: true});
        return {dateRange: true};
      }
    }

    if (fechaFin?.hasError('dateRange')) {
      fechaFin?.setErrors(null);
    }

    return null;
  }

  private loadEventoData() {
    if (this.data.evento) {
      const evento = this.data.evento;
      this.eventoForm.patchValue({
        codigo: evento.codigo || '',
        nombre: evento.nombre || '',
        fechaInicio: evento.fechaInicio ? new Date(evento.fechaInicio) : null,
        fechaFin: evento.fechaFin ? new Date(evento.fechaFin) : null
      });
    }
  }

  onSubmit() {
    if (this.eventoForm.valid) {
      this.isLoading = true;
      const formData = this.eventoForm.value;

      const eventoData: TbEvento = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        fechaInicio: formData.fechaInicio ? this.formatDateToISO(formData.fechaInicio) : undefined,
        fechaFin: formData.fechaFin ? this.formatDateToISO(formData.fechaFin) : undefined
      };

      if (this.isEditMode) {
        eventoData.id = this.data.evento.id;
        this.updateEvento(eventoData);
      } else {
        this.createEvento(eventoData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private formatDateToISO(date: Date): string {
    // Formato YYYY-MM-DD para LocalDate en el backend
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private createEvento(eventoData: TbEvento) {
    this._tbEventoService.insert(eventoData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({success: true, data: response, action: 'create'});
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear evento:', error);
      }
    });
  }

  private updateEvento(eventoData: TbEvento) {
    this._tbEventoService.update(eventoData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({success: true, data: response, action: 'update'});
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar evento:', error);
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.eventoForm.controls).forEach(key => {
      const control = this.eventoForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this._dialogRef.close({success: false});
  }

  // Getters para facilitar el acceso a los controles del formulario
  get f() {
    return this.eventoForm.controls;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.eventoForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    if (control?.hasError('dateRange')) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      codigo: 'Código',
      nombre: 'Nombre del evento',
      fechaInicio: 'Fecha de inicio',
      fechaFin: 'Fecha de fin'
    };
    return labels[fieldName] || fieldName;
  }

  // Método para controlar la fecha mínima del fin según el inicio
  getMinEndDate(): Date {
    const fechaInicio = this.eventoForm.get('fechaInicio')?.value;
    if (fechaInicio) {
      return new Date(fechaInicio);
    }
    return this.minDate;
  }

  // Método para limpiar fecha de fin si es anterior al inicio
  onStartDateChange() {
    const fechaInicio = this.eventoForm.get('fechaInicio')?.value;
    const fechaFin = this.eventoForm.get('fechaFin')?.value;

    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      this.eventoForm.get('fechaFin')?.setValue(null);
    }
  }

  // Método para obtener el estado del evento
  getEventStatus(): string {
    const fechaInicio = this.eventoForm.get('fechaInicio')?.value;
    const fechaFin = this.eventoForm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin) {
      return 'Sin fechas';
    }

    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    hoy.setHours(0, 0, 0, 0);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (hoy < inicio) {
      return 'Próximo';
    } else if (hoy >= inicio && hoy <= fin) {
      return 'En curso';
    } else {
      return 'Finalizado';
    }
  }

  getDuracionEvento(): number {
    const fechaInicio = this.eventoForm.get('fechaInicio')?.value;
    const fechaFin = this.eventoForm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin) {
      return 0;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1; // +1 porque incluye ambos días
  }

  onParticipantes(evento: any) {
    evento = {}
    evento = this.data.evento;
    const dialogRef = this._matDialog.open(ParticipantesListadoComponent, {
      width: '95vw',
      maxWidth: '1400px',
      height: '83vh',
      maxHeight: '90vh',
      data: {evento},
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal de participantes cerrado');
      // Aquí puedes realizar alguna acción después de cerrar el modal si es necesario
    });
  }
}
