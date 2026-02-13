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
import {MatTooltipModule} from '@angular/material/tooltip';
import {CommonModule} from '@angular/common';
import {TbParticipante, TbPersona, TbEvento, TbTipoParticipante} from "~shared/interfaces";
import {TbParticipanteService, TbPersonaService, TbTipoParticipanteService} from "app/services";
import {Observable, of} from 'rxjs';
import {startWith, debounceTime, distinctUntilChanged, switchMap, catchError} from 'rxjs/operators';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSnackBar} from '@angular/material/snack-bar';
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
    MatAutocompleteModule,
    MatTooltipModule
  ],
  templateUrl: './participantes-registro.component.html',
  styleUrls: ['./participantes-registro.component.scss']
})
export class ParticipantesRegistroComponent implements OnInit {
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _tbParticipanteService: TbParticipanteService = inject(TbParticipanteService);
  private _tbTipoParticipanteService: TbTipoParticipanteService = inject(TbTipoParticipanteService);
  private _tbPersonaService: TbPersonaService = inject(TbPersonaService);
  private _dialogRef: MatDialogRef<ParticipantesRegistroComponent> = inject(MatDialogRef<ParticipantesRegistroComponent>);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  participanteForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  isReadOnlyMode = false;
  personaExistente = false;
  personaExistenteDto: TbPersona = null;
  personasFiltradas!: Observable<TbPersona[]>;
  tipoParticipantesDisponibles!: TbTipoParticipante[];

  // Variables para manejo de imagen del comprobante
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  existingImageBase64: string | null = null;
  selectedFileName: string = '';
  selectedFileSize: string = '';
  imageRemoved: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.isEditMode = this.data.action === 'Editar';
    this.isReadOnlyMode = this.data.action === 'Ver' || this.data.readOnly === true;
  }

  ngOnInit() {
    this.initializeForm();
    this.setupPersonaSearch();
    this.loadTipoParticipanteData();

    if ((this.isEditMode || this.isReadOnlyMode) && this.data.participante) {
      this.loadParticipanteData();
    }

    if (this.isReadOnlyMode) {
      this.participanteForm.disable();
    }
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
      tipoParticipante: ['', [Validators.required]],
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
        nota: participante.nota || '',
        tipoParticipante: participante?.tbTipoParticipante.id || ''
      });

      // Cargar imagen del comprobante si existe
      if (participante.comprobante) {
        this.existingImageBase64 = this.arrayBufferToBase64(participante.comprobante);
      }
    }
  }

  private arrayBufferToBase64(buffer: any): string {
    if (typeof buffer === 'string') {
      return buffer;
    }
    if (buffer instanceof ArrayBuffer || Array.isArray(buffer)) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    return buffer;
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
        this.showMessage('Solo se permiten archivos PNG, JPG o JPEG', 'error');
        return;
      }

      // Validar tamaño inicial (máximo 5MB antes de comprimir)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showMessage('La imagen no debe superar los 5MB', 'error');
        return;
      }

      // Comprimir imagen si es mayor a 1MB
      if (file.size > 1024 * 1024) {
        try {
          this.showMessage('Comprimiendo imagen...', 'info');
          file = await this.compressImage(file);
          this.showMessage('Imagen comprimida exitosamente', 'success');
        } catch (error) {
          console.error('Error al comprimir:', error);
          this.showMessage('Error al comprimir la imagen', 'error');
          return;
        }
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFileSize = this.formatFileSize(file.size);
      this.imageRemoved = false;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.existingImageBase64 = null; // Limpiar la imagen existente
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
    this.existingImageBase64 = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.imageRemoved = true;
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
        estado: formData.estado,
        fechaInscripcion: formData.fechaInscripcion ?
          new Date(formData.fechaInscripcion).toISOString().split('T')[0] :
          new Date().toISOString().split('T')[0],
        nota: formData.nota ? parseFloat(formData.nota) : null,
        tbTipoParticipante: {
          id: formData.tipoParticipante
        }
      };

      // Para edición, mantener los IDs
      if (this.isEditMode) {
        participanteData.id = this.data.participante.id;
      }

      // Manejar la imagen del comprobante
      if (this.selectedFile) {
        // Si hay un nuevo archivo seleccionado, convertirlo a base64
        this.convertFileToBase64(this.selectedFile).then(base64 => {
          // Convertir base64 a array de bytes
          participanteData.comprobante = this.base64ToByteArray(base64);
          this.saveParticipante(participanteData);
        }).catch(error => {
          console.error('Error al convertir imagen:', error);
          this.showMessage('Error al procesar la imagen del comprobante', 'error');
          this.isLoading = false;
        });
      } else if (this.imageRemoved) {
        // Si se removió la imagen, enviar null
        participanteData.comprobante = null as any;
        this.saveParticipante(participanteData);
      } else if (this.existingImageBase64 && this.isEditMode) {
        // Si es edición y no se cambió la imagen, mantener la existente
        participanteData.comprobante = this.data.participante.comprobante;
        this.saveParticipante(participanteData);
      } else {
        // No hay imagen
        this.saveParticipante(participanteData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private saveParticipante(participanteData: TbParticipante) {
    if (this.isEditMode) {
      this.updateParticipante(participanteData);
    } else {
      this.createParticipante(participanteData);
    }
  }

  private createParticipante(participanteData: TbParticipante) {
    this._tbParticipanteService.insert(participanteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showMessage('Participante registrado exitosamente', 'success');
        this._dialogRef.close({success: true, data: response, action: 'create'});
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear participante:', error);
        this.showMessage('Error al registrar el participante', 'error');
      }
    });
  }

  private updateParticipante(participanteData: TbParticipante) {
    this._tbParticipanteService.update(participanteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showMessage('Participante actualizado exitosamente', 'success');
        this._dialogRef.close({success: true, data: response, action: 'update'});
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar participante:', error);
        this.showMessage('Error al actualizar el participante', 'error');
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
