import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var $:any;

@Component({
  selector: 'app-pagination',
  imports: [
    CommonModule
  ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() config: any;
  @Input() public page: number = 1;
  @Input() public totalPages: number = 1;
  @Input() public numElements: number = 10;
  @Output() paginaEmitter: EventEmitter<number> =  new EventEmitter();

  public pages: number[] = [];

  constructor() { }

  ngOnInit(): void {
    console.info('page ' + this.page);
    console.info('totalPages ' + this.totalPages);
    console.info('numElements ' + this.numElements);
    this.pages = Array(this.totalPages).fill(0).map((x,i)=>i+1);
    console.info('pages ' + this.pages);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes["page"]) {
      if(changes["page"].currentValue > changes["page"].previousValue) {
        this.page = changes["page"].previousValue;
        this.next();
      };
    }
    if(changes["totalPages"]) {
      this.totalPages = changes["totalPages"].currentValue;
    }
    this.pages = Array(this.totalPages).fill(0).map((x,i)=>i+1);
  }

  public next() {
    if(this.page < this.totalPages) {
      $(`.pagination li:nth-child(${this.page + 1})`).removeClass('active');
      this.page++;
      $(`.pagination li:nth-child(${this.page + 1})`).addClass('active');
      this.passPage();
    }
  }

  public prev() {
    if(this.page > 1) {
      $(`.pagination li:nth-child(${this.page + 1})`).removeClass('active');
      this.page--;
      $(`.pagination li:nth-child(${this.page + 1})`).addClass('active');
      this.passPage();
    }
  }

  public setPage(page: number) {
    if(page !== this.page) {
      $(`.pagination li:nth-child(${this.page + 1})`).removeClass('active');
      $(`.pagination li:nth-child(${page + 1})`).addClass('active');
      this.page = page;
      this.passPage();
    }
  }

  public passPage() {
    this.paginaEmitter.emit(this.page);
  }
}
