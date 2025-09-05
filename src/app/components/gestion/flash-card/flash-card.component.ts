import {Component} from '@angular/core';
import {ColDef} from 'ag-grid-community';
import {AgGridAngular} from 'ag-grid-angular';
import {MatButton} from '@angular/material/button';
import {AG_GRID_LOCALE_ES} from '@ag-grid-community/locale'

@Component({
  selector: 'app-flash-card',
  imports: [
    AgGridAngular,
    MatButton,
  ],
  templateUrl: './flash-card.component.html',
  styleUrl: './flash-card.component.scss'
})
export class FlashCardComponent {

  gridOptions = {
    // defaultColDef: {
    //   sortable: true,
    //   resizable: true,
      // flex: 1,
    //   minWidth: 100,
    // },
    // animateRows: true,
    // rowHeight: 40,
    // paginationPageSize: 10,
    localeText: AG_GRID_LOCALE_ES,
  }

  rowData = [
    {make: "Tesla", model: "Model Y", price: 64950, electric: true},
    {make: "Ford", model: "F-Series", price: 33850, electric: false},
    {make: "Toyota", model: "Corolla", price: 29600, electric: false},
  ];

  colDefs: ColDef[] = [
    {field: "make"},
    {field: "model"},
    {field: "price"},
    {field: "electric"}
  ];

}
