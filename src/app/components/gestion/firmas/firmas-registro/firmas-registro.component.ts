import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { TbFirma } from "~shared/interfaces";
import { TbFirmaService } from "app/services";
import { MatSnackBar } from '@angular/material/snack-bar';

interface DialogData {
  action: 'Registrar' | 'Editar' | 'Ver';
  title: string;
  firma: TbFirma;
  readOnly?: boolean;
}

@Component({
  selector: 'app-firmas-registro',
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
    MatTooltipModule
  ],
  templateUrl: './firmas-registro.component.html',
  styleUrl: './firmas-registro.component.scss'
})
export class FirmasRegistroComponent implements OnInit {
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _tbFirmaService: TbFirmaService = inject(TbFirmaService);
  private _dialogRef: MatDialogRef<FirmasRegistroComponent> = inject(MatDialogRef<FirmasRegistroComponent>);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  firmaForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  isReadOnlyMode = false;

  // Variables para manejo de imagen
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
    if ((this.isEditMode || this.isReadOnlyMode) && this.data.firma) {
      this.loadFirmaData();
    }

    // Si es modo de solo lectura, deshabilitar todo el formulario
    if (this.isReadOnlyMode) {
      this.firmaForm.disable();
    }
  }

  private initializeForm() {
    this.firmaForm = this._formBuilder.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      estado: ['1', [Validators.required]] // Default: 1 = Activo
    });
  }

  private loadFirmaData() {
    if (this.data.firma) {
      const firma = this.data.firma;
      this.firmaForm.patchValue({
        codigo: firma.codigo,
        nombre: firma.nombre,
        estado: firma.estado || '1' // Convertir a string para el select
      });

      // Cargar imagen existente si hay
      if (firma.imagen) {
        this.existingImageBase64 = this.arrayBufferToBase64(firma.imagen);
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

  // Manejo de archivo de imagen
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

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.existingImageBase64 = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.imageRemoved = true;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onSubmit() {
    if (this.firmaForm.valid) {
      this.isLoading = true;
      const formData = this.firmaForm.value;

      // Preparar datos según tu estructura TbFirma
      const firmaData: TbFirma = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        estado: formData.estado // Ya viene como "1" o "0" del select
      };

      // Manejar la imagen
      if (this.selectedFile) {
        // Si hay un nuevo archivo seleccionado, convertirlo a base64
        this.convertFileToBase64(this.selectedFile).then(base64 => {
          // Convertir base64 a array de bytes
          firmaData.imagen = this.base64ToByteArray(base64);
          this.saveFirma(firmaData);
        }).catch(error => {
          console.error('Error al convertir imagen:', error);
          this.showMessage('Error al procesar la imagen', 'error');
          this.isLoading = false;
        });
      } else if (this.imageRemoved) {
        // Si se removió la imagen, enviar null
        firmaData.imagen = null as any;
        this.saveFirma(firmaData);
      } else if (this.existingImageBase64 && this.isEditMode) {
        // Si es edición y no se cambió la imagen, mantener la existente
        firmaData.imagen = this.data.firma.imagen;
        this.saveFirma(firmaData);
      } else {
        // No hay imagen
        this.saveFirma(firmaData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private saveFirma(firmaData: TbFirma) {
    if (this.isEditMode) {
      firmaData.id = this.data.firma.id;
      this.updateFirma(firmaData);
    } else {
      this.createFirma(firmaData);
    }
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

  private createFirma(firmaData: TbFirma) {
    this._tbFirmaService.insert(firmaData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showMessage('Firma creada exitosamente', 'success');
        this._dialogRef.close({ success: true, data: response, action: 'create' });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear firma:', error);
        this.showMessage('Error al crear la firma', 'error');
      }
    });
  }

  private updateFirma(firmaData: TbFirma) {
    this._tbFirmaService.update(firmaData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showMessage('Firma actualizada exitosamente', 'success');
        this._dialogRef.close({ success: true, data: response, action: 'update' });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar firma:', error);
        this.showMessage('Error al actualizar la firma', 'error');
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.firmaForm.controls).forEach(key => {
      const control = this.firmaForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this._dialogRef.close({ success: false });
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
  get f() { return this.firmaForm.controls; }

  getErrorMessage(fieldName: string): string {
    const control = this.firmaForm.get(fieldName);
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
      codigo: 'Código',
      nombre: 'Nombre',
      estado: 'Estado'
    };
    return labels[fieldName] || fieldName;
  }
}
