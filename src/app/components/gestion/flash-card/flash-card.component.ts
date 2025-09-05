import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import {AgGridAngularCustomComponent} from "~shared/components/ag-grid-angular-custom/ag-grid-angular-custom.component";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-flash-card',
  imports: [
    AgGridAngularCustomComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent
  ],
  templateUrl: './flash-card.component.html',
  styleUrl: './flash-card.component.scss'
})
export class FlashCardComponent {

  rowData = [
    {make: "Tesla", model: "Model Y", price: 64950, electric: true},
    {make: "Ford", model: "F-Series", price: 33850, electric: false},
    {make: "Toyota", model: "Corolla", price: 29600, electric: false},
    {make: "BMW", model: "X3", price: 43700, electric: false},
    {make: "Mercedes", model: "C-Class", price: 41600, electric: false},
    {make: "Audi", model: "A4", price: 39100, electric: false},
    {make: "Honda", model: "Civic", price: 22700, electric: false},
    {make: "Nissan", model: "Altima", price: 24550, electric: false},
    {make: "Hyundai", model: "Elantra", price: 20650, electric: false},
    {make: "Volkswagen", model: "Jetta", price: 20190, electric: false},
    {make: "Mazda", model: "CX-5", price: 26900, electric: false},
    {make: "Subaru", model: "Outback", price: 27845, electric: false},
    {make: "Chevrolet", model: "Malibu", price: 24095, electric: false},
    {make: "Kia", model: "Forte", price: 19290, electric: false},
    {make: "Lexus", model: "RX", price: 46550, electric: false},
  ];

  colDefs: ColDef[] = [
    { field: "make", headerName: "Marca" },
    { field: "model", headerName: "Modelo" },
    { field: "price", headerName: "Precio", valueFormatter: (params) => `$${params.value?.toLocaleString()}` },
    { field: "electric", headerName: "Eléctrico", cellRenderer: (params) => params.value ? 'Sí' : 'No' }
    // La columna de acciones se agrega automáticamente por el componente personalizado
  ];

  // Eventos del grid
  onGridReady(event: any) {
    console.log('Grid listo:', event);
  }

  // Eventos de los botones
  onAdd() {
    console.log('Agregando nuevo registro');

    // Ejemplo: abrir modal para agregar nuevo registro
    // this.openAddDialog();

    // Ejemplo: navegar a página de creación
    // this.router.navigate(['/usuarios/nuevo']);

    alert('Abriendo formulario para agregar nuevo registro');
  }

  onEdit(rowData: any) {
    console.log('Editando registro:', rowData);

    // Implementación para editar
    const updatedData = { ...rowData };
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
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
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
      this.rowData = this.rowData.filter(item =>
        item.make !== rowData.make || item.model !== rowData.model
      );

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
