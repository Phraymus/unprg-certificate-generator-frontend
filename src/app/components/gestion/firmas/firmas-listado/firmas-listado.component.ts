import { Component, inject, OnInit } from '@angular/core';
import { AgGridAngularCustomComponent } from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { ColDef } from "ag-grid-community";
import { TbFirmaService } from "app/services";
import { TbFirma } from "~shared/interfaces";
import { MatDialog } from "@angular/material/dialog";
import { FirmasRegistroComponent } from "app/components/gestion/firmas/firmas-registro/firmas-registro.component";
import { MatSnackBar } from '@angular/material/snack-bar';
import {MenuOption} from "~shared/classes/ActionButtonsComponent";

// Cell Renderer para mostrar imagen de firma
class ImageCellRenderer {
  eGui!: HTMLElement;


  init(params: any) {
    this.eGui = document.createElement('div');
    this.eGui.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; padding: 4px;';

    if (params.value) {
      const img = document.createElement('img');
      img.src = `data:image/png;base64,${params.value}`;
      img.style.cssText = 'max-height: 60px; max-width: 150px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;';
      img.alt = 'Firma';
      this.eGui.appendChild(img);
    } else {
      const noImg = document.createElement('span');
      noImg.textContent = 'Sin imagen';
      noImg.style.cssText = 'color: #999; font-style: italic; font-size: 12px;';
      this.eGui.appendChild(noImg);
    }
  }

  getGui() {
    return this.eGui;
  }
}

// Cell Renderer para estado con badge
class EstadoCellRenderer {
  eGui!: HTMLElement;

  init(params: any) {
    this.eGui = document.createElement('div');
    this.eGui.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%;';

    const badge = document.createElement('span');
    const estadoValue = params.value;

    // Convertir valores numéricos o string a texto legible
    let estadoTexto = 'Inactivo';
    let isActivo = false;

    if (estadoValue === 1 || estadoValue === '1' || estadoValue === 'ACTIVO') {
      estadoTexto = 'Activo';
      isActivo = true;
    }

    badge.textContent = estadoTexto;
    badge.style.cssText = `
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
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
  selector: 'app-firmas-listado',
  imports: [
    AgGridAngularCustomComponent,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle
  ],
  templateUrl: './firmas-listado.component.html',
  styleUrl: './firmas-listado.component.scss'
})
export class FirmasListadoComponent implements OnInit {
  private _tbFirmaService: TbFirmaService = inject(TbFirmaService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  rowData: TbFirma[] = [];

  menuOptions: MenuOption[] = [
    {
      label: 'Agregar certificado digital',
      icon: 'folder',
      action: "asignCertificateDigital"
    }
  ];

  colDefs: ColDef[] = [
    {
      field: "codigo",
      headerName: "Código",
      width: 150,
      minWidth: 120
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
      width: 120,
      cellRenderer: EstadoCellRenderer
    },
    {
      field: "imagen",
      headerName: "Firma",
      width: 200,
      cellRenderer: ImageCellRenderer,
      sortable: false,
      filter: false
    }
  ];

  ngOnInit(): void {
    this.loadFirmas();
  }

  private loadFirmas(): void {
    this._tbFirmaService.findAll().subscribe({
      next: (res) => {
        // Convertir el array de bytes a base64 si es necesario
        this.rowData = res.map(firma => ({
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

  // Eventos del grid
  onGridReady(event: any) {
    console.log('Grid listo:', event);
  }

  // Eventos de los botones
  onAdd() {
    const data = {
      action: 'Registrar' as const,
      title: 'Registrar Firma',
      firma: {} as TbFirma
    };

    const dialogRef = this._matDialog.open(FirmasRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'create') {
          this.showMessage('Firma creada exitosamente', 'success');
          this.loadFirmas();
        }
      }
    });
  }

  onEdit(rowData: TbFirma) {
    console.log('Editando firma:', rowData);

    const data = {
      action: 'Editar' as const,
      title: 'Editar Firma',
      firma: rowData
    };

    const dialogRef = this._matDialog.open(FirmasRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'update') {
          this.showMessage('Firma actualizada exitosamente', 'success');
          this.loadFirmas();
        }
      }
    });
  }

  onView(rowData: TbFirma) {
    console.log('Viendo detalles:', rowData);

    const data = {
      action: 'Ver' as const,
      title: 'Detalles de la Firma',
      firma: rowData,
      readOnly: true
    };

    this._matDialog.open(FirmasRegistroComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data
    });
  }

  onDelete(rowData: TbFirma) {
    console.log('Eliminando:', rowData);

    const confirmMessage = `¿Estás seguro de eliminar la firma "${rowData.nombre}" (${rowData.codigo})?`;

    if (confirm(confirmMessage)) {
      this._tbFirmaService.delete(rowData).subscribe({
        next: (response) => {
          this.showMessage('Firma eliminada exitosamente', 'success');
          this.loadFirmas();
        },
        error: (error) => {
          console.error('Error al eliminar firma:', error);
          this.showMessage('Error al eliminar la firma', 'error');
        }
      });
    }
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

  // Método público para exportar si lo necesitas
  public exportarFirmas() {
    try {
      const csvData = this.rowData.map(firma => ({
        Código: firma.codigo || '',
        Nombre: firma.nombre || '',
        Estado: this.getEstadoTexto(firma.estado),
        'Tiene Imagen': firma.imagen ? 'Sí' : 'No'
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
      link.download = `firmas_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      this.showMessage('Lista de firmas exportada exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      this.showMessage('Error al exportar los datos', 'error');
    }
  }

  // Helper para convertir estado numérico a texto
  private getEstadoTexto(estado: any): string {
    if (estado === 1 || estado === '1' || estado === 'ACTIVO') {
      return 'Activo';
    }
    return 'Inactivo';
  }

  handleMenuAction($event: { action: string; data: any }) {
    if ($event.action === 'asignCertificateDigital') {
      this.asignarCertificadoDigital($event.data);
    }else{
      this.showMessage(`Acción desconocida: ${$event.action}`);
    }
  }

  private asignarCertificadoDigital(data: any) {
    // alert("click")
  }
}
