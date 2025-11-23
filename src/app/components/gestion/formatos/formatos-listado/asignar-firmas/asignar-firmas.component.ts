import { Component, Inject, OnInit, inject, ViewChild } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { TbFirma, TbFormatoCertificado } from "~interfaces/index";
import { TbFirmaService, TbFormatoCertificadoFirmaService } from "app/services";
import { MatSnackBar } from '@angular/material/snack-bar';

interface DialogData {
  tbFormatoCertificado: TbFormatoCertificado;
  firmaIdsYaAsignadas?: number[]; // IDs de firmas ya asignadas
}

// Cell Renderer para mostrar imagen en miniatura
class ImageCellRenderer {
  eGui!: HTMLElement;

  init(params: any) {
    this.eGui = document.createElement('div');
    this.eGui.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; padding: 2px;';

    if (params.value) {
      const img = document.createElement('img');
      img.src = `data:image/png;base64,${params.value}`;
      img.style.cssText = 'max-height: 40px; max-width: 80px; object-fit: contain; border: 1px solid #ddd; border-radius: 3px;';
      img.alt = 'Firma';
      this.eGui.appendChild(img);
    } else {
      const noImg = document.createElement('span');
      noImg.textContent = 'Sin imagen';
      noImg.style.cssText = 'color: #999; font-style: italic; font-size: 11px;';
      this.eGui.appendChild(noImg);
    }
  }

  getGui() {
    return this.eGui;
  }
}

// Cell Renderer para estado
class EstadoCellRenderer {
  eGui!: HTMLElement;

  init(params: any) {
    this.eGui = document.createElement('div');
    this.eGui.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%;';

    const badge = document.createElement('span');
    const estadoValue = params.value;

    let estadoTexto = 'Inactivo';
    let isActivo = false;

    if (estadoValue === 1 || estadoValue === '1' || estadoValue === 'ACTIVO') {
      estadoTexto = 'Activo';
      isActivo = true;
    }

    badge.textContent = estadoTexto;
    badge.style.cssText = `
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      ${isActivo
      ? 'background-color: #e8f5e8; color: #2e7d32;'
      : 'background-color: #ffebee; color: #c62828;'}
    `;

    this.eGui.appendChild(badge);
  }

  getGui() {
    return this.eGui;
  }
}

@Component({
  selector: 'app-asignar-firmas',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardFooter,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    AgGridAngular
  ],
  templateUrl: './asignar-firmas.component.html',
  styleUrl: './asignar-firmas.component.scss'
})
export class AsignarFirmasComponent implements OnInit {
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private _tbFirmaService: TbFirmaService = inject(TbFirmaService);
  private _tbFormatoCertificadoFirmaService: TbFormatoCertificadoFirmaService = inject(TbFormatoCertificadoFirmaService);
  private _dialogRef: MatDialogRef<AsignarFirmasComponent> = inject(MatDialogRef<AsignarFirmasComponent>);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  tbFormatoCertificado: TbFormatoCertificado;
  rowData: TbFirma[] = [];
  selectedFirmas: TbFirma[] = [];
  firmaIdsYaAsignadas: number[] = [];
  isLoading = false;
  gridApi!: GridApi;

  colDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      maxWidth: 50,
      pinned: 'left',
      lockPosition: true,
      // suppressMenu: true,
      sortable: false,
      filter: false,
      resizable: false
    },
    {
      field: "codigo",
      headerName: "Código",
      width: 130,
      minWidth: 100
    },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      minWidth: 200
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 110,
      cellRenderer: EstadoCellRenderer
    },
    {
      field: "imagen",
      headerName: "Firma",
      width: 120,
      cellRenderer: ImageCellRenderer,
      sortable: false,
      filter: false
    }
  ];

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 20,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    rowMultiSelectWithClick: false,
    defaultColDef: {
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: true,
    },
    localeText: AG_GRID_LOCALE_ES,
    overlayNoRowsTemplate: '<span>No hay firmas disponibles</span>',
    overlayLoadingTemplate: '<span>Cargando firmas...</span>',
    rowHeight: 55,
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.tbFormatoCertificado = data.tbFormatoCertificado;
    this.firmaIdsYaAsignadas = data.firmaIdsYaAsignadas || [];
    console.log('IDs de firmas ya asignadas:', this.firmaIdsYaAsignadas);
  }

  ngOnInit() {
    this.loadFirmas();
  }

  private loadFirmas(): void {
    this._tbFirmaService.findAll().subscribe({
      next: (firmas) => {
        // Convertir byte array a base64 para visualización
        this.rowData = firmas
          .filter(f => f.estado === '1' || f.estado === '1') // Solo firmas activas
          .map(firma => ({
            ...firma,
            imagen: firma.imagen ? this.arrayBufferToBase64(firma.imagen) : null
          }));
      },
      error: (error) => {
        console.error('Error al cargar firmas:', error);
        this.showMessage('Error al cargar las firmas', 'error');
      }
    });
  }

  private arrayBufferToBase64(buffer: any): string {
    if (typeof buffer === 'string') {
      return buffer;
    }
    if (buffer instanceof ArrayBuffer || Array.isArray(buffer)) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    return buffer;
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    // Pre-seleccionar firmas ya asignadas si existen
    if (this.firmaIdsYaAsignadas.length > 0) {
      console.log('Pre-seleccionando firmas con IDs:', this.firmaIdsYaAsignadas);

      setTimeout(() => {
        this.gridApi.forEachNode((node) => {
          if (node.data && node.data.id) {
            const isAssigned = this.firmaIdsYaAsignadas.includes(node.data.id);
            if (isAssigned) {
              console.log('Seleccionando firma:', node.data.codigo, node.data.id);
              node.setSelected(true);
            }
          }
        });

        // Actualizar contador después de pre-seleccionar
        setTimeout(() => {
          this.selectedFirmas = this.gridApi.getSelectedRows();
          console.log('Firmas pre-seleccionadas:', this.selectedFirmas.length);
        }, 100);
      }, 200);
    }
  }

  onSelectionChanged(event: any) {
    this.selectedFirmas = this.gridApi.getSelectedRows();
  }

  selectAll() {
    this.gridApi.selectAll();
  }

  deselectAll() {
    this.gridApi.deselectAll();
  }

  removeFirma(firma: TbFirma) {
    this.gridApi.forEachNode((node) => {
      if (node.data.id === firma.id) {
        node.setSelected(false);
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  }

  onSave() {
    if (this.selectedFirmas.length === 0) {
      this.showMessage('Debe seleccionar al menos una firma', 'error');
      return;
    }

    this.isLoading = true;

    // Crear las asignaciones
    const asignaciones = this.selectedFirmas.map(firma => ({
      id: {
        idtbFirma: firma.id,
        tbEventoFormatoCertificadoIdtbEvento: this.tbFormatoCertificado.id
      },
      tbFirma: {
        id: firma.id
      },
      tbFormatoCertificado: {
        id: this.tbFormatoCertificado.id
      }
    }));

    // Guardar cada asignación
    let completedCount = 0;
    let errorCount = 0;

    asignaciones.forEach((asignacion, index) => {
      this._tbFormatoCertificadoFirmaService.insert(asignacion).subscribe({
        next: () => {
          completedCount++;
          this.checkComplete(completedCount, errorCount, asignaciones.length);
        },
        error: (error) => {
          console.error('Error al asignar firma:', error);
          errorCount++;
          this.checkComplete(completedCount, errorCount, asignaciones.length);
        }
      });
    });
  }

  private checkComplete(completed: number, errors: number, total: number) {
    if (completed + errors === total) {
      this.isLoading = false;

      if (errors === 0) {
        this.showMessage(`${completed} firma(s) asignada(s) exitosamente`, 'success');
        this._dialogRef.close({ success: true, count: completed });
      } else if (errors === total) {
        this.showMessage('Error al asignar las firmas', 'error');
      } else {
        this.showMessage(`${completed} firma(s) asignada(s), ${errors} con error`, 'info');
        this._dialogRef.close({ success: true, count: completed, errors });
      }
    }
  }

  onCancel() {
    this._dialogRef.close({ success: false });
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
}
