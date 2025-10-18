import { Component, inject, OnInit } from '@angular/core';
import { AgGridAngularCustomComponent } from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { ColDef } from "ag-grid-community";
import { TbUsuarioService } from "app/services";
import { TbUsuario } from "~shared/interfaces";
import { MatDialog } from "@angular/material/dialog";
import { UsuariosRegistroComponent } from "app/components/gestion/usuarios/usuarios-registro/usuarios-registro.component";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-usuarios-listado',
  imports: [
    AgGridAngularCustomComponent,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle
  ],
  templateUrl: './usuarios-listado.component.html',
  styleUrl: './usuarios-listado.component.scss'
})
export class UsuariosListadoComponent implements OnInit {
  private _tbUsuarioService: TbUsuarioService = inject(TbUsuarioService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  rowData: TbUsuario[] = [];

  colDefs: ColDef[] = [
    { field: "usuario", headerName: "Usuario" },
    { field: "tbPersona.nombres", headerName: "Nombres" },
    {
      field: "apellidos",
      headerName: "Apellidos",
      valueGetter: (params) => {
        const paterno = params.data?.tbPersona?.apellidoPaterno || '';
        const materno = params.data?.tbPersona?.apellidoMaterno || '';
        return `${paterno} ${materno}`.trim();
      }
    },
    { field: "tbPersona.dni", headerName: "DNI" },
    { field: "tbPersona.email", headerName: "Email" },
    { field: "tbPersona.telefono", headerName: "Teléfono" }
  ];

  ngOnInit(): void {
    this.loadUsuarios();
  }

  private loadUsuarios(): void {
    this._tbUsuarioService.findAll().subscribe({
      next: (res) => {
        this.rowData = res;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.showMessage('Error al cargar los usuarios', 'error');
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
      title: 'Registrar Usuario',
      usuario: {} as TbUsuario
    };

    const dialogRef = this._matDialog.open(UsuariosRegistroComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true // Evitar cerrar con ESC o click fuera
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'create') {
          this.showMessage('Usuario creado exitosamente', 'success');
          this.loadUsuarios(); // Recargar la lista
        }
      }
    });
  }

  onEdit(rowData: TbUsuario) {
    console.log('Editando registro:', rowData);

    const data = {
      action: 'Editar' as const,
      title: 'Editar Usuario',
      usuario: rowData
    };

    const dialogRef = this._matDialog.open(UsuariosRegistroComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (result.action === 'update') {
          this.showMessage('Usuario actualizado exitosamente', 'success');
          this.loadUsuarios(); // Recargar la lista
        }
      }
    });
  }

  onView(rowData: TbUsuario) {
    console.log('Viendo detalles:', rowData);

    // Crear un modal de solo lectura para ver detalles
    const data = {
      action: 'Ver' as const,
      title: 'Detalles del Usuario',
      usuario: rowData,
      readOnly: true
    };

    this._matDialog.open(UsuariosRegistroComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data
    });
  }

  onDownload(rowData: TbUsuario) {
    console.log('Descargando:', rowData);

    try {
      // Preparar datos para exportar
      const exportData = {
        usuario: rowData.usuario || '',
        nombres: rowData.tbPersona?.nombres || '',
        apellidoPaterno: rowData.tbPersona?.apellidoPaterno || '',
        apellidoMaterno: rowData.tbPersona?.apellidoMaterno || '',
        dni: rowData.tbPersona?.dni || '',
        email: rowData.tbPersona?.email || '',
        telefono: rowData.tbPersona?.telefono || ''
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `usuario_${rowData.usuario}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showMessage('Datos del usuario descargados exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar:', error);
      this.showMessage('Error al descargar los datos', 'error');
    }
  }

  onDelete(rowData: TbUsuario) {
    console.log('Eliminando:', rowData);

    const nombreCompleto = `${rowData.tbPersona?.nombres || ''} ${rowData.tbPersona?.apellidoPaterno || ''}`.trim();
    const confirmMessage = `¿Estás seguro de eliminar al usuario "${rowData.usuario}" (${nombreCompleto})?`;

    if (confirm(confirmMessage)) {
      this._tbUsuarioService.delete(rowData).subscribe({
        next: (response) => {
          this.showMessage('Usuario eliminado exitosamente', 'success');
          this.loadUsuarios(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.showMessage('Error al eliminar el usuario', 'error');
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

  // Métodos adicionales para controlar el grid personalizado
  private clearGridFilter() {
    // Acceder al componente hijo si necesitas control adicional
    // this.agGridCustom.clearFilter();
  }

  private exportGridData() {
    try {
      // Exportar todos los datos a CSV
      const csvData = this.rowData.map(usuario => ({
        Usuario: usuario.usuario || '',
        Nombres: usuario.tbPersona?.nombres || '',
        'Apellido Paterno': usuario.tbPersona?.apellidoPaterno || '',
        'Apellido Materno': usuario.tbPersona?.apellidoMaterno || '',
        DNI: usuario.tbPersona?.dni || '',
        Email: usuario.tbPersona?.email || '',
        Teléfono: usuario.tbPersona?.telefono || ''
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
      link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      this.showMessage('Lista de usuarios exportada exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      this.showMessage('Error al exportar los datos', 'error');
    }
  }

  private refreshGridData() {
    this.loadUsuarios();
  }

  // Método público para exportar desde el template si lo necesitas
  public exportarUsuarios() {
    this.exportGridData();
  }
}
