import { Component, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AppBlogCardsComponent } from 'app/components/blog-card/blog-card.component';
import { AppSalesProfitComponent } from 'app/components/sales-profit/sales-profit.component';
import { AppTotalFollowersComponent } from 'app/components/total-followers/total-followers.component';
import { AppTotalIncomeComponent } from 'app/components/total-income/total-income.component';
import { AppPopularProductsComponent } from 'app/components/popular-products/popular-products.component';
import { AppEarningReportsComponent } from 'app/components/earning-reports/earning-reports.component';

@Component({
  selector: 'app-starter',
  imports: [
    MaterialModule,
    AppBlogCardsComponent,
    AppSalesProfitComponent,
    AppTotalFollowersComponent,
    AppTotalIncomeComponent,
    AppPopularProductsComponent,
    AppEarningReportsComponent
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent { }
