import {Component, inject, OnInit} from '@angular/core';
import {AgGridAngularCustomComponent} from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {ColDef} from "ag-grid-community";
import {TbUsuarioService} from "app/services";
import {TbUsuario} from "~shared/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {UsuariosRegistroComponent} from "app/components/gestion/usuarios/usuarios-registro/usuarios-registro.component";

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

  rowData: TbUsuario[] = [];

  colDefs: ColDef[] = [
    {field: "usuario", headerName: "Usuario"},
    {field: "tbPersona.nombres", headerName: "Nombres"},
    {field: "tbPersona.apellidoPaterno", headerName: "Apellidos"},
    {field: "tbPersona.dni", headerName: "Dni"},
    {field: "tbPersona.email", headerName: "Email"},
    {field: "tbPersona.telefono", headerName: "Teléfono"},
    // {field: "price", headerName: "Precio", valueFormatter: (params) => `$${params.value?.toLocaleString()}`},
    // {field: "electric", headerName: "Eléctrico", cellRenderer: (params) => params.value ? 'Sí' : 'No'}
    // La columna de acciones se agrega automáticamente por el componente personalizado
  ];

  ngOnInit(): void {
    this._tbUsuarioService.findAll().subscribe(res=>{
      this.rowData = res;
    })
  }

  // Eventos del grid
  onGridReady(event: any) {
    console.log('Grid listo:', event);
  }

  // Eventos de los botones
  onAdd() {
    const data = {
      action: 'Registrar',
      title: 'Registrar Usuario',
      usuario: {} as TbUsuario
    };
    this._matDialog
      .open(UsuariosRegistroComponent, {
        width: '900px',
        data,
      });
  }

  onEdit(rowData: any) {
    console.log('Editando registro:', rowData);

    // Implementación para editar
    const updatedData = {...rowData};
    // Aquí abrirías tu modal/formulario de edición
    // this.openEditDialog(updatedData);

    alert(`Editando: ${rowData.make} ${rowData.model}`);
  }

  onView(rowData: any) {
    console.log('Viendo detalles:', rowData);

    // Implementación para ver detalles
    const details = Object.entries(rowData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    alert(`Detalles del registro:\n${details}`);
  }

  onDownload(rowData: any) {
    console.log('Descargando:', rowData);

    // Implementación para descargar
    const dataStr = JSON.stringify(rowData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${rowData.make}_${rowData.model}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  onDelete(rowData: any) {
    console.log('Eliminando:', rowData);

    const confirmMessage = `¿Estás seguro de eliminar ${rowData.make} ${rowData.model}?`;

    if (confirm(confirmMessage)) {
      // Eliminar del array local
      // this.rowData = this.rowData.filter(item =>
      //   item.make !== rowData.make || item.model !== rowData.model
      // );

      // El grid se actualiza automáticamente por el data binding
      console.log('Registro eliminado exitosamente');

      // Aquí harías la llamada al backend
      // this.userService.deleteUser(rowData.id).subscribe({
      //   next: () => console.log('Usuario eliminado del servidor'),
      //   error: (error) => console.error('Error:', error)
      // });
    }
  }

  // Métodos adicionales para controlar el grid personalizado
  private clearGridFilter() {
    // Acceder al componente hijo si necesitas control adicional
    // this.agGridCustom.clearFilter();
  }

  private exportGridData() {
    // this.agGridCustom.exportToCsv('usuarios.csv');
  }

  private refreshGridData() {
    // this.agGridCustom.refreshData(this.rowData);
  }
}
