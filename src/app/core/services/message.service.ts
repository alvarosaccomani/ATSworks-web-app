import { Injectable } from '@angular/core';

declare var Swal: any;

export interface MessageConfig {
  title: string;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  confirmButtonColor?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  private defaultConfig: Partial<MessageConfig> = {
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6',
    showCancelButton: false
  };

  /**
   * Muestra un mensaje con SweetAlert2
   * @param title Título del mensaje
   * @param type Tipo de mensaje
   * @param text Texto del mensaje
   * @param callback Función a ejecutar después de aceptar
   */
  public showMessage(title: string, type: MessageConfig['type'], text: string, callback?: () => void): void {
    const config: MessageConfig = {
      title,
      type,
      text,
      ...this.defaultConfig
    };

    this.showCustomMessage(config, callback);
  }

  /**
   * Muestra un mensaje con configuración personalizada
   * @param config Configuración del mensaje
   * @param callback Función a ejecutar después de aceptar
   */
  public showCustomMessage(config: MessageConfig, callback?: () => void): void {
    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.type,
      showCancelButton: config.showCancelButton || false,
      confirmButtonColor: config.confirmButtonColor || '#3085d6',
      confirmButtonText: config.confirmButtonText || 'Aceptar',
      cancelButtonText: config.cancelButtonText || 'Cancelar',
      cancelButtonColor: '#d33'
    }).then((result: any) => {
      console.info('Message result:', result);
      
      // Ejecutar el callback si se confirma y se proporciona un callback
      if (result.isConfirmed && callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  /**
   * Métodos rápidos para tipos de mensaje comunes
   */

  public success(title: string, text: string, callback?: () => void): void {
    this.showMessage(title, 'success', text, callback);
  }

  public error(title: string, text: string, callback?: () => void): void {
    this.showMessage(title, 'error', text, callback);
  }

  public warning(title: string, text: string, callback?: () => void): void {
    this.showMessage(title, 'warning', text, callback);
  }

  public info(title: string, text: string, callback?: () => void): void {
    this.showMessage(title, 'info', text, callback);
  }

  public confirm(
    title: string, 
    text: string, 
    confirmCallback?: () => void, 
    cancelCallback?: () => void
  ): void {
    this.showCustomMessage({
      title,
      text,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }, confirmCallback);

    // Si se cancela y hay callback de cancelación
    Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result: any) => {
      if (result.isConfirmed && confirmCallback) {
        confirmCallback();
      } else if (result.isDismissed && cancelCallback) {
        cancelCallback();
      }
    });
  }
}
