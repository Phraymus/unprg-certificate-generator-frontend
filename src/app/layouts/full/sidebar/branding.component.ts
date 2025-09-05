import { Component } from '@angular/core';
import { CoreService } from 'app/services/core.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branding',
  imports: [RouterModule],
  template: `
    <a [routerLink]="['/']">
      <img
        width="212px"
        src="./assets/images/logos/isotipo_unprg.png"
        class="align-middle m-2"
        alt="logo"
      />
    </a>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}
