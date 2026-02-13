import {Component, inject, OnInit} from '@angular/core';
import {AgGridAngularCustomComponent} from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {ColDef} from "ag-grid-community";
import {TbEventoService} from "app/services";
import {TbEvento} from "~shared/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {EventosRegistroComponent} from "app/components/gestion/eventos/eventos-registro/eventos-registro.component";
import {MatSnackBar} from '@angular/material/snack-bar';
import {MenuOption} from "~shared/classes/ActionButtonsComponent";
import {
  ParticipantesListadoComponent
} from "app/components/gestion/eventos/eventos-registro/participantes/participantes-listado/participantes-listado.component";
import {
  AsignarFormatoListadoComponent
} from "app/components/gestion/eventos/eventos-listado/asignar-formato/asignar-formato-listado/asignar-formato-listado.component";

@Component({
  selector: 'app-eventos-listado',
  imports: [
    AgGridAngularCustomComponent,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle
  ],
  templateUrl: './eventos-listado.component.html',
  styleUrl: './eventos-listado.component.scss'
})
export class EventosListadoComponent implements OnInit {
  private _tbEventoService: TbEventoService = inject(TbEventoService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  rowData: TbEvento[] = [];

  colDefs: ColDef[] = [
    {field: "codigo", headerName: "Código", width: 120},
    {field: "nombre", headerName: "Nombre del Evento", flex: 1},
    {
      field: "fechaInicio",
      headerName: "Fecha Inicio",
      width: 140,
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString('es-ES');
        }
        return '';
      }
    },
    {
      field: "fechaFin",
      headerName: "Fecha Fin",
      width: 140,
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString('es-ES');
        }
        return '';
      }
    },
    {
      field: "duracion",
      headerName: "Duración",
      width: 100,
      valueGetter: (params) => {
        if (params.data?.fechaInicio && params.data?.fechaFin) {
          const inicio = new Date(params.data.fechaInicio);
          const fin = new Date(params.data.fechaFin);
          const diffTime = Math.abs(fin.getTime() - inicio.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        }
        return '';
      }
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 120,
      valueGetter: (params) => {
        if (params.data?.fechaInicio && params.data?.fechaFin) {
          const hoy = new Date();
          const inicio = new Date(params.data.fechaInicio);
          const fin = new Date(params.data.fechaFin);

          hoy.setHours(0, 0, 0, 0);
          inicio.setHours(0, 0, 0, 0);
          fin.setHours(0, 0, 0, 0);

          if (hoy < inicio) {
            return 'Próximo';
          } else if (hoy >= inicio && hoy <= fin) {
            return 'En curso';
          } else {
            return 'Finalizado';
          }
        }
        return 'Sin fechas';
      },
      cellStyle: (params) => {
        const estado = params.value;
        switch (estado) {
          case 'Próximo':
            return {color: '#1976d2', fontWeight: 'bold'};
          case 'En curso':
            return {color: '#388e3c', fontWeight: 'bold'};
          case 'Finalizado':
            return {color: '#d32f2f', fontWeight: 'bold'};
          default:
            return {color: '#757575', fontStyle: 'italic'};
        }
      }
    }
  ];

  menuOptions: MenuOption[] = [
    {
      icon: 'visibility',
      label: 'Ver participantes',
      action: 'verParticipantes',
    },
    {
      icon: 'folder',
      label: 'Asignar formatos',
      action: 'asignFormato',
    },
    {
      label: 'Generar enlace de registro',
      icon: 'link',
      action: "linkGenerate"
    },
  ];

  ngOnInit(): void {
    this.loadEventos();
  }

  private loadEventos(): void {
    this._tbEventoService.findAll().subscribe({
      next: (res) => {
        this.rowData = res;
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.showMessage('Error al cargar los eventos', 'error');
      }
    });
  }

  onGridReady(event: any) {
    console.log('Grid listo:', event);
  }

  onAdd() {
    const data = {
      action: 'Registrar' as const,
      title: 'Registrar Evento',
      evento: {} as TbEvento
    };

    const dialogRef = this._matDialog.open(EventosRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'create') {
          this.showMessage('Evento creado exitosamente', 'success');
          this.loadEventos();
        }
      }
    });
  }

  onEdit(rowData: TbEvento) {
    console.log('Editando evento:', rowData);

    const data = {
      action: 'Editar' as const,
      title: 'Editar Evento',
      evento: rowData
    };

    const dialogRef = this._matDialog.open(EventosRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'update') {
          this.showMessage('Evento actualizado exitosamente', 'success');
          this.loadEventos();
        }
      }
    });
  }

  onView(rowData: TbEvento) {
    console.log('Viendo detalles del evento:', rowData);

    const data = {
      action: 'Ver' as const,
      title: 'Detalles del Evento',
      evento: rowData,
      readOnly: true
    };

    this._matDialog.open(EventosRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data
    });
  }

  onDownload(rowData: TbEvento) {
    console.log('Descargando evento:', rowData);

    try {
      const exportData = {
        codigo: rowData.codigo || '',
        nombre: rowData.nombre || '',
        fechaInicio: rowData.fechaInicio || '',
        fechaFin: rowData.fechaFin || '',
        fechaInicioFormateada: rowData.fechaInicio ? new Date(rowData.fechaInicio).toLocaleDateString('es-ES') : '',
        fechaFinFormateada: rowData.fechaFin ? new Date(rowData.fechaFin).toLocaleDateString('es-ES') : ''
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `evento_${rowData.codigo || 'sin_codigo'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showMessage('Datos del evento descargados exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar:', error);
      this.showMessage('Error al descargar los datos', 'error');
    }
  }

  onDelete(rowData: TbEvento) {
    console.log('Eliminando evento:', rowData);

    const confirmMessage = `¿Estás seguro de eliminar el evento "${rowData.nombre}" (${rowData.codigo})?`;

    if (confirm(confirmMessage)) {
      this._tbEventoService.delete(rowData).subscribe({
        next: (response) => {
          this.showMessage('Evento eliminado exitosamente', 'success');
          this.loadEventos();
        },
        error: (error) => {
          console.error('Error al eliminar evento:', error);
          this.showMessage('Error al eliminar el evento', 'error');
        }
      });
    }
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

  private exportGridData() {
    try {
      const csvData = this.rowData.map(evento => ({
        Código: evento.codigo || '',
        Nombre: evento.nombre || '',
        'Fecha Inicio': evento.fechaInicio ? new Date(evento.fechaInicio).toLocaleDateString('es-ES') : '',
        'Fecha Fin': evento.fechaFin ? new Date(evento.fechaFin).toLocaleDateString('es-ES') : ''
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
      link.download = `eventos_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      this.showMessage('Lista de eventos exportada exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      this.showMessage('Error al exportar los datos', 'error');
    }
  }

  public exportarEventos() {
    this.exportGridData();
  }

  handleMenuAction($event: { action: string; data: any }) {
    switch ($event.action) {
      case 'asignFormato':
        this.asignarFormato($event.data);
        break;
      case 'verParticipantes':
        this.verParticipantes($event.data);
        break;
      case 'linkGenerate':
        this.linkGenerate($event.data);
        break;
      default:
        this.showMessage(`Acción desconocida: ${$event.action}`);
    }
  }

  asignarFormato(tbEvento: TbEvento) {
    const dialogRef = this._matDialog.open(AsignarFormatoListadoComponent, {
            width: '90vw',
            maxWidth: '1200px',
            maxHeight: '90vh',
            data: {
              tbEvento: tbEvento,
            },
            disableClose: true,
            panelClass: 'custom-dialog-container'
          });
  }

  /**
   * Genera el enlace de inscripción pública para el evento y lo copia al portapapeles
   */
  linkGenerate(evento: TbEvento) {
    try {
      // Generar la URL completa del formulario público
      const baseUrl = window.location.origin;
      const registrationUrl = `${baseUrl}/inscripcion/evento/${evento.id}`;

      // Copiar al portapapeles
      navigator.clipboard.writeText(registrationUrl).then(() => {
        // Éxito al copiar
        this.showMessage('✓ Enlace copiado al portapapeles', 'success');

        // Mostrar información adicional del enlace
        this.showLinkInfoSnackbar(evento, registrationUrl);
      }).catch(err => {
        // Error al copiar - método alternativo
        console.error('Error al copiar con clipboard API:', err);
        this.copyToClipboardFallback(registrationUrl);
        this.showMessage('✓ Enlace copiado al portapapeles', 'success');
        this.showLinkInfoSnackbar(evento, registrationUrl);
      });

    } catch (error) {
      console.error('Error al generar enlace:', error);
      this.showMessage('Error al generar el enlace de inscripción', 'error');
    }
  }

  /**
   * Método alternativo para copiar al portapapeles (fallback para navegadores antiguos)
   */
  private copyToClipboardFallback(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      textArea.remove();
    } catch (err) {
      console.error('Error en fallback de copia:', err);
      textArea.remove();
      throw err;
    }
  }

  /**
   * Muestra un snackbar con información del enlace generado
   */
  private showLinkInfoSnackbar(evento: TbEvento, url: string): void {
    console.log('📋 Enlace de inscripción generado:');
    console.log(`Evento: ${evento.nombre} (${evento.codigo})`);
    console.log(`URL: ${url}`);

    // Mostrar snackbar informativo con mayor duración
    const snackBarRef = this._snackBar.open(
      `Enlace de "${evento.nombre}" copiado al portapapeles`,
      'Ver URL',
      {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      }
    );

    // Si el usuario hace clic en "Ver URL", mostrar el enlace en consola y alert
    snackBarRef.onAction().subscribe(() => {
      const message = `Enlace de inscripción para "${evento.nombre}":\n\n${url}\n\nComparte este enlace con los participantes para que puedan inscribirse al evento.`;
      alert(message);

      // También loguear en consola para facilitar
      console.log('═══════════════════════════════════════');
      console.log('📋 ENLACE DE INSCRIPCIÓN');
      console.log('═══════════════════════════════════════');
      console.log(`🎯 Evento: ${evento.nombre}`);
      console.log(`🔖 Código: ${evento.codigo}`);
      console.log(`🔗 URL: ${url}`);
      console.log('═══════════════════════════════════════');
    });
  }

  verParticipantes(evento: any) {
    const dialogRef = this._matDialog.open(ParticipantesListadoComponent, {
      width: '95vw',
      maxWidth: '1400px',
      data: {evento},
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal de participantes cerrado');
    });
  }
}
