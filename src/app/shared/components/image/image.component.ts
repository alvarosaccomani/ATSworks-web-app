import { Component } from '@angular/core';

@Component({
  selector: 'app-image',
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})
export class ImageComponent {

  public imageSrc!: string;
  public filesToUpload: Array<File> = [];
  
  public changeImage(e: any): void {
    if(e.target.files && e.target.files.length) {
      this.filesToUpload = <Array<File>>e.target.files;
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.imageSrc = event.target.result;
      };
    }
  }

}
