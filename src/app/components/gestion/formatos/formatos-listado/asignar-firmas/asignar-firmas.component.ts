import { Component, Inject, OnInit, inject, ViewChild } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import {TbFirma, TbFormatoCertificado, TbFormatoCertificadoFirma} from "~interfaces/index";
import { TbFirmaService, TbFormatoCertificadoFirmaService } from "app/services";
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigurarFirmaComponent } from './configurar-firma/configurar-firma.component';

interface DialogData {
  tbFormatoCertificado: TbFormatoCertificado;
  firmaIdsYaAsignadas?: number[]; // IDs de firmas ya asignadas
  firmasYaAsignadas?: TbFormatoCertificadoFirma[];
}

// Extender interfaz de TbFirma para incluir configuración temporal
interface TbFirmaExtended extends TbFirma {
  _config?: any; // Configuración temporal antes de guardar
  _hasConfig?: boolean; // Indica si ya tiene configuración guardada
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

// Cell Renderer para acciones
class ActionsCellRenderer {
  private eGui!: HTMLElement;
  private params: any;

  init(params: ICellRendererParams) {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; gap: 4px;';

    // Botón de configurar
    const configBtn = document.createElement('button');
    configBtn.innerHTML = `
      <span class="material-icons" style="font-size: 20px;">settings</span>
    `;
    configBtn.style.cssText = `
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    `;
    configBtn.title = 'Configurar firma';
    configBtn.onmouseover = () => configBtn.style.background = '#e3f2fd';
    configBtn.onmouseout = () => configBtn.style.background = 'transparent';
    configBtn.onclick = () => {
      if (params.context && params.context.componentParent) {
        params.context.componentParent.configurarFirma(params.data);
      }
    };

    this.eGui.appendChild(configBtn);
  }

  getGui() {
    return this.eGui;
  }

  refresh() {
    return false;
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
    MatMenuModule,
    AgGridAngular
  ],
  templateUrl: './asignar-firmas.component.html',
  styleUrl: './asignar-firmas.component.scss'
})
export class AsignarFirmasComponent implements OnInit {
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private _tbFirmaService: TbFirmaService = inject(TbFirmaService);
  private _tbFormatoCertificadoFirmaService: TbFormatoCertificadoFirmaService = inject(TbFormatoCertificadoFirmaService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _dialogRef: MatDialogRef<AsignarFirmasComponent> = inject(MatDialogRef<AsignarFirmasComponent>);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  tbFormatoCertificado: TbFormatoCertificado;
  rowData: TbFirmaExtended[] = [];
  selectedFirmas: TbFirmaExtended[] = [];
  firmaIdsYaAsignadas: number[] = [];
  firmaYaAsignadas: TbFormatoCertificadoFirma[] = [];
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
    },
    {
      headerName: "Acciones",
      width: 100,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
      pinned: 'right'
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
    context: {
      componentParent: this // Para acceder al componente desde el cell renderer
    }
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.tbFormatoCertificado = data.tbFormatoCertificado;
    this.firmaIdsYaAsignadas = data.firmaIdsYaAsignadas || [];
    this.firmaYaAsignadas = data.firmasYaAsignadas || [];
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

      setTimeout(() => {
        this.gridApi.forEachNode((node) => {
          if (node.data && node.data.id) {
            const isAssigned = this.firmaIdsYaAsignadas.includes(node.data.id);
            const formatoCertificadoFirma = this.firmaYaAsignadas.find(res=>{
              return res.tbFirma.id === node.data.id && res.tbFormatoCertificado.id === this.tbFormatoCertificado.id;
            });
            if (isAssigned) {
              node.setSelected(true);
              if (formatoCertificadoFirma) {
                node.data._config = formatoCertificadoFirma;
              }
            }
          }
        });

        // Actualizar contador después de pre-seleccionar
        setTimeout(() => {
          this.selectedFirmas = this.gridApi.getSelectedRows();
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

  removeFirma(firma: TbFirmaExtended) {
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

  configurarFirma(firma: TbFirmaExtended) {
    // Buscar la firma en rowData para obtener la referencia actualizada
    const firmaActual = this.rowData.find(f => f.id === firma.id);
    if (!firmaActual) {
      console.error('Firma no encontrada en rowData');
      return;
    }

    // Buscar el índice de la firma en las seleccionadas para determinar su orden
    const indexInSelected = this.selectedFirmas.findIndex(f => f.id === firma.id);
    const orden = indexInSelected >= 0 ? indexInSelected + 1 : this.selectedFirmas.length + 1;

    // PRIORIDAD 1: Si ya tiene configuración temporal, usarla
    if (firmaActual._config) {
      this.abrirModalConfiguracion(firmaActual, orden, firmaActual._config);
      return;
    }

    // PRIORIDAD 2: Si está asignada en BD, cargar desde backend
    if (this.firmaIdsYaAsignadas.includes(firma.id!)) {
      this.cargarConfiguracionExistente(firmaActual, orden);
    } else {
      this.abrirModalConfiguracion(firmaActual, orden, null);
    }
  }

  /**
   * Carga la configuración existente desde el backend
   */
  private cargarConfiguracionExistente(firma: TbFirmaExtended, orden: number) {
    this._tbFormatoCertificadoFirmaService
      .findById2(this.tbFormatoCertificado.id!, firma.id!)
      .subscribe({
        next: (response: any) => {
          this.abrirModalConfiguracion(firma, orden, response);
        },
        error: (error) => {
          this.abrirModalConfiguracion(firma, orden, null);
        }
      });
  }

  /**
   * Abre el modal de configuración
   */
  private abrirModalConfiguracion(firma: TbFirmaExtended, orden: number, existingConfig: any) {
    const dialogRef = this._matDialog.open(ConfigurarFirmaComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        firma: firma,
        orden: orden,
        existingConfig: existingConfig
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // ✅ Guardar configuración en el objeto firma en rowData
        const firmaEnRowData = this.rowData.find(f => f.id === firma.id);
        if (firmaEnRowData) {
          firmaEnRowData._config = result.config;
          firmaEnRowData._hasConfig = true;
        }

        // Si la firma no estaba seleccionada, seleccionarla
        if (!this.selectedFirmas.find(f => f.id === firma.id)) {
          this.gridApi.forEachNode((node) => {
            if (node.data.id === firma.id) {
              node.setSelected(true);
            }
          });
        }

        // ✅ IMPORTANTE: Actualizar el nodo del grid con la configuración
        this.gridApi.forEachNode((node) => {
          if (node.data.id === firma.id) {
            const updatedData = {
              ...node.data,
              _config: result.config,
              _hasConfig: true
            };
            node.setData(updatedData);
          }
        });

        this.showMessage('Configuración guardada temporalmente', 'success');
      }
    });
  }

  onSave() {
    if (this.selectedFirmas.length === 0) {
      this.showMessage('Debe seleccionar al menos una firma', 'error');
      return;
    }

    this.selectedFirmas = this.selectedFirmas.map(firmaSeleccionada => {
      const firmaEnRowData = this.rowData.find(f => f.id === firmaSeleccionada.id);
      return firmaEnRowData || firmaSeleccionada;
    });

    this.guardarAsignaciones();
  }

  private configurarFirmasSecuencialmente(firmasSinConfig: TbFirmaExtended[], index: number) {
    if (index >= firmasSinConfig.length) {
      // Todas las firmas configuradas, proceder a guardar
      this.guardarAsignaciones();
      return;
    }

    const firma = firmasSinConfig[index];
    const ordenGlobal = this.selectedFirmas.findIndex(f => f.id === firma.id) + 1;

    // Abrir modal de configuración para esta firma
    const dialogRef = this._matDialog.open(ConfigurarFirmaComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        firma: firma,
        orden: ordenGlobal,
        existingConfig: firma._config
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Guardar configuración en el objeto firma
        firma._config = result.config;

        // Continuar con la siguiente firma
        this.configurarFirmasSecuencialmente(firmasSinConfig, index + 1);
      } else {
        // Usuario canceló, preguntar si desea continuar
        if (confirm('¿Desea cancelar la configuración de todas las firmas?')) {
          return; // Cancelar todo
        } else {
          // Usar configuración por defecto y continuar
          firma._config = this.getDefaultConfig(ordenGlobal);
          this.configurarFirmasSecuencialmente(firmasSinConfig, index + 1);
        }
      }
    });
  }

  private getDefaultConfig(orden: number) {
    return {
      orden: orden,
      firmarDigital: '0',
      firmaVisible: '1',
      pagina: 1,
      posX: 50,
      posY: 50,
      ancho: 150,
      alto: 60,
      layoutMode: 'ABS',
      gapX: 10,
      gapY: 10,
      reason: 'Certificado académico oficial',
      location: 'Universidad Nacional Pedro Ruiz Gallo'
    };
  }

  private guardarAsignaciones() {
    this.isLoading = true;

    // Crear las asignaciones con toda la configuración
    const asignaciones = this.selectedFirmas.map((firma, index) => {
      const config = firma._config || this.getDefaultConfig(index + 1);

      return {
        id: {
          idtbFirma: firma.id,
          idtbFormatoCertificado: this.tbFormatoCertificado.id
        },
        tbFirma: {
          id: firma.id
        },
        tbFormatoCertificado: {
          id: this.tbFormatoCertificado.id
        },
        orden: config.orden,
        firmarDigital: config.firmarDigital,
        firmaVisible: config.firmaVisible,
        pagina: config.pagina,
        posX: config.posX,
        posY: config.posY,
        ancho: config.ancho,
        alto: config.alto,
        layoutMode: config.layoutMode,
        gapX: config.gapX,
        gapY: config.gapY,
        reason: config.reason,
        location: config.location
      };
    });

    // Guardar cada asignación
    let completedCount = 0;
    let errorCount = 0;

    asignaciones.forEach((asignacion, index) => {
      // Usar update en lugar de insert si ya existe
      const firma = this.selectedFirmas[index];
      const isUpdate = this.firmaIdsYaAsignadas.includes(firma.id!);

      const request = isUpdate
        ? this._tbFormatoCertificadoFirmaService.update(asignacion)
        : this._tbFormatoCertificadoFirmaService.insert(asignacion);

      request.subscribe({
        next: () => {
          completedCount++;
          this.checkComplete(completedCount, errorCount, asignaciones.length);
        },
        error: (error) => {
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
