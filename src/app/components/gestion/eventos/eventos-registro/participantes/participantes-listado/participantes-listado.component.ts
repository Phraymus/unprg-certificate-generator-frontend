import {Component, inject, Inject, OnInit} from '@angular/core';
import {AgGridAngularCustomComponent} from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {ColDef} from "ag-grid-community";
import {TbParticipanteService, TbCertificateService} from "app/services";
import {TbEvento, TbParticipante} from "~shared/interfaces";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {
  ParticipantesRegistroComponent
} from "app/components/gestion/eventos/eventos-registro/participantes/participantes-registro/participantes-registro.component";
import {
  EstadoParticipanteEnum,
  stringAEnumParticipante,
  valueAStringParticipante
} from "~shared/enums/EstadoParticipanteEnum";
import {MenuOption} from "~shared/classes/ActionButtonsComponent";

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
  private _tbCertificateService: TbCertificateService = inject(TbCertificateService);
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
        const estado = stringAEnumParticipante(valueAStringParticipante(params.value)) || 'Pendiente';
        const colorClass = estado === EstadoParticipanteEnum.Activo ? 'text-success' :
          estado === EstadoParticipanteEnum.Inactivo ? 'text-danger' : 'text-warning';
        return `<span class="${colorClass}">${valueAStringParticipante(params.value)}</span>`;
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

  menuOptions: MenuOption[] = [
    {label: 'Descargar Certificado en formato WORD', icon: 'download', action: "downloadWord"},
    {label: 'Descargar Certificado en formato PDF', icon: 'picture_as_pdf', action: "downloadPdf"},
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

  async onDownload(rowData: TbParticipante) {
    console.log('Generando certificado Word para:', rowData);

    if (!rowData.tbPersona?.id || !rowData.tbEvento?.id) {
      this.showMessage('Datos del participante incompletos', 'error');
      return;
    }

    try {
      // Mostrar mensaje de carga
      this.showMessage('Generando certificado Word...', 'info');

      // Llamar al servicio para generar y descargar el certificado Word
      await this._tbCertificateService.downloadCertificate(
        rowData.tbEvento.id,
        rowData.tbPersona.id,
        rowData
      );

      this.showMessage('Certificado Word generado y descargado exitosamente', 'success');

    } catch (error: any) {
      console.error('Error al generar certificado Word:', error);

      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al generar el certificado Word';

      if (error.status === 400) {
        errorMessage = 'No se pudo generar el certificado: datos del participante inválidos';
      } else if (error.status === 404) {
        errorMessage = 'No se encontró el formato de certificado para este evento';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al generar el certificado';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      this.showMessage(errorMessage, 'error');
    }
  }

  async onDownloadPdf(rowData: TbParticipante) {
    console.log('Generando certificado PDF para:', rowData);

    if (!rowData.tbPersona?.id || !rowData.tbEvento?.id) {
      this.showMessage('Datos del participante incompletos', 'error');
      return;
    }

    try {
      // Mostrar mensaje de carga
      this.showMessage('Generando certificado PDF...', 'info');

      // Llamar al servicio para generar y descargar el certificado PDF
      await this._tbCertificateService.downloadCertificatePdf(
        rowData.tbEvento.id,
        rowData.tbPersona.id,
        rowData
      );

      this.showMessage('Certificado PDF generado y descargado exitosamente', 'success');

    } catch (error: any) {
      console.error('Error al generar certificado PDF:', error);

      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al generar el certificado PDF';

      if (error.status === 400) {
        errorMessage = 'No se pudo generar el certificado: datos del participante inválidos';
      } else if (error.status === 404) {
        errorMessage = 'No se encontró el formato de certificado para este evento';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al generar el certificado';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      this.showMessage(errorMessage, 'error');
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

      const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
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

  onMenuAction($event: { action: string; data: any }) {
    switch ($event.action) {
      case 'downloadWord':
        this.onDownload($event.data);
        break;
      case 'downloadPdf':
        this.onDownloadPdf($event.data);
        break;
    }
  }
}
