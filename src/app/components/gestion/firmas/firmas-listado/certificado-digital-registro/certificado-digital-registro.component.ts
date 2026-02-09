import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TbCertificadoDigitalService } from 'app/services/tbCertificadoDigitalService.service';
import { TbCertificadoDigitalUploadRequest } from '~interfaces/TbCertificadoDigitalUploadRequest.interface';
import { TbCertificadoDigital } from '~interfaces/TbCertificadoDigital.interface';

interface DialogData {
  firma: any; // ideal: TbFirma
}

@Component({
  selector: 'app-certificado-digital-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './certificado-digital-registro.component.html',
  styleUrl: './certificado-digital-registro.component.scss',
})
export class CertificadoDigitalRegistroComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _dialogRef = inject(MatDialogRef<CertificadoDigitalRegistroComponent>);
  private _snackBar = inject(MatSnackBar);
  private _tbCertDigitalService = inject(TbCertificadoDigitalService);

  form!: FormGroup;

  isLoading = false;
  selectedFile: File | null = null;
  selectedFileName = '';

  certificados: TbCertificadoDigital[] = [];
  activo: TbCertificadoDigital | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      aliasCert: [''],
      password: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.load();
  }

  // ---------------------------
  // Helpers para el TEMPLATE
  // ---------------------------
  private anyOf(x: unknown): any {
    return x as any;
  }

  private toBoolEstado(estado: any): boolean {
    if (estado === true) return true;
    if (estado === false) return false;

    if (typeof estado === 'number') return estado === 1;

    if (typeof estado === 'string') {
      const s = estado.trim().toLowerCase();
      return s === '1' || s === 'true' || s === 'activo';
    }

    return false;
  }

  isActivo(c: TbCertificadoDigital): boolean {
    return this.toBoolEstado(this.anyOf(c)?.estado);
  }

  certId(c: TbCertificadoDigital | null): string {
    const id = this.anyOf(c)?.id;
    return id != null ? String(id) : '';
  }

  displayCertName(c: TbCertificadoDigital | null, prefix = 'Cert #'): string {
    if (!c) return '-';
    const a = this.anyOf(c);

    const subject = a?.subjectDn;
    const alias = a?.aliasCert;
    const id = a?.id;

    return subject || alias || (id != null ? `${prefix}${id}` : '-');
  }

  displaySerial(c: TbCertificadoDigital | null): string {
    if (!c) return '-';
    const a = this.anyOf(c);
    return a?.serialNumber || a?.serial || a?.numeroSerie || '-';
  }

  displayDesde(c: TbCertificadoDigital | null): string {
    if (!c) return '-';
    const a = this.anyOf(c);
    const fecha = a?.validoDesde || a?.desde;
    if (!fecha) return '-';

    // Formatear fecha si viene en formato ISO
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  displayHasta(c: TbCertificadoDigital | null): string {
    if (!c) return '-';
    const a = this.anyOf(c);
    const fecha = a?.validoHasta || a?.hasta;
    if (!fecha) return '-';

    // Formatear fecha si viene en formato ISO
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  // ---------------------------
  // Data
  // ---------------------------
  private load() {
    const idFirma = this.data?.firma?.id;
    if (!idFirma) return;

    this._tbCertDigitalService.findAllByFirma(idFirma).subscribe({
      next: (res: any) => {
        this.certificados = (res?.data || []) as TbCertificadoDigital[];
        this.activo = this.certificados.find(x => this.isActivo(x)) || null;
      },
      error: (err) => {
        console.error('Error al cargar certificados:', err);
        this.showMessage('No se pudo cargar certificados digitales', 'error');
      },
    });
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const name = (file.name || '').toLowerCase();

    // Validar extensión
    if (!name.endsWith('.p12') && !name.endsWith('.pfx')) {
      this.showMessage('Sube un archivo .p12 o .pfx', 'error');
      input.value = ''; // Limpiar input
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showMessage('El archivo no debe superar 10MB', 'error');
      input.value = ''; // Limpiar input
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  upload() {
    const idFirma = this.data?.firma?.id;
    if (!idFirma) {
      this.showMessage('Firma inválida', 'error');
      return;
    }

    if (!this.selectedFile) {
      this.showMessage('Selecciona el archivo .p12/.pfx', 'error');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showMessage('Completa todos los campos requeridos', 'error');
      return;
    }

    const req: TbCertificadoDigitalUploadRequest = {
      idFirma,
      password: this.form.value.password,
      aliasCert: this.form.value.aliasCert || undefined,
      file: this.selectedFile,
    };

    this.isLoading = true;
    this._tbCertDigitalService.upload(req).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Respuesta del servidor:', response);

        this.showMessage('Certificado digital registrado correctamente', 'success');

        // Limpiar formulario
        this.selectedFile = null;
        this.selectedFileName = '';
        this.form.reset({
          aliasCert: '',
          password: ''
        });

        // Recargar lista
        this.load();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al registrar certificado:', err);

        // Mostrar mensaje de error más específico
        let errorMsg = 'Error al registrar certificado digital';
        if (err.error?.mensaje) {
          errorMsg = err.error.mensaje;
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }

        this.showMessage(errorMsg, 'error');
      },
    });
  }

  /**
   * Nota: La funcionalidad de activar/desactivar certificados no está implementada
   * en el backend actual. El backend automáticamente activa el nuevo certificado
   * y desactiva los anteriores al hacer el upload.
   */
  activar(cert: TbCertificadoDigital) {
    this.showMessage(
      'El certificado se activa automáticamente al registrarlo. Los anteriores se desactivan.',
      'info'
    );
  }

  cerrar() {
    this._dialogRef.close({ success: true });
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this._snackBar.open(message, 'Cerrar', {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    });
  }

  get f() {
    return this.form.controls;
  }
}
