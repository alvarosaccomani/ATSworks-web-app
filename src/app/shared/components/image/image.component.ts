import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-image',
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})
export class ImageComponent {

  @Output() imageSelected = new EventEmitter<any>(); // Evento para emitir la imagen

  public imageSrc!: any;
  public filesToUpload: Array<File> = [];

  public changeImage(e: any): void {
    if(e.target.files && e.target.files.length) {
      this.filesToUpload = <Array<File>>e.target.files;
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.imageSrc = {
          name: this.filesToUpload[0].name,
          size: this.filesToUpload[0].size,
          type: this.filesToUpload[0].type,
          base64: event.target.result
        }
        this.imageSelected.emit(this.imageSrc); // Emitir la imagen capturada
      };
    }
  }

}
