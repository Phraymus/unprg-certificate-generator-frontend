import {Component, Inject, OnInit, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {TbParticipante, TbPersona, TbEvento} from "~shared/interfaces";
import {TbParticipanteService, TbPersonaService} from "app/services";
import {Observable, of} from 'rxjs';
import {startWith, debounceTime, distinctUntilChanged, switchMap, catchError} from 'rxjs/operators';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {stringAEnumParticipante} from "~shared/enums/EstadoParticipanteEnum";

interface DialogData {
  action: 'Registrar' | 'Editar' | 'Ver';
  title: string;
  participante: TbParticipante;
  evento: TbEvento;
  readOnly?: boolean;
}

@Component({
  selector: 'app-participantes-registro',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  templateUrl: './participantes-registro.component.html',
  styleUrls: ['./participantes-registro.component.scss']
})
export class ParticipantesRegistroComponent implements OnInit {
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _tbParticipanteService: TbParticipanteService = inject(TbParticipanteService);
  private _tbPersonaService: TbPersonaService = inject(TbPersonaService);
  private _dialogRef: MatDialogRef<ParticipantesRegistroComponent> = inject(MatDialogRef<ParticipantesRegistroComponent>);

  participanteForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  isReadOnlyMode = false;
  personaExistente = false;
  personaExistenteDto: TbPersona = null;
  personasFiltradas!: Observable<TbPersona[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.isEditMode = this.data.action === 'Editar';
    this.isReadOnlyMode = this.data.action === 'Ver' || this.data.readOnly === true;
  }

  ngOnInit() {
    this.initializeForm();
    this.setupPersonaSearch();

    if ((this.isEditMode || this.isReadOnlyMode) && this.data.participante) {
      this.loadParticipanteData();
    }

    if (this.isReadOnlyMode) {
      this.participanteForm.disable();
    }
  }

  private initializeForm() {
    this.participanteForm = this._formBuilder.group({
      // Búsqueda de persona
      personaBusqueda: [''],

      // Datos de persona
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{9}$/)]],

      // Datos de participación
      estado: ['Activo', [Validators.required]],
      fechaInscripcion: [new Date(), [Validators.required]],
      nota: ['', [Validators.min(0), Validators.max(20)]]
    });
  }

  private setupPersonaSearch() {
    if (!this.isEditMode && !this.isReadOnlyMode) {
      this.personasFiltradas = this.participanteForm.get('personaBusqueda')!.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (typeof value === 'string' && value.length >= 2) {
            return this._tbPersonaService.findAllByNombreOrDni(value).pipe(
              catchError(() => of([]))
            );
          }
          return of([]);
        })
      );
    }
  }

  private loadParticipanteData() {
    if (this.data.participante) {
      const participante = this.data.participante;
      this.personaExistente = true;

      this.participanteForm.patchValue({
        dni: participante.tbPersona?.dni || '',
        nombres: participante.tbPersona?.nombres || '',
        apellidoPaterno: participante.tbPersona?.apellidoPaterno || '',
        apellidoMaterno: participante.tbPersona?.apellidoMaterno || '',
        email: participante.tbPersona?.email || '',
        telefono: participante.tbPersona?.telefono || '',
        estado: participante.estado || 'Activo',
        fechaInscripcion: participante.fechaInscripcion ? new Date(participante.fechaInscripcion) : new Date(),
        nota: participante.nota || ''
      });
    }
  }

  onPersonaSelected(event: any) {
    const persona: TbPersona = event.option.value;
    if (persona) {
      this.personaExistente = true;
      this.personaExistenteDto = persona;
      this.participanteForm.patchValue({
        dni: persona.dni,
        nombres: persona.nombres,
        apellidoPaterno: persona.apellidoPaterno,
        apellidoMaterno: persona.apellidoMaterno,
        email: persona.email,
        telefono: persona.telefono
      });

      // Hacer readonly los campos de persona cuando se selecciona una existente
      ['dni', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'email', 'telefono'].forEach(field => {
        this.participanteForm.get(field)?.disable();
      });
    }
  }

  displayPersona(persona: TbPersona): string {
    return persona ? `${persona.dni} - ${persona.nombres} ${persona.apellidoPaterno}` : '';
  }

  onSubmit() {
    if (this.participanteForm.valid) {
      this.isLoading = true;
      const formData = this.participanteForm.getRawValue(); // getRawValue para obtener campos disabled

      // Preparar datos de persona
      const personaData: TbPersona = {
        dni: formData.dni,
        nombres: formData.nombres,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        email: formData.email,
        telefono: formData.telefono
      };

      // Si es edición y la persona ya existe, mantener el ID
      if (this.isEditMode && this.data.participante.tbPersona?.id) {
        personaData.id = this.data.participante.tbPersona.id;
      }

      // Preparar datos de participante
      const participanteData: TbParticipante = {
        tbEvento: this.data.evento,
        tbPersona: this.personaExistente ? this.personaExistenteDto : personaData,
        estado: stringAEnumParticipante(formData.estado),
        fechaInscripcion: formData.fechaInscripcion ?
          new Date(formData.fechaInscripcion).toISOString().split('T')[0] :
          new Date().toISOString().split('T')[0],
        nota: formData.nota ? parseFloat(formData.nota) : null
      };

      // Para edición, mantener los IDs
      if (this.isEditMode) {
        participanteData.id = this.data.participante.id;
      }

      if (this.isEditMode) {
        this.updateParticipante(participanteData);
      } else {
        this.createParticipante(participanteData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createParticipante(participanteData: TbParticipante) {
    this._tbParticipanteService.insert(participanteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({success: true, data: response, action: 'create'});
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear participante:', error);
        // Aquí podrías mostrar un mensaje de error específico
      }
    });
  }

  private updateParticipante(participanteData: TbParticipante) {
    this._tbParticipanteService.update(participanteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({success: true, data: response, action: 'update'});
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar participante:', error);
        // Aquí podrías mostrar un mensaje de error específico
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.participanteForm.controls).forEach(key => {
      const control = this.participanteForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this._dialogRef.close({success: false});
  }

  // Getters para facilitar el acceso a los controles del formulario
  get f() {
    return this.participanteForm.controls;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.participanteForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Email no válido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'dni') return 'DNI debe tener 8 dígitos';
      if (fieldName === 'telefono') return 'Teléfono debe tener 9 dígitos';
    }
    if (control?.hasError('min')) {
      return 'La nota debe ser mayor o igual a 0';
    }
    if (control?.hasError('max')) {
      return 'La nota debe ser menor o igual a 20';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      dni: 'DNI',
      nombres: 'Nombres',
      apellidoPaterno: 'Apellido paterno',
      apellidoMaterno: 'Apellido materno',
      email: 'Email',
      telefono: 'Teléfono',
      estado: 'Estado',
      fechaInscripcion: 'Fecha de inscripción',
      nota: 'Nota'
    };
    return labels[fieldName] || fieldName;
  }
}
