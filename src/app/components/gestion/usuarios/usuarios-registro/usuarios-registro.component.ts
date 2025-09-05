import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { TbUsuario } from "~shared/interfaces";
import { TbUsuarioService } from "app/services";

interface DialogData {
  action: 'Registrar' | 'Editar';
  title: string;
  usuario: TbUsuario;
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
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.isEditMode = this.data.action === 'Editar';
  }

  ngOnInit() {
    this.initializeForm();
    if (this.isEditMode && this.data.usuario) {
      this.loadUserData();
    }
  }

  private initializeForm() {
    this.usuarioForm = this._formBuilder.group({
      // Datos de usuario
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: [
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
      telefono: ['', [Validators.pattern(/^\d{9}$/)]],
      fechaNacimiento: [''],
      direccion: [''],

      // Campos adicionales según tu interfaz TbUsuario
      estado: [true, Validators.required],
      rol: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Si es edición, hacer password opcional
    if (this.isEditMode) {
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('confirmPassword')?.clearValidators();
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value && confirmPassword?.value && password.value !== confirmPassword.value) {
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
        telefono: usuario.tbPersona?.telefono || '',
      });
    }
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      this.isLoading = true;
      const formData = this.usuarioForm.value;

      // Preparar datos según tu estructura TbUsuario
      const usuarioData: Partial<TbUsuario> = {
        usuario: formData.usuario,
        tbPersona: {
          nombres: formData.nombres,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
        }
      };

      if (this.isEditMode) {
        usuarioData.id = this.data.usuario.id;
        this.updateUser(usuarioData);
      } else {
        this.createUser(usuarioData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createUser(userData: Partial<TbUsuario>) {
    // this._tbUsuarioService.create(userData).subscribe({
    //   next: (response) => {
    //     this.isLoading = false;
    //     this._dialogRef.close({ success: true, data: response, action: 'create' });
    //   },
    //   error: (error) => {
    //     this.isLoading = false;
    //     console.error('Error al crear usuario:', error);
    //     // Aquí puedes mostrar un snackbar o notificación de error
    //   }
    // });
  }

  private updateUser(userData: Partial<TbUsuario>) {
    // this._tbUsuarioService.update(userData.id!, userData).subscribe({
    //   next: (response) => {
    //     this.isLoading = false;
    //     this._dialogRef.close({ success: true, data: response, action: 'update' });
    //   },
    //   error: (error) => {
    //     this.isLoading = false;
    //     console.error('Error al actualizar usuario:', error);
    //     // Aquí puedes mostrar un snackbar o notificación de error
    //   }
    // });
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
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      nombres: 'Nombres',
      apellidoPaterno: 'Apellido paterno',
      apellidoMaterno: 'Apellido materno',
      dni: 'DNI',
      email: 'Email',
      telefono: 'Teléfono',
      rol: 'Rol'
    };
    return labels[fieldName] || fieldName;
  }
}
