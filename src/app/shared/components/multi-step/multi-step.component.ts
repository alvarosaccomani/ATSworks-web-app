import { Component, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-step',
  imports: [
    CommonModule
  ],
  templateUrl: './multi-step.component.html',
  styleUrl: './multi-step.component.scss'
})
export class MultiStepComponent {

  @Input() items: any;
  @Input() step: any;
  @Output() stepEmitter: EventEmitter<number> =  new EventEmitter();

  private currentStep: any;

  constructor() { }

  ngOnInit(): void {
    this.items.forEach((e: any, index: number) => { e.index = index });
    this.currentStep = this.step;
    this.setActiveStep(this.items.findIndex((e: any) => e === this.currentStep));
  }

  ngDoCheck(): void {
    this.currentStep = this.step;
    this.setActiveStep(this.items.findIndex((e: any) => e === this.currentStep));
  }

  public setActiveStep(index: number): void {
    //alert(this.items[index]);
    this.items.forEach((e: any, indexItem: number) => {
      e.active = (indexItem <= index ? true : false);
    });
    this.currentStep = this.items[index];
    this.passStep();
  }

  public passStep() {
    this.stepEmitter.emit(this.currentStep);
  }
}
