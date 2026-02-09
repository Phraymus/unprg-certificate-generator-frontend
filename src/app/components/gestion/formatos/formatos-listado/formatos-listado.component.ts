import {Component, inject, OnInit} from '@angular/core';
import {AgGridAngularCustomComponent} from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {ColDef} from "ag-grid-community";
import {TbFormatoCertificadoFirmaService, TbFormatoCertificadoService} from "app/services";
import {TbEvento, TbFormatoCertificado} from "~shared/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormatosRegistroComponent} from "app/components/gestion/formatos/formatos-registro/formatos-registro.component";
import {MatIcon} from "@angular/material/icon";
import {MenuOption} from "~shared/classes/ActionButtonsComponent";
import {
  AsignarFirmasComponent
} from "app/components/gestion/formatos/formatos-listado/asignar-firmas/asignar-firmas.component";

@Component({
  selector: 'app-formato-listado',
  imports: [
    AgGridAngularCustomComponent,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
  ],
  templateUrl: './formatos-listado.component.html',
  styleUrl: './formatos-listado.component.scss'
})
export class FormatosListadoComponent implements OnInit {
  private _tbFormatoCertificadoService: TbFormatoCertificadoService = inject(TbFormatoCertificadoService);
  private _tbFormatoCertificadoFirmaService: TbFormatoCertificadoFirmaService = inject(TbFormatoCertificadoFirmaService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  rowData: TbFormatoCertificado[] = [];

  colDefs: ColDef[] = [
    {field: "codigo", headerName: "Código", width: 120},
    {field: "nombreFormato", headerName: "Nombre del Formato", flex: 1, minWidth: 200},
    {
      field: "rutaFormato",
      headerName: "Archivo",
      width: 150,
      cellRenderer: (params: any) => {
        if (params.value) {
          const fileName = params.value.split('/').pop() || 'Archivo';
          return `<span class="file-link" title="${params.value}">${fileName}</span>`;
        }
        return '<span class="no-file">Sin archivo</span>';
      }
    },
    {
      field: "tbUsuario.usuario",
      headerName: "Creado por",
      width: 130
    },
    // {
    //   field: "fechaCreacion",
    //   headerName: "Fecha Creación",
    //   width: 140,
    //   valueFormatter: (params) => {
    //     if (params.value) {
    //       return new Date(params.value).toLocaleDateString();
    //     }
    //     return '';
    //   }
    // },
    // {
    //   field: "tamanoArchivo",
    //   headerName: "Tamaño",
    //   width: 100,
    //   valueFormatter: (params) => {
    //     if (params.value) {
    //       return this.formatFileSize(params.value);
    //     }
    //     return '';
    //   }
    // }
  ];

  menuOptions: MenuOption[] = [
    {
      label: 'Asignar firmas',
      icon: 'edit',
      action: "asignSignatures"
    },
    {label: 'Descargar formato', icon: 'download', action: "downloadTemplate"},
    {label: 'Ver diccionario de datos', icon: 'book', action: "dataDictionary"},
  ];

  ngOnInit(): void {
    this.loadFormatos();
  }

  private loadFormatos(): void {
    this._tbFormatoCertificadoService.findAll().subscribe({
      next: (res) => {
        this.rowData = res;
      },
      error: (error) => {
        console.error('Error al cargar formatos:', error);
        this.showMessage('Error al cargar los formatos', 'error');
      }
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Eventos del grid
  onGridReady(event: any) {
    console.log('Grid listo:', event);
  }

  // Eventos de los botones
  onAdd() {
    const data = {
      action: 'Registrar' as const,
      title: 'Registrar Formato de Certificado',
      formato: {} as TbFormatoCertificado
    };

    const dialogRef = this._matDialog.open(FormatosRegistroComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'create') {
          this.showMessage('Formato creado exitosamente', 'success');
          this.loadFormatos();
        }
      }
    });
  }

  onEdit(rowData: TbFormatoCertificado) {
    console.log('Editando formato:', rowData);

    const data = {
      action: 'Editar' as const,
      title: 'Editar Formato de Certificado',
      formato: rowData
    };

    const dialogRef = this._matDialog.open(FormatosRegistroComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'update') {
          this.showMessage('Formato actualizado exitosamente', 'success');
          this.loadFormatos();
        }
      }
    });
  }

  onView(rowData: TbFormatoCertificado) {
    console.log('Viendo detalles:', rowData);

    const data = {
      action: 'Ver' as const,
      title: 'Detalles del Formato',
      formato: rowData,
      readOnly: true
    };

    this._matDialog.open(FormatosRegistroComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data
    });
  }

  onDownload(rowData: TbFormatoCertificado) {
    console.log('Descargando archivo:', rowData);

    if (!rowData.id) {
      this.showMessage('No se puede descargar: ID no válido', 'error');
      return;
    }

    if (!rowData.rutaFormato) {
      this.showMessage('No hay archivo asociado a este formato', 'warning');
      return;
    }

    this._tbFormatoCertificadoService.downloadFile(rowData.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Obtener nombre del archivo de la ruta o usar un nombre por defecto
        const fileName = rowData.rutaFormato?.split('/').pop() || `formato_${rowData.codigo}.docx`;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.showMessage('Archivo descargado exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error al descargar archivo:', error);
        this.showMessage('Error al descargar el archivo', 'error');
      }
    });
  }

  onDelete(rowData: TbFormatoCertificado) {
    console.log('Eliminando formato:', rowData);

    const confirmMessage = `¿Estás seguro de eliminar el formato "${rowData.nombreFormato}" (${rowData.codigo})?\n\nEsta acción también eliminará el archivo asociado.`;

    if (confirm(confirmMessage)) {
      this._tbFormatoCertificadoService.delete(rowData).subscribe({
        next: (response) => {
          this.showMessage('Formato eliminado exitosamente', 'success');
          this.loadFormatos();
        },
        error: (error) => {
          console.error('Error al eliminar formato:', error);
          this.showMessage('Error al eliminar el formato', 'error');
        }
      });
    }
  }

  // Métodos auxiliares
  private showMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'end' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };

    this._snackBar.open(message, 'Cerrar', config);
  }

  // Método público para exportar desde el template si lo necesitas
  public exportarFormatos() {
    try {
      const csvData = this.rowData.map(formato => ({
        'Código': formato.codigo || '',
        'Nombre del Formato': formato.nombreFormato || '',
        'Archivo': formato.rutaFormato?.split('/').pop() || '',
        'Creado por': formato.tbUsuario?.usuario || '',
        'Fecha Creación': formato.fechaCreacion ? new Date(formato.fechaCreacion).toLocaleDateString() : '',
        'Tamaño (bytes)': formato.tamanoArchivo || 0
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
      link.download = `formatos_certificado_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      this.showMessage('Lista de formatos exportada exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      this.showMessage('Error al exportar los datos', 'error');
    }
  }

  onMenuAction($event: { action: string; data: any }) {
    switch ($event.action) {
      case 'downloadTemplate':
        this.onDownload($event.data);
        break;
      case 'asignSignatures':
        this.asignarFirmas($event.data);
        break;
      default:
        console.warn('Acción de menú no reconocida:', $event.action);
    }
  }

  asignarFirmas(tbFormatoCertificado: TbFormatoCertificado) {
    // Mostrar loading mientras se cargan las firmas ya asignadas
    this.showMessage('Cargando firmas asignadas...', 'info');

    // Primero obtener los IDs de las firmas ya asignadas
    this._tbFormatoCertificadoFirmaService
      .findFirmaIdsByFormatoCertificadoId(tbFormatoCertificado.id!)
      .subscribe({
        next: (firmaIdsAsignadas) => {
          console.log('Firmas ya asignadas:', firmaIdsAsignadas);

          // Abrir el modal con los IDs de firmas pre-seleccionadas
          const dialogRef = this._matDialog.open(AsignarFirmasComponent, {
            width: '90vw',
            maxWidth: '1200px',
            maxHeight: '90vh',
            data: {
              tbFormatoCertificado: tbFormatoCertificado,
              firmaIdsYaAsignadas: firmaIdsAsignadas // Pasar IDs de firmas ya asignadas
            },
            disableClose: true,
            panelClass: 'custom-dialog-container'
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result?.success) {
              const count = result.count || 0;
              this.showMessage(`${count} firma(s) asignada(s) al formato exitosamente`, 'success');
            }
          });
        },
        error: (error) => {
          console.error('Error al cargar firmas asignadas:', error);
          // Si falla, abrir el modal sin pre-selección
          const dialogRef = this._matDialog.open(AsignarFirmasComponent, {
            width: '90vw',
            maxWidth: '1200px',
            maxHeight: '90vh',
            data: {
              evento: tbFormatoCertificado,
              firmaIdsYaAsignadas: []
            },
            disableClose: true,
            panelClass: 'custom-dialog-container'
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result?.success) {
              const count = result.count || 0;
              this.showMessage(`${count} firma(s) asignada(s) al formato exitosamente`, 'success');
            }
          });
        }
      });
  }
}
