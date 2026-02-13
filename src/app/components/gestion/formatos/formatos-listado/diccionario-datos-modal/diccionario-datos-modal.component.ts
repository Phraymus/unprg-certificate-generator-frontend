import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

interface DataField {
  placeholder: string;
  description: string;
  ejemplo: string;
  tipo: string;
  categoria: string;
}

@Component({
  selector: 'app-diccionario-datos-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatCardModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './diccionario-datos-modal.component.html',
  styleUrls: ['./diccionario-datos-modal.component.scss']
})
export class DiccionarioDatosModalComponent {
  searchTerm: string = '';
  displayedColumns: string[] = ['placeholder', 'description', 'ejemplo', 'tipo'];

  // 📋 Diccionario completo de datos
  allDataFields: DataField[] = [
    // ========================================
    // CATEGORÍA: DATOS DEL PARTICIPANTE
    // ========================================
    {
      placeholder: 'sc_nombres',
      description: 'Nombre completo del participante (nombres + apellidos)',
      ejemplo: 'Juan Carlos Pérez García',
      tipo: 'Texto',
      categoria: 'Participante'
    },
    {
      placeholder: 'participante_nombres',
      description: 'Solo los nombres del participante',
      ejemplo: 'Juan Carlos',
      tipo: 'Texto',
      categoria: 'Participante'
    },
    {
      placeholder: 'participante_apellido_paterno',
      description: 'Apellido paterno del participante',
      ejemplo: 'Pérez',
      tipo: 'Texto',
      categoria: 'Participante'
    },
    {
      placeholder: 'participante_apellido_materno',
      description: 'Apellido materno del participante',
      ejemplo: 'García',
      tipo: 'Texto',
      categoria: 'Participante'
    },
    {
      placeholder: 'participante_dni',
      description: 'DNI del participante',
      ejemplo: '12345678',
      tipo: 'Texto',
      categoria: 'Participante'
    },
    {
      placeholder: 'participante_email',
      description: 'Correo electrónico del participante',
      ejemplo: 'juan.perez@ejemplo.com',
      tipo: 'Texto',
      categoria: 'Participante'
    },
    {
      placeholder: 'participante_telefono',
      description: 'Teléfono del participante',
      ejemplo: '987654321',
      tipo: 'Texto',
      categoria: 'Participante'
    },
    {
      placeholder: 'participante_nota',
      description: 'Nota o calificación del participante',
      ejemplo: '18.5',
      tipo: 'Número',
      categoria: 'Participante'
    },

    // ========================================
    // CATEGORÍA: DATOS DEL EVENTO
    // ========================================
    {
      placeholder: 'evento_codigo',
      description: 'Código único del evento',
      ejemplo: 'CONF-2024-001',
      tipo: 'Texto',
      categoria: 'Evento'
    },
    {
      placeholder: 'evento_nombre',
      description: 'Nombre completo del evento',
      ejemplo: 'Congreso Internacional de Tecnología',
      tipo: 'Texto',
      categoria: 'Evento'
    },
    {
      placeholder: 'evento_fecha_inicio',
      description: 'Fecha de inicio del evento',
      ejemplo: '15/03/2024',
      tipo: 'Fecha',
      categoria: 'Evento'
    },
    {
      placeholder: 'evento_fecha_fin',
      description: 'Fecha de finalización del evento',
      ejemplo: '17/03/2024',
      tipo: 'Fecha',
      categoria: 'Evento'
    },

    // ========================================
    // CATEGORÍA: DATOS DE FECHA
    // ========================================
    {
      placeholder: 'fecha_actual',
      description: 'Fecha actual de generación del certificado',
      ejemplo: '10/02/2026',
      tipo: 'Fecha',
      categoria: 'Fechas'
    },
    {
      placeholder: 'fecha_inscripcion',
      description: 'Fecha de inscripción del participante',
      ejemplo: '01/03/2024',
      tipo: 'Fecha',
      categoria: 'Fechas'
    },

    // ========================================
    // CATEGORÍA: CÓDIGO QR
    // ========================================
    {
      placeholder: 'sc_codigoqr.imagen',
      description: 'Imagen del código QR para verificación del certificado',
      ejemplo: '[Imagen QR]',
      tipo: 'Imagen',
      categoria: 'QR'
    },

    // ========================================
    // CATEGORÍA: FIRMAS (DINÁMICAS)
    // ========================================
    {
      placeholder: '{codigo_firma}.nombre',
      description: 'Nombre del firmante (el código depende de la firma configurada)',
      ejemplo: 'Dr. Carlos Rodríguez',
      tipo: 'Texto',
      categoria: 'Firmas'
    },
    {
      placeholder: '{codigo_firma}.cargo',
      description: 'Cargo del firmante',
      ejemplo: 'Director Académico',
      tipo: 'Texto',
      categoria: 'Firmas'
    },
    {
      placeholder: '{codigo_firma}.entidad',
      description: 'Entidad del firmante',
      ejemplo: 'UNPRG',
      tipo: 'Texto',
      categoria: 'Firmas'
    },
    {
      placeholder: '{codigo_firma}.imagen',
      description: 'Imagen de la firma (rúbrica digitalizada)',
      ejemplo: '[Imagen de firma]',
      tipo: 'Imagen',
      categoria: 'Firmas'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<DiccionarioDatosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  get filteredFields(): DataField[] {
    if (!this.searchTerm) {
      return this.allDataFields;
    }

    const term = this.searchTerm.toLowerCase();
    return this.allDataFields.filter(field =>
      field.placeholder.toLowerCase().includes(term) ||
      field.description.toLowerCase().includes(term) ||
      field.categoria.toLowerCase().includes(term)
    );
  }

  get categorias(): string[] {
    return [...new Set(this.allDataFields.map(f => f.categoria))];
  }

  getFieldsByCategory(categoria: string): DataField[] {
    return this.filteredFields.filter(f => f.categoria === categoria);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Podrías mostrar un snackbar aquí
      console.log('Copiado:', text);
    });
  }

  getCategoryIcon(categoria: string): string {
    const icons: { [key: string]: string } = {
      'Participante': 'person',
      'Evento': 'event',
      'Fechas': 'calendar_today',
      'QR': 'qr_code_2',
      'Firmas': 'draw'
    };
    return icons[categoria] || 'label';
  }

  exportarDiccionario(): void {
    // Implementación básica para exportar
    const content = this.allDataFields.map(field =>
      `${field.placeholder}\t${field.description}\t${field.tipo}\t${field.ejemplo}`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diccionario-datos-certificados.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  close(): void {
    this.dialogRef.close();
  }
}
