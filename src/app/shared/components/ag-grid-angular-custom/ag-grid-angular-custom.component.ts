import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatButton } from '@angular/material/button';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { ActionButtonsComponent } from "~shared/classes/ActionButtonsComponent";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-ag-grid-angular-custom',
  imports: [
    AgGridAngular,
    MatButton,
    NgIf,
  ],
  templateUrl: './ag-grid-angular-custom.component.html',
  styleUrl: './ag-grid-angular-custom.component.scss'
})
export class AgGridAngularCustomComponent {
  @ViewChild('buscador') buscador!: ElementRef;
  @ViewChild('agregar') agregar!: ElementRef;

  // Inputs para configuración
  @Input() rowData: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() showActions: boolean = true;
  @Input() showAddButton: boolean = true;
  @Input() addButtonText: string = 'Agregar';
  @Input() addButtonClass: string = 'm-r-8 bg-warning';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() gridHeight: string = '60vh';
  @Input() paginationPageSize: number = 20;
  @Input() rowHeight: number = 70;
  @Input() parentComponent: any = null; // Para pasar el contexto de los botones de acción

  // Outputs para eventos
  @Output() onAdd = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();
  @Output() onDownload = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() gridReady = new EventEmitter<any>();

  gridApi: GridApi;
  internalColDefs: ColDef[] = [];

  gridOptions: GridOptions = {
    pagination: true,
    defaultColDef: {
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    },
    localeText: AG_GRID_LOCALE_ES,
    overlayNoRowsTemplate: '<span>No se encontraron resultados</span>',
    overlayLoadingTemplate: '<span>Cargando datos...</span>',
  };

  ngOnInit() {
    this.setupGridOptions();
    this.setupColumnDefs();
  }

  ngOnChanges() {
    this.setupColumnDefs();
  }

  private setupGridOptions() {
    this.gridOptions = {
      ...this.gridOptions,
      paginationPageSize: this.paginationPageSize,
      rowHeight: this.rowHeight,
      context: {
        componentParent: {
          onEdit: (data: any) => this.onEdit.emit(data),
          onView: (data: any) => this.onView.emit(data),
          onDownload: (data: any) => this.onDownload.emit(data),
          onDelete: (data: any) => this.onDelete.emit(data)
        }
      }
    };
  }

  private setupColumnDefs() {
    this.internalColDefs = [...this.columnDefs];

    // Agregar columna de acciones si está habilitada
    if (this.showActions) {
      const actionsColumn: ColDef = {
        headerName: "Acciones",
        cellRenderer: ActionButtonsComponent,
        sortable: false,
        filter: false,
        resizable: false,
        width: 200,
        minWidth: 200,
        maxWidth: 200,
        pinned: 'right'
      };

      // Verificar si ya existe la columna de acciones
      const existingActionsIndex = this.internalColDefs.findIndex(col => col.headerName === "Acciones");
      if (existingActionsIndex === -1) {
        this.internalColDefs.push(actionsColumn);
      }
    }
  }

  onChangeFilter(event: any) {
    if (this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', event.target.value);

      setTimeout(() => {
        const displayedRowCount = this.gridApi.getDisplayedRowCount();
        if (displayedRowCount === 0) {
          this.gridApi.showNoRowsOverlay();
        } else {
          this.gridApi.hideOverlay();
        }
      }, 100);
    }
  }

  onGridReady(event: any) {
    this.gridApi = event.api;
    this.gridReady.emit(event);
  }

  onAddClick() {
    this.onAdd.emit();
  }

  // Métodos públicos para controlar el grid desde el componente padre
  public refreshData(newData: any[]) {
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', newData);
    }
  }

  public clearFilter() {
    if (this.gridApi && this.buscador) {
      this.buscador.nativeElement.value = '';
      this.gridApi.setGridOption('quickFilterText', '');
      this.gridApi.hideOverlay();
    }
  }

  public exportToCsv(filename: string = 'export.csv') {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({ fileName: filename });
    }
  }
}
