import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TbFirma } from "~interfaces/index";
import {TbCertificadoDigitalService} from "~services/tbCertificadoDigitalService.service";

interface DialogData {
  firma: TbFirma;
  orden: number;
  existingConfig?: any; // Configuración existente si está editando
}

@Component({
  selector: 'app-configurar-firma',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './configurar-firma.component.html',
  styleUrl: './configurar-firma.component.scss'
})
export class ConfigurarFirmaComponent implements OnInit {
  private _fb: FormBuilder = inject(FormBuilder);
  private _dialogRef: MatDialogRef<ConfigurarFirmaComponent> = inject(MatDialogRef);
  private _tbCertificadoDigitalService: TbCertificadoDigitalService = inject(TbCertificadoDigitalService);

  firma: TbFirma;
  orden: number;
  form!: FormGroup;
  tieneCertificadoDigital = false;
  cargandoCertificado = true;

  layoutModes = [
    { value: 'ABS', label: 'Absoluto (Posición manual)', icon: 'pin_drop' },
    { value: 'STACK', label: 'Apilado vertical', icon: 'view_agenda' },
    { value: 'COLUMN', label: 'Columnas horizontales', icon: 'view_column' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.firma = data.firma;
    this.orden = data.orden;
  }

  ngOnInit() {
    this.initForm();
    this.verificarCertificadoDigital();

    // Escuchar cambios en layoutMode para habilitar/deshabilitar campos
    this.form.get('layoutMode')?.valueChanges.subscribe(mode => {
      this.updateFieldsBasedOnLayout(mode);
    });

    // Escuchar cambios en firmarDigital para validar certificado
    this.form.get('firmarDigital')?.valueChanges.subscribe(enabled => {
      if (enabled && !this.tieneCertificadoDigital) {
        this.form.patchValue({ firmarDigital: false }, { emitEvent: false });
        alert('Esta firma no tiene un certificado digital activo. No se puede habilitar la firma digital.');
      }
    });
  }

  private initForm() {
    const existing = this.data.existingConfig;

    this.form = this._fb.group({
      // Configuración básica
      orden: [existing?.orden || this.orden, [Validators.required, Validators.min(1)]],
      firmarDigital: [existing?.firmarDigital === '1' || false],
      firmaVisible: [existing?.firmaVisible !== '0'], // Por defecto true

      // Posicionamiento
      pagina: [existing?.pagina || 1, [Validators.required, Validators.min(1)]],
      layoutMode: [existing?.layoutMode || 'ABS', Validators.required],

      // Coordenadas (solo para ABS)
      posX: [existing?.posX || 50, [Validators.min(0)]],
      posY: [existing?.posY || 50, [Validators.min(0)]],

      // Dimensiones
      ancho: [existing?.ancho || 150, [Validators.required, Validators.min(10)]],
      alto: [existing?.alto || 60, [Validators.required, Validators.min(10)]],

      // Espaciado (para STACK/COLUMN)
      gapX: [existing?.gapX || 10, [Validators.min(0)]],
      gapY: [existing?.gapY || 10, [Validators.min(0)]],

      // Metadatos
      reason: [existing?.reason || 'Certificado académico oficial', [Validators.maxLength(200)]],
      location: [existing?.location || 'Universidad Nacional Pedro Ruiz Gallo', [Validators.maxLength(200)]]
    });

    this.updateFieldsBasedOnLayout(this.form.value.layoutMode);
  }

  private updateFieldsBasedOnLayout(mode: string) {
    const posXControl = this.form.get('posX');
    const posYControl = this.form.get('posY');
    const gapXControl = this.form.get('gapX');
    const gapYControl = this.form.get('gapY');

    if (mode === 'ABS') {
      // Absoluto: requerir posX, posY
      posXControl?.setValidators([Validators.required, Validators.min(0)]);
      posYControl?.setValidators([Validators.required, Validators.min(0)]);
      gapXControl?.clearValidators();
      gapYControl?.clearValidators();
    } else if (mode === 'STACK') {
      // Stack: solo requiere gapY
      posXControl?.clearValidators();
      posYControl?.clearValidators();
      gapXControl?.clearValidators();
      gapYControl?.setValidators([Validators.required, Validators.min(0)]);
    } else if (mode === 'COLUMN') {
      // Column: solo requiere gapX
      posXControl?.clearValidators();
      posYControl?.clearValidators();
      gapXControl?.setValidators([Validators.required, Validators.min(0)]);
      gapYControl?.clearValidators();
    }

    posXControl?.updateValueAndValidity();
    posYControl?.updateValueAndValidity();
    gapXControl?.updateValueAndValidity();
    gapYControl?.updateValueAndValidity();
  }

  private verificarCertificadoDigital() {
    if (!this.firma.id) {
      this.cargandoCertificado = false;
      return;
    }

    this._tbCertificadoDigitalService.findActiveByFirmaId(this.firma.id).subscribe({
      next: (certificado) => {
        this.tieneCertificadoDigital = !!certificado;
        this.cargandoCertificado = false;

        if (!this.tieneCertificadoDigital) {
          // Si no tiene certificado, deshabilitar opción de firma digital
          this.form.patchValue({ firmarDigital: false });
        }
      },
      error: (error) => {
        console.error('Error al verificar certificado digital:', error);
        this.tieneCertificadoDigital = false;
        this.cargandoCertificado = false;
      }
    });
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const config = {
      ...this.form.value,
      firmarDigital: this.form.value.firmarDigital ? '1' : '0',
      firmaVisible: this.form.value.firmaVisible ? '1' : '0'
    };

    this._dialogRef.close({ success: true, config });
  }

  onCancel() {
    this._dialogRef.close({ success: false });
  }

  // Helpers para el template
  isAbsoluteMode(): boolean {
    return this.form.get('layoutMode')?.value === 'ABS';
  }

  isStackMode(): boolean {
    return this.form.get('layoutMode')?.value === 'STACK';
  }

  isColumnMode(): boolean {
    return this.form.get('layoutMode')?.value === 'COLUMN';
  }
}
