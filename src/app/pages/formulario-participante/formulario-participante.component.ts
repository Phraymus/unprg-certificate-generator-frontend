import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TbParticipante, TbPersona, TbEvento } from "~shared/interfaces";
import { TbParticipanteService, TbEventoService } from "app/services";
import { EstadoParticipanteEnum } from "~shared/enums/EstadoParticipanteEnum";

@Component({
  selector: 'app-formulario-participante',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  templateUrl: './formulario-participante.component.html',
  styleUrls: ['./formulario-participante.component.scss']
})
export class FormularioParticipanteComponent implements OnInit {
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _tbParticipanteService: TbParticipanteService = inject(TbParticipanteService);
  private _tbEventoService: TbEventoService = inject(TbEventoService);
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  participanteForm!: FormGroup;
  evento!: TbEvento;
  eventoId: number = 0;
  isLoading = false;
  isLoadingEvento = true;
  eventoNotFound = false;
  registroExitoso = false;

  ngOnInit() {
    this.initializeForm();
    this.loadEventoFromRoute();
  }

  private initializeForm() {
    this.participanteForm = this._formBuilder.group({
      // Datos personales
      dni: ['', [
        Validators.required,
        Validators.pattern(/^\d{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      nombres: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      apellidoPaterno: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      apellidoMaterno: ['', [
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\d{9}$/),
        Validators.minLength(9),
        Validators.maxLength(9)
      ]],
      // Aceptación de términos
      aceptaTerminos: [false, [Validators.requiredTrue]]
    });
  }

  private loadEventoFromRoute() {
    // Obtener el ID del evento desde la ruta
    this._route.params.subscribe(params => {
      const id = params['id'];

      if (!id) {
        this.eventoNotFound = true;
        this.isLoadingEvento = false;
        this.showError('No se proporcionó un ID de evento válido');
        return;
      }

      this.eventoId = +id;
      this.loadEvento(this.eventoId);
    });
  }

  private loadEvento(id: number) {
    this.isLoadingEvento = true;
    this._tbEventoService.findById(id).subscribe({
      next: (evento) => {
        if (evento) {
          this.evento = evento;
          this.isLoadingEvento = false;
          this.validateEventoActivo();
        } else {
          this.eventoNotFound = true;
          this.isLoadingEvento = false;
          this.showError('El evento no existe');
        }
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.eventoNotFound = true;
        this.isLoadingEvento = false;
        this.showError('Error al cargar la información del evento');
      }
    });
  }

  private validateEventoActivo() {
    // Validar que el evento esté activo y dentro de las fechas permitidas
    const hoy = new Date();
    const fechaInicio = this.evento.fechaInicio ? new Date(this.evento.fechaInicio) : null;
    const fechaFin = this.evento.fechaFin ? new Date(this.evento.fechaFin) : null;

    if (fechaInicio && fechaFin) {
      if (hoy < fechaInicio) {
        this.showWarning('Las inscripciones aún no han comenzado para este evento');
      } else if (hoy > fechaFin) {
        this.showWarning('El período de inscripciones para este evento ha finalizado');
      }
    }
  }

  onSubmit() {
    if (this.participanteForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Por favor complete todos los campos requeridos correctamente');
      return;
    }

    if (!this.evento || !this.eventoId) {
      this.showError('No se puede procesar la inscripción sin un evento válido');
      return;
    }

    this.isLoading = true;
    const formData = this.participanteForm.value;

    // Preparar datos de persona (nueva)
    const personaData: TbPersona = {
      dni: formData.dni.trim(),
      nombres: formData.nombres.trim(),
      apellidoPaterno: formData.apellidoPaterno.trim(),
      apellidoMaterno: formData.apellidoMaterno ? formData.apellidoMaterno.trim() : '-',
      email: formData.email.trim().toLowerCase(),
      telefono: formData.telefono.trim()
    };

    // Preparar datos de participante
    const participanteData: TbParticipante = {
      tbEvento: this.evento,
      tbPersona: personaData,
      estado: EstadoParticipanteEnum.Pendiente, // Estado por defecto: PENDIENTE
      fechaInscripcion: new Date().toISOString().split('T')[0],
      nota: null // Sin nota al momento de inscripción
    };

    // Guardar inscripción
    this._tbParticipanteService.insert(participanteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.registroExitoso = true;
        this.showSuccess('¡Inscripción registrada exitosamente!');
        this.participanteForm.reset();

        // Redirigir después de 3 segundos
        setTimeout(() => {
          this._router.navigate(['/inscripcion-exitosa'], {
            queryParams: { eventoId: this.eventoId }
          });
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar inscripción:', error);

        // Manejar diferentes tipos de errores
        if (error.status === 409) {
          this.showError('Ya existe una inscripción con este DNI para este evento');
        } else if (error.status === 400) {
          this.showError('Datos inválidos. Por favor verifique la información ingresada');
        } else {
          this.showError('Error al procesar la inscripción. Por favor intente nuevamente');
        }
      }
    });
  }

  onReset() {
    this.participanteForm.reset();
    this.registroExitoso = false;
  }

  private markFormGroupTouched() {
    Object.keys(this.participanteForm.controls).forEach(key => {
      const control = this.participanteForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para facilitar el acceso en el template
  get f() {
    return this.participanteForm.controls;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.participanteForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (control.hasError('email')) {
      return 'Ingrese un email válido (ejemplo@correo.com)';
    }
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `No debe exceder ${maxLength} caracteres`;
    }
    if (control.hasError('pattern')) {
      if (fieldName === 'dni') {
        return 'El DNI debe tener exactamente 8 dígitos numéricos';
      }
      if (fieldName === 'telefono') {
        return 'El teléfono debe tener exactamente 9 dígitos';
      }
    }
    if (control.hasError('requiredTrue')) {
      return 'Debe aceptar los términos y condiciones';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      dni: 'DNI',
      nombres: 'Nombres',
      apellidoPaterno: 'Apellido Paterno',
      apellidoMaterno: 'Apellido Materno',
      email: 'Correo Electrónico',
      telefono: 'Teléfono',
      aceptaTerminos: 'Aceptación de términos'
    };
    return labels[fieldName] || fieldName;
  }

  private showSuccess(message: string) {
    this._snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this._snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showWarning(message: string) {
    this._snackBar.open(message, 'Cerrar', {
      duration: 7000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar']
    });
  }

  formatFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  volverInicio() {
    this._router.navigate(['/']);
  }
}
