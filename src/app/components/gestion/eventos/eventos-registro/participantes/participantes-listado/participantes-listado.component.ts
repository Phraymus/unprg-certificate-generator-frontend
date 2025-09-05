import { Component, inject, OnInit, Inject } from '@angular/core';
import { AgGridAngularCustomComponent } from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import { ColDef } from "ag-grid-community";
import { TbParticipanteService, TbEventoService } from "app/services";
import { TbParticipante, TbEvento } from "~shared/interfaces";
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import {
  ParticipantesRegistroComponent
} from "app/components/gestion/eventos/eventos-registro/participantes/participantes-registro/participantes-registro.component";

interface ParticipantesDialogData {
  evento: TbEvento;
}

@Component({
  selector: 'app-participantes-listado',
  imports: [
    AgGridAngularCustomComponent,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    MatIcon,
    MatCardFooter
  ],
  templateUrl: './participantes-listado.component.html',
  styleUrls: ['./participantes-listado.component.scss']
})
export class ParticipantesListadoComponent implements OnInit {
  private _tbParticipanteService: TbParticipanteService = inject(TbParticipanteService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _dialogRef: MatDialogRef<ParticipantesListadoComponent> = inject(MatDialogRef<ParticipantesListadoComponent>);

  rowData: TbParticipante[] = [];

  colDefs: ColDef[] = [
    {
      field: "tbPersona.dni",
      headerName: "DNI",
      width: 120
    },
    {
      field: "tbPersona.nombres",
      headerName: "Nombres",
      valueGetter: (params) => {
        return params.data?.tbPersona?.nombres || '';
      }
    },
    {
      field: "tbPersona.apellidoPaterno",
      headerName: "Apellidos",
      valueGetter: (params) => {
        const paterno = params.data?.tbPersona?.apellidoPaterno || '';
        const materno = params.data?.tbPersona?.apellidoMaterno || '';
        return `${paterno} ${materno}`.trim();
      }
    },
    {
      field: "tbPersona.email",
      headerName: "Email",
      valueGetter: (params) => {
        return params.data?.tbPersona?.email || '';
      }
    },
    {
      field: "tbPersona.telefono",
      headerName: "Teléfono",
      width: 120,
      valueGetter: (params) => {
        return params.data?.tbPersona?.telefono || '';
      }
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 120,
      cellRenderer: (params: any) => {
        const estado = params.value || 'Pendiente';
        const colorClass = estado === 'Activo' ? 'text-success' :
          estado === 'Inactivo' ? 'text-danger' : 'text-warning';
        return `<span class="${colorClass}">${estado}</span>`;
      }
    },
    {
      field: "fechaInscripcion",
      headerName: "Fecha Inscripción",
      width: 150,
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString('es-ES');
        }
        return '';
      }
    },
    {
      field: "nota",
      headerName: "Nota",
      width: 80,
      cellRenderer: (params: any) => {
        if (params.value !== null && params.value !== undefined) {
          return params.value.toFixed(1);
        }
        return '-';
      }
    }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ParticipantesDialogData) {
    console.log(data);
  }

  ngOnInit(): void {
    this.loadParticipantes();
  }

  private loadParticipantes(): void {
    if (!this.data.evento.id) return;

    this._tbParticipanteService.findAllByIdEvento(this.data.evento.id).subscribe({
      next: (res) => {
        this.rowData = res;
      },
      error: (error) => {
        console.error('Error al cargar participantes:', error);
        this.showMessage('Error al cargar los participantes', 'error');
      }
    });
  }

  // Eventos del grid
  onGridReady(event: any) {
    console.log('Grid listo:', event);
  }

  // Eventos de los botones
  onAdd() {
    const data = {
      action: 'Registrar' as const,
      title: 'Registrar Participante',
      participante: {
        tbEvento: this.data.evento,
        estado: 'Activo',
        fechaInscripcion: new Date().toISOString().split('T')[0]
      } as TbParticipante,
      evento: this.data.evento
    };

    const dialogRef = this._matDialog.open(ParticipantesRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'create') {
          this.showMessage('Participante registrado exitosamente', 'success');
          this.loadParticipantes();
        }
      }
    });
  }

  onEdit(rowData: TbParticipante) {
    console.log('Editando participante:', rowData);

    const data = {
      action: 'Editar' as const,
      title: 'Editar Participante',
      participante: rowData,
      evento: this.data.evento
    };

    const dialogRef = this._matDialog.open(ParticipantesRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'update') {
          this.showMessage('Participante actualizado exitosamente', 'success');
          this.loadParticipantes();
        }
      }
    });
  }

  onView(rowData: TbParticipante) {
    console.log('Viendo detalles:', rowData);

    const data = {
      action: 'Ver' as const,
      title: 'Detalles del Participante',
      participante: rowData,
      evento: this.data.evento,
      readOnly: true
    };

    this._matDialog.open(ParticipantesRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data
    });
  }

  onDownload(rowData: TbParticipante) {
    console.log('Descargando:', rowData);

    try {
      const exportData = {
        evento: {
          codigo: this.data.evento.codigo,
          nombre: this.data.evento.nombre,
          fechaInicio: this.data.evento.fechaInicio,
          fechaFin: this.data.evento.fechaFin
        },
        participante: {
          dni: rowData.tbPersona?.dni || '',
          nombres: rowData.tbPersona?.nombres || '',
          apellidoPaterno: rowData.tbPersona?.apellidoPaterno || '',
          apellidoMaterno: rowData.tbPersona?.apellidoMaterno || '',
          email: rowData.tbPersona?.email || '',
          telefono: rowData.tbPersona?.telefono || '',
          estado: rowData.estado || '',
          fechaInscripcion: rowData.fechaInscripcion || '',
          nota: rowData.nota || null
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `participante_${rowData.tbPersona?.dni}_${this.data.evento.codigo}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showMessage('Datos del participante descargados exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar:', error);
      this.showMessage('Error al descargar los datos', 'error');
    }
  }

  onDelete(rowData: TbParticipante) {
    console.log('Eliminando:', rowData);

    const nombreCompleto = `${rowData.tbPersona?.nombres || ''} ${rowData.tbPersona?.apellidoPaterno || ''}`.trim();
    const confirmMessage = `¿Estás seguro de eliminar al participante "${nombreCompleto}" (DNI: ${rowData.tbPersona?.dni})?`;

    if (confirm(confirmMessage)) {
      this._tbParticipanteService.delete(rowData).subscribe({
        next: (response) => {
          this.showMessage('Participante eliminado exitosamente', 'success');
          this.loadParticipantes();
        },
        error: (error) => {
          console.error('Error al eliminar participante:', error);
          this.showMessage('Error al eliminar el participante', 'error');
        }
      });
    }
  }

  onClose() {
    this._dialogRef.close();
  }

  // Métodos auxiliares
  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'end' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };

    this._snackBar.open(message, 'Cerrar', config);
  }

  // Método público para exportar desde el template si lo necesitas
  public exportarParticipantes() {
    try {
      const csvData = this.rowData.map(participante => ({
        DNI: participante.tbPersona?.dni || '',
        Nombres: participante.tbPersona?.nombres || '',
        'Apellido Paterno': participante.tbPersona?.apellidoPaterno || '',
        'Apellido Materno': participante.tbPersona?.apellidoMaterno || '',
        Email: participante.tbPersona?.email || '',
        Teléfono: participante.tbPersona?.telefono || '',
        Estado: participante.estado || '',
        'Fecha Inscripción': participante.fechaInscripcion || '',
        Nota: participante.nota?.toString() || ''
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participantes_${this.data.evento.codigo}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      this.showMessage('Lista de participantes exportada exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      this.showMessage('Error al exportar los datos', 'error');
    }
  }
}
