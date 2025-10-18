import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TbUsuario } from "~shared/interfaces";
import { TbUsuarioService } from "app/services";

interface DialogData {
  action: 'Registrar' | 'Editar' | 'Ver';
  title: string;
  usuario: TbUsuario;
  readOnly?: boolean;
}

@Component({
  selector: 'app-usuarios-registro',
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
    MatIconModule
  ],
  templateUrl: './usuarios-registro.component.html',
  styleUrl: './usuarios-registro.component.scss'
})
export class UsuariosRegistroComponent implements OnInit {
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _tbUsuarioService: TbUsuarioService = inject(TbUsuarioService);
  private _dialogRef: MatDialogRef<UsuariosRegistroComponent> = inject(MatDialogRef<UsuariosRegistroComponent>);

  usuarioForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  isReadOnlyMode = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.isEditMode = this.data.action === 'Editar';
    this.isReadOnlyMode = this.data.action === 'Ver' || this.data.readOnly === true;
  }

  ngOnInit() {
    this.initializeForm();
    if ((this.isEditMode || this.isReadOnlyMode) && this.data.usuario) {
      this.loadUserData();
    }

    // Si es modo de solo lectura, deshabilitar todo el formulario
    if (this.isReadOnlyMode) {
      this.usuarioForm.disable();
    }
  }

  private initializeForm() {
    this.usuarioForm = this._formBuilder.group({
      // Datos de usuario
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      clave: [
        '',
        this.isEditMode
          ? [] // En edición, password es opcional
          : [Validators.required, Validators.minLength(6)]
      ],
      confirmPassword: [''],

      // Datos de persona
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: [''],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{9}$/)]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Si es edición, hacer password opcional
    if (this.isEditMode) {
      this.usuarioForm.get('clave')?.clearValidators();
      this.usuarioForm.get('confirmPassword')?.clearValidators();
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const clave = form.get('clave');
    const confirmPassword = form.get('confirmPassword');

    if (clave?.value && confirmPassword?.value && clave.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  private loadUserData() {
    if (this.data.usuario) {
      const usuario = this.data.usuario;
      this.usuarioForm.patchValue({
        usuario: usuario.usuario,
        nombres: usuario.tbPersona?.nombres || '',
        apellidoPaterno: usuario.tbPersona?.apellidoPaterno || '',
        apellidoMaterno: usuario.tbPersona?.apellidoMaterno || '',
        dni: usuario.tbPersona?.dni || '',
        email: usuario.tbPersona?.email || '',
        telefono: usuario.tbPersona?.telefono || ''
      });
    }
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      this.isLoading = true;
      const formData = this.usuarioForm.value;

      // Preparar datos según tu estructura TbUsuario
      const usuarioData: TbUsuario = {
        usuario: formData.usuario,
        tbPersona: {
          nombres: formData.nombres,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono
        }
      };

      // Solo agregar clave si se proporcionó
      if (formData.clave) {
        usuarioData.clave = formData.clave;
      }

      if (this.isEditMode) {
        usuarioData.id = this.data.usuario.id;
        // Mantener el ID de la persona si existe
        if (this.data.usuario.tbPersona?.id) {
          usuarioData.tbPersona!.id = this.data.usuario.tbPersona.id;
        }
        this.updateUser(usuarioData);
      } else {
        this.createUser(usuarioData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createUser(userData: TbUsuario) {
    this._tbUsuarioService.insert(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({ success: true, data: response, action: 'create' });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear usuario:', error);
      }
    });
  }

  private updateUser(userData: TbUsuario) {
    this._tbUsuarioService.update(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._dialogRef.close({ success: true, data: response, action: 'update' });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar usuario:', error);
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this._dialogRef.close({ success: false });
  }

  // Getters para facilitar el acceso a los controles del formulario
  get f() { return this.usuarioForm.controls; }

  getErrorMessage(fieldName: string): string {
    const control = this.usuarioForm.get(fieldName);
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
    if (control?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      usuario: 'Usuario',
      clave: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      nombres: 'Nombres',
      apellidoPaterno: 'Apellido paterno',
      apellidoMaterno: 'Apellido materno',
      dni: 'DNI',
      email: 'Email',
      telefono: 'Teléfono'
    };
    return labels[fieldName] || fieldName;
  }
}
