import { Component, Inject, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { TbFormatoCertificado, TbUsuario } from "~shared/interfaces";
import { TbFormatoCertificadoService, TbUsuarioService } from "app/services";

interface DialogData {
  action: 'Registrar' | 'Editar' | 'Ver';
  title: string;
  formato: TbFormatoCertificado;
  readOnly?: boolean;
}

@Component({
  selector: 'app-formato-certificado-registro',
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
    MatProgressBarModule
  ],
  templateUrl: './formatos-registro.component.html',
  styleUrl: './formatos-registro.component.scss'
})
export class FormatosRegistroComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _tbFormatoCertificadoService: TbFormatoCertificadoService = inject(TbFormatoCertificadoService);
  private _tbUsuarioService: TbUsuarioService = inject(TbUsuarioService);
  private _dialogRef: MatDialogRef<FormatosRegistroComponent> = inject(MatDialogRef<FormatosRegistroComponent>);

  formatoForm!: FormGroup;
  usuarios: TbUsuario[] = [];
  isLoading = false;
  isEditMode = false;
  isReadOnlyMode = false;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  uploadProgress = 0;

  // Configuración para archivos permitidos
  readonly acceptedFileTypes = '.doc,.docx';
  readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.isEditMode = this.data.action === 'Editar';
    this.isReadOnlyMode = this.data.action === 'Ver' || this.data.readOnly === true;
  }

  ngOnInit() {
    this.initializeForm();
    this.loadUsuarios();

    if ((this.isEditMode || this.isReadOnlyMode) && this.data.formato) {
      this.loadFormatoData();
    }

    if (this.isReadOnlyMode) {
      this.formatoForm.disable();
    }
  }

  private initializeForm() {
    this.formatoForm = this._formBuilder.group({
      codigo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      nombreFormato: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      idtbUsuario: ['', [Validators.required]],
      descripcion: ['', [Validators.maxLength(500)]]
    });
  }

  private loadUsuarios() {
    this._tbUsuarioService.findAll().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  private loadFormatoData() {
    if (this.data.formato) {
      const formato = this.data.formato;
      this.formatoForm.patchValue({
        codigo: formato.codigo || '',
        nombreFormato: formato.nombreFormato || '',
        idtbUsuario: formato.idtbUsuario || formato.tbUsuario?.id || '',
        descripcion: formato.rutaFormato || ''
      });

      // Si hay un archivo, mostrar información
      if (formato.rutaFormato) {
        this.filePreview = formato.rutaFormato.split('/').pop() || 'Archivo existente';
      }
    }
  }

  // Manejo de archivos
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  private handleFileSelection(file: File) {
    // Validar tipo de archivo
    if (!this.isValidFileType(file)) {
      alert('Solo se permiten archivos Word (.doc, .docx)');
      return;
    }

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      alert(`El archivo es muy grande. Tamaño máximo: ${this.maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    this.selectedFile = file;
    this.filePreview = file.name;
  }

  private isValidFileType(file: File): boolean {
    const validTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return validTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.docx');
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Descargar archivo existente
  downloadCurrentFile() {
    if (this.data.formato?.id) {
      this._tbFormatoCertificadoService.downloadFile(this.data.formato.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.data.formato?.rutaFormato?.split('/').pop() || 'formato.docx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error al descargar archivo:', error);
        }
      });
    }
  }

  onSubmit() {
    if (this.formatoForm.valid) {
      // Validar que hay archivo en modo creación
      if (!this.isEditMode && !this.selectedFile) {
        alert('Debe seleccionar un archivo Word');
        return;
      }

      this.isLoading = true;
      const formData = this.formatoForm.value;

      const formatoData: TbFormatoCertificado = {
        codigo: formData.codigo,
        nombreFormato: formData.nombreFormato,
        idtbUsuario: formData.idtbUsuario,
        tbUsuario: {
          id: formData.idtbUsuario
        }
      };

      if (this.isEditMode) {
        formatoData.id = this.data.formato.id;
        this.updateFormato(formatoData);
      } else {
        this.createFormato(formatoData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createFormato(formatoData: TbFormatoCertificado) {
    if (!this.selectedFile) {
      this.isLoading = false;
      return;
    }

    this._tbFormatoCertificadoService.insertWithFile(formatoData, this.selectedFile).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({ success: true, data: response, action: 'create' });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear formato:', error);
        alert('Error al crear el formato. Por favor intente nuevamente.');
      }
    });
  }

  private updateFormato(formatoData: TbFormatoCertificado) {
    this._tbFormatoCertificadoService.updateWithFile(formatoData, this.selectedFile || undefined).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({ success: true, data: response, action: 'update' });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar formato:', error);
        alert('Error al actualizar el formato. Por favor intente nuevamente.');
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.formatoForm.controls).forEach(key => {
      const control = this.formatoForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this._dialogRef.close({ success: false });
  }

  // Getters para facilitar el acceso a los controles del formulario
  get f() { return this.formatoForm.controls; }

  getErrorMessage(fieldName: string): string {
    const control = this.formatoForm.get(fieldName);
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
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      codigo: 'Código',
      nombreFormato: 'Nombre del formato',
      idtbUsuario: 'Usuario responsable',
      descripcion: 'Descripción'
    };
    return labels[fieldName] || fieldName;
  }

  // Utilidades para el archivo
  getFileSize(): string {
    if (!this.selectedFile) return '';
    const bytes = this.selectedFile.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(): string {
    if (this.selectedFile?.name.toLowerCase().endsWith('.docx')) {
      return 'description'; // Icono para DOCX
    }
    return 'description'; // Icono genérico para documentos
  }
}
