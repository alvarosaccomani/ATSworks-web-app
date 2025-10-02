import { Component, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-camera',
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements AfterViewInit, OnDestroy {

  @ViewChild('video', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvas', { static: false }) canvasElement!: ElementRef;

  @Output() photoSaved = new EventEmitter<string>(); // Evento para emitir la imagen

  public isCameraActive: boolean = true; // Controla si la cámara está activa
  public capturedImage: string | null = null; // URL de la imagen capturada
  public isLoading: boolean = true; // Estado de carga de la cámara
  private mediaStream: MediaStream | null = null; // Almacena el stream de la cámara

  ngAfterViewInit() {
    this.startCamera();
  }

  public async startCamera() {
    try {
      // Mostrar el mensaje de carga
      this.isLoading = true;

      // Detener el stream anterior si existe
      if (this.mediaStream) {
        this.stopCamera();
      }

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.mediaStream = stream;

      // Verificar que el elemento video esté disponible
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;

        // Esperar a que el video esté listo para reproducirse
        await this.videoElement.nativeElement.play();

        // Ocultar el mensaje de carga
        this.isLoading = false;
      } else {
        console.error('El elemento video no está disponible.');
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      this.isLoading = false; // Ocultar el mensaje de carga en caso de error
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }

  public capturePhoto(): void {
    if (!this.videoElement || !this.videoElement.nativeElement) {
      console.error('El elemento de video no está disponible.');
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    // Configurar el lienzo con las mismas dimensiones que el video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el fotograma actual del video en el lienzo
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir el contenido del lienzo a una URL de imagen
    this.capturedImage = canvas.toDataURL('image/png');

    // Ocultar la cámara
    this.isCameraActive = false;
  }

  public savePhoto(): void {
    if (this.capturedImage) {
      this.photoSaved.emit(this.capturedImage); // Emitir la imagen capturada
      console.log('Foto guardada.');
    }
  }

  public retakePhoto(): void {
    // Mostrar la cámara nuevamente
    this.isCameraActive = true;
    this.capturedImage = null;

    // Reiniciar la cámara
    this.startCamera();
  }

  public stopCamera(): void {
    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      tracks.forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  ngOnDestroy() {
    // Detener la cámara cuando el componente se destruye
    this.stopCamera();
  }
}
