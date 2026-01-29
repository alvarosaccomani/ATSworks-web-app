import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-camera',
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() existingImage: string | null = null;

  @ViewChild('video', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvas', { static: false }) canvasElement!: ElementRef;

  @Output() photoSaved = new EventEmitter<string>(); // Evento para emitir la imagen

  public isCameraActive: boolean = true; // Controla si la cámara está activa
  public capturedImage: string | null = null; // URL de la imagen capturada
  public isLoading: boolean = true; // Estado de carga de la cámara
  private mediaStream: MediaStream | null = null; // Almacena el stream de la cámara
  public availableCameras: { id: string, label: string }[] = [];
  public currentCameraId: string = '';
  public isSwitchingCamera: boolean = false;

  ngAfterViewInit() {
    // Si ya tenemos existingImage, mostrarla
    if (this.existingImage) {
      this.capturedImage = this.existingImage;
      this.isCameraActive = false;
      this.isLoading = false;
    } else {
      this.startCamera();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingImage'] && changes['existingImage'].currentValue !== changes['existingImage'].previousValue) {
      const newImage = changes['existingImage'].currentValue;
      if (newImage) {
        this.capturedImage = newImage;
        this.isCameraActive = false;
        this.isLoading = false;
      } else {
        // Si se borra la imagen existente, volver a la cámara
        this.capturedImage = null;
        this.isCameraActive = true;
        this.startCamera();
      }
    }
  }

  public async startCamera(cameraId?: string) {
    try {
      // Mostrar el mensaje de carga
      this.isLoading = true;

      // Detener el stream anterior si existe
      if (this.mediaStream) {
        this.stopCamera();
      }

      // Obtener las cámaras disponibles primero
      await this.getAvailableCameras();

      // Configurar constraints para la cámara
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraId ? undefined : { ideal: 'environment' }, // 'environment' para trasera, 'user' para frontal
          deviceId: cameraId ? { exact: cameraId } : undefined
        }
      };

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
      
      // Solo alertar si no hay imagen existente ni capturada
      if (!this.existingImage && !this.capturedImage) {
        alert('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    }
  }

  private async getAvailableCameras(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          id: device.deviceId,
          label: device.label || `Cámara ${this.availableCameras.length + 1}`
        }));

      // Si no hay cámaras seleccionadas, usar la primera disponible
      if (!this.currentCameraId && this.availableCameras.length > 0) {
        this.currentCameraId = this.availableCameras[0].id;
      }
    } catch (error) {
      console.error('Error al obtener cámaras disponibles:', error);
    }
  }

  public async switchCamera(): Promise<void> {
    if (this.availableCameras.length <= 1) {
      alert('No hay más cámaras disponibles para cambiar.');
      return;
    }

    this.isSwitchingCamera = true;
    
    // Encontrar el siguiente índice de cámara
    const currentIndex = this.availableCameras.findIndex(
      cam => cam.id === this.currentCameraId
    );
    
    const nextIndex = (currentIndex + 1) % this.availableCameras.length;
    const nextCamera = this.availableCameras[nextIndex];

    this.currentCameraId = nextCamera.id;
    await this.startCamera(this.currentCameraId);
    
    this.isSwitchingCamera = false;
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