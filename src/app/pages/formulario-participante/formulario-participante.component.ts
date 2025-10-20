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
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatCheckboxModule,
    MatTooltipModule
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

  // Variables para manejo de imagen del comprobante
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  selectedFileName: string = '';
  selectedFileSize: string = '';

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

  // ==================== MANEJO DE IMAGEN DEL COMPROBANTE ====================

  /**
   * Maneja la selección de archivo de imagen del comprobante
   */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let file = input.files[0];

      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.showError('Solo se permiten archivos PNG, JPG o JPEG');
        return;
      }

      // Validar tamaño inicial (máximo 5MB antes de comprimir)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showError('La imagen no debe superar los 5MB');
        return;
      }

      // Comprimir imagen si es mayor a 1MB
      if (file.size > 1024 * 1024) {
        try {
          this.showInfo('Comprimiendo imagen...');
          file = await this.compressImage(file);
          this.showSuccess('Imagen comprimida exitosamente');
        } catch (error) {
          console.error('Error al comprimir:', error);
          this.showError('Error al comprimir la imagen');
          return;
        }
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFileSize = this.formatFileSize(file.size);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Comprime una imagen reduciendo su calidad y tamaño
   */
  private async compressImage(file: File, quality: number = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');

          // Calcular nuevas dimensiones (máximo 1920x1080)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
              }
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });

              console.log(`Imagen comprimida: ${this.formatFileSize(file.size)} → ${this.formatFileSize(compressedFile.size)}`);
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          }, file.type, quality);
        };

        img.onerror = () => reject(new Error('Error al cargar imagen'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Elimina la imagen del comprobante seleccionada
   */
  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';

    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Formatea el tamaño del archivo en formato legible
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private base64ToByteArray(base64: string): number[] {
    const binaryString = atob(base64);
    const bytes = new Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // ==================== FIN MANEJO DE IMAGEN ====================

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
      tbEvento: { id: this.evento.id } as any, // Solo enviar el ID del evento
      tbPersona: personaData,
      estado: EstadoParticipanteEnum.Pendiente, // Estado por defecto: PENDIENTE
      fechaInscripcion: new Date().toISOString().split('T')[0],
      nota: null // Sin nota al momento de inscripción
    };

    // Manejar la imagen del comprobante si hay una seleccionada
    if (this.selectedFile) {
      this.convertFileToBase64(this.selectedFile).then(base64 => {
        // Convertir base64 a array de bytes
        participanteData.comprobante = this.base64ToByteArray(base64);
        this.saveInscripcion(participanteData);
      }).catch(error => {
        console.error('Error al convertir imagen:', error);
        this.showError('Error al procesar la imagen del comprobante');
        this.isLoading = false;
      });
    } else {
      // No hay comprobante, guardar directamente
      this.saveInscripcion(participanteData);
    }
  }

  private saveInscripcion(participanteData: TbParticipante) {
    // Guardar inscripción
    this._tbParticipanteService.insert(participanteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.registroExitoso = true;
        this.showSuccess('¡Inscripción registrada exitosamente!');
        this.participanteForm.reset();
        this.removeImage(); // Limpiar la imagen

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
    this.removeImage();
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

  private showInfo(message: string) {
    this._snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
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
