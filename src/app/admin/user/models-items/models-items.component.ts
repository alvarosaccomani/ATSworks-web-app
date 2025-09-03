import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ModelItemsService } from '../../../core/services/model-items.service';
import { ModelItemResults } from '../../../core/interfaces/model-item';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-models-items',
  imports: [
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './models-items.component.html',
  styleUrl: './models-items.component.scss'
})
export class ModelsItemsComponent {

  public modelItems$!: Observable<ModelItemResults>;

  constructor(
    private _modelItemsService: ModelItemsService,
    private _sharedDataService: SharedDataService
  ) { }
  
  ngOnInit(): void {
    this.modelItems$ = this._modelItemsService.getModelItems('');
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
      }
    });
  }
}
