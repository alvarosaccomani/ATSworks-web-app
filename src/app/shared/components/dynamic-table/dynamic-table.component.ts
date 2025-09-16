import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

interface TableColumn {
  key: string; // Nombre de la propiedad en los datos
  caption: string; // Texto visible en la cabecera
  visible: boolean; // Indica si la columna es visible
  width?: string; // Ancho de la columna (opcional)
  type?: 'text' | 'number' | 'date' | 'datetime' | 'email' | 'boolean'; // Tipo de campo (opcional)
  validations?: { 
    type: string; 
    value?: any; 
    message: string 
  }[]; // Validaciones del campo (opcional)
  defaultValue?: ((formatDate: (date: Date) => string) => string) | string | number | null, // Valor predeterminado (opcional)
  isSelect?: boolean, // Indica si el campo es un select (opcional)
  options?:
    | { value: string; label: string }[] // Opciones estáticas
    | {
        data: () => Promise<any[]> | Observable<any[]>; // Función que devuelve los datos
        value: string; // Nombre del campo que representa el valor
        label: string; // Nombre del campo que representa la etiqueta
      }; // Configuración dinámica
  visibilityTrigger: {
    targetColumnKey: string, 
    checkProperty: string,
    showOnValue: string
  };
  template?: string; // Plantilla HTML personalizada (opcional)
  linkedProperty?: string; // Propiedad adicional que debe actualizarse (opcional)
}

@Component({
  selector: 'app-dynamic-table',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent {

  @Input() data: any[] = []; // Array de datos de entrada
  @Input() columns: TableColumn[] = []; // Array de columnas con propiedades
  @Input() scrollable: boolean = false; // Controla si la tabla es scrolleable
  @Input() maxHeight: string = '400px'; // Altura máxima para el desplazamiento
  @Input() stickyHeader: boolean = false; // Controla si el encabezado es sticky
  @Output() dataChange = new EventEmitter<any[]>(); // Emitir cambios al padre
  @Output() hasErrors = new EventEmitter<boolean>(); // Emite si hay errores

  // Configuración de visibilidad de comandos
  @Input() canAddRow: boolean = true; // Mostrar botón "Agregar fila"
  @Input() canEditRow: boolean = true; // Mostrar botón "Editar"
  @Input() canDeleteRow: boolean = true; // Mostrar botón "Eliminar"
  
  public resolvedOptions: { [key: string]: { value: string; label: string; data?: any }[] } = {}; // Almacena las opciones resueltas
  public isEditingRow: boolean = false; // Índice de la fila en edición
  public editingRowIndex: number | null = null; // Índice de la fila en edición
  public newRow: any = {}; // Objeto para la nueva fila
  public isAddingRow: boolean = false; // Indica si se está agregando una nueva fila
  public errors: { [key: string]: string } = {}; // Almacena los mensajes de error
  
  @ViewChild('firstInput', { static: false }) firstInput!: ElementRef; // Referencia al primer input

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadOptions();
  }

  /**
   * Carga las opciones dinámicas para los campos de tipo select.
   */
  private async loadOptions(): Promise<void> {
    for (const column of this.columns) {
      if (column.isSelect && typeof column.options === 'object' && !Array.isArray(column.options)) {
        try {
          const optionsConfig = column.options;
          const rawData = await this.resolveData(optionsConfig.data); // Resuelve los datos
          if(rawData) {
            this.resolvedOptions[column.key] = rawData.map((item) => ({
              value: item[optionsConfig.value], // Mapea el campo value
              label: item[optionsConfig.label], // Mapea el campo label
              data: item
            }));
          }
        } catch (error) {
          console.error(`Error al cargar las opciones para la columna ${column.key}:`, error);
          this.resolvedOptions[column.key] = []; // Asigna un array vacío en caso de error
        }
      } else if (Array.isArray(column.options)) {
        this.resolvedOptions[column.key] = column.options; // Usa las opciones estáticas
      }
    }
  }

  /**
   * Resuelve los datos de una función que devuelve una Promise o un Observable.
   */
  private resolveData(dataFunction: () => Promise<any[]> | Observable<any[]>): Promise<any[] | undefined> {
    const result = dataFunction();
    if (result instanceof Promise) {
      return result; // Devuelve directamente la Promise
    } else if (result instanceof Observable) {
      return result.toPromise(); // Convierte el Observable a una Promise
    }
    return Promise.resolve([]); // Retorna un array vacío si no es ni Promise ni Observable
  }

  /**
   * Inicia la edición de una fila.
   */
  public startEdit(index: number): void {
    if (this.canEditRow) {
      this.editingRowIndex = index;
      this.isEditingRow = !this.isEditingRow;
      this.newRow = this.convertDates(this.data[index]); // Convierte las fechas
      this.errors = {}; // Limpiar errores
      this.checkGlobalErrors(); // Verificar errores globales al iniciar el modo edición
      setTimeout(() => this.setFocus()); // Establece el foco después de que Angular actualice la vista
    }
  }

  /**
   * Guarda los cambios de una fila.
   */
  public saveRow(index: number): void {
    if (this.validateForm()) {
      const formattedRow = this.formatDatesForSave(this.newRow); // Formatea las fechas para guardar
      if (this.isAddingRow && this.canAddRow) {
        this.data.push(formattedRow);
      } else {
        this.data[index] = { ...this.newRow };
      }
      this.resetForm();
      this.checkGlobalErrors(); // Verificar errores globales después de guardar
      this.isEditingRow = !this.isEditingRow;
    } else {
      console.error('Errores de validación:', this.errors);
    }
  }

  /**
   * Elimina una fila.
   */
  public deleteRow(index: number): void {
    if (this.canDeleteRow) {
      this.data.splice(index, 1);
      this.dataChange.emit(this.data); // Emitir cambios al padre
    }
  }

  /**
   * Cancelo edicion de fila.
   */
  public cancelEditingRow(index: number): void {
    this.resetForm();
    this.isEditingRow = !this.isEditingRow;
  }

  /**
   * Agrega una nueva fila.
   */
  public addRow(): void {
    if (this.canAddRow) {
      this.isAddingRow = true; // Activar modo agregar
      this.editingRowIndex = this.data.length; // Establecer el índice de la nueva fila
      this.newRow = this.initializeNewRow(); // Inicializar newRow con valores predeterminados
      this.errors = {}; // Limpiar errores
      this.checkGlobalErrors(); // Verificar errores globales al iniciar el modo agregar
      setTimeout(() => this.setFocus()); // Establece el foco después de que Angular actualice la vista
    }
  }

  /**
   * Cancela el modo agregar fila.
   */
  cancelAdd(): void {
    this.resetForm();
  }

  /**
   * Establece el foco en el primer input.
   */
  private setFocus(): void {
    if (this.firstInput) {
      this.firstInput.nativeElement.focus();
    }
  }

  /**
   * Valida el formulario manualmente.
   */
  private validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    for (const column of this.columns) {
      if (!column.validations) continue;

      const value = this.newRow[column.key];
      for (const validation of column.validations) {
        switch (validation.type) {
          case 'required':
            if (!value) {
              this.errors[column.key] = validation.message;
              isValid = false;
            }
            break;
          case 'number':
            if (column.type === 'number' && isNaN(value)) {
              this.errors[column.key] = validation.message;
              isValid = false;
            }
            break;
          case 'minLength':
            if (value && value.length < validation.value) {
              this.errors[column.key] = validation.message;
              isValid = false;
            }
            break;
          case 'email':
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (value && !emailPattern.test(value)) {
              this.errors[column.key] = validation.message;
              isValid = false;
            }
            break;
          case 'date':
            if ((column.type === 'date' || column.type === 'datetime') && !(value instanceof Date)) {
              this.errors[column.key] = validation.message;
              isValid = false;
            }
            break;
        }
      }
    }

    this.hasErrors.emit(!isValid || Object.keys(this.errors).length > 0); // Emitir estado de errores
    return isValid;
  }

  /**
   * Verifica si hay errores globales en la tabla.
   */
  private checkGlobalErrors(): void {
    const hasUnconfirmedRows = this.editingRowIndex !== null || this.isAddingRow;
    const hasValidationErrors = Object.keys(this.errors).length > 0;

    this.hasErrors.emit(hasUnconfirmedRows || hasValidationErrors);
  }

  /**
   * Reinicia el formulario y limpia el estado.
   */
  private resetForm(): void {
    this.newRow = {};
    this.isAddingRow = false;
    this.editingRowIndex = null;
    this.errors = {}; // Limpiar errores
    this.checkGlobalErrors(); // Verificar errores globales al reiniciar
  }

  /**
   * Devuelve el tipo de input.
   */
  public getColumnInputType(column: TableColumn): string {
    if (column.type === 'date') {
      return 'date';
    } else if (column.type === 'datetime') {
      return 'datetime-local';
    } else if (column.type === 'boolean') {
      return 'checkbox';
    } else {
      return column.type || 'text'; // Valor predeterminado si no se especifica un tipo
    }
  }

  /**
   * Valida un campo individual.
   */
  public validateField(column: TableColumn): void {
    const value = this.newRow[column.key];
    delete this.errors[column.key]; // Limpiar el error previo

    if (!column.validations) return;

    for (const validation of column.validations) {
      switch (validation.type) {
        case 'required':
          if (!value) {
            this.errors[column.key] = validation.message;
          }
          break;
        case 'number':
          if (value && isNaN(value)) {
            this.errors[column.key] = validation.message;
          }
          break;
        case 'minLength':
          if (value && value.length < validation.value) {
            this.errors[column.key] = validation.message;
          }
          break;
        case 'email':
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (value && !emailPattern.test(value)) {
            this.errors[column.key] = validation.message;
          }
          break;
      }
    }
    this.checkGlobalErrors(); // Verificar errores globales al validar un campo
  }

  /**
   * Cambia el valor si es boolean.
   */
  public toggleBooleanValue(row: any, column: TableColumn): void {
    // Verifica que la columna sea realmente de tipo booleano para seguridad
    if (column.type === 'boolean') {
      // Invierte el valor actual (true -> false, false -> true)
      row[column.key] = !row[column.key];

      // Opcional pero recomendado: notifica al componente padre que los datos han cambiado.
      this.dataChange.emit(this.data);
    }
  }

  /**
   * Inicializa una nueva fila con valores predeterminados.
   */
  private initializeNewRow(): any {
    const newRow: any = {};
    for (const column of this.columns) {
      if (column.defaultValue !== undefined) {
        // Si defaultValue es una función, ejecútala; de lo contrario, usa el valor directamente
        newRow[column.key] =
        typeof column.defaultValue === 'function'
          ? column.defaultValue(this.getFormatter(column.type!)) // Pasa la función adecuadaatDateTime.bind(this)) // Pasa ambas funciones
          : column.defaultValue;
      } else if (column.isSelect) {
        // Asigna el primer valor de las opciones como predeterminado para los selects
        //newRow[column.key] = column.options[0]?.value || null;
        if (Array.isArray(column.options)) {
          newRow[column.key] = column.options[0]?.value || null;
        } else {
          console.warn(`Las opciones para la columna ${column.key} no son un array.`);
          newRow[column.key] = null; // Asigna un valor predeterminado en caso de que no sea un array
        }
      } else {
        // Si no hay defaultValue, asigna un valor predeterminado según el tipo
        if (column.type === 'date') {
          newRow[column.key] = this.formatDate(new Date());
        } else if (column.type === 'datetime') {
          newRow[column.key] = this.formatDateTime(new Date());
        } else if (column.type === 'boolean') {
          newRow[column.key] = true;
        } else {
          newRow[column.key] = ''; // Valor predeterminado para otros tipos de campos
        }
      }
    }
    return newRow;
  }

  /**
   * Retorna la función de formato adecuada según el tipo de columna.
   */
  private getFormatter(type: string): (date: Date) => string {
    if (type === 'date') {
      return this.formatDate.bind(this);
    } else if (type === 'datetime') {
      return this.formatDateTime.bind(this);
    }
    return () => ''; // Valor predeterminado si no hay un tipo válido
  }

  /**
   * Convierte los valores de fecha en un objeto según el tipo de columna.
   */
  private convertDates(row: any): any {
    const convertedRow = { ...row };
    for (const column of this.columns) {
      if (column.type === 'date' || column.type === 'datetime') {
        const value = row[column.key];
        if (value && typeof value === 'string') {
          try {
            const date = new Date(value); // Convierte el string ISO 8601 a Date
            if (column.type === 'date') {
              // Formato YYYY-MM-DD para campos de tipo date
              convertedRow[column.key] = this.formatDate(date);
            } else if (column.type === 'datetime') {
              // Formato YYYY-MM-DDTHH:mm para campos de tipo datetime-local
              convertedRow[column.key] = this.formatDateTime(date);
            }
          } catch (error) {
            console.error(`Error al convertir la fecha: ${value}`);
            convertedRow[column.key] = null; // Asegura que el valor sea null si hay un error
          }
        } else if (!value) {
          convertedRow[column.key] = null; // Asegura que el valor sea null si está vacío
        }
      }
    }
    return convertedRow;
  }

  /**
   * Formatea una fecha como YYYY-MM-DD para campos de tipo date.
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son base 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea una fecha como YYYY-MM-DDTHH:mm para campos de tipo datetime-local.
   */
  private formatDateTime(date: Date): string {
    const formattedDate = this.formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${formattedDate}T${hours}:${minutes}`;
  }

  /**
   * Formatea los valores de fecha en un objeto para guardarlos.
   */
  private formatDatesForSave(row: any): any {
    const formattedRow = { ...row };
    for (const column of this.columns) {
      if (column.type === 'date' || column.type === 'datetime') {
        const value = row[column.key];
        if (value instanceof Date) {
          formattedRow[column.key] = value.toISOString(); // Formato ISO 8601 (e.g., 2025-05-14T14:49:59.176Z)
        }
      }
    }
    return formattedRow;
  }

  /**
   * Procesa un template y reemplaza los marcadores {{ ... }} con los valores correspondientes.
   */
  public processTemplate(template: string, rowData: any): SafeHtml {
    if (!template) return '';

    // Reemplaza los marcadores {{ ... }} con los valores del objeto rowData
    const processedHtml = template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      const value = this.getNestedValue(rowData, key);
      return value !== undefined ? value : '';
    });

    // Sanitiza el HTML antes de devolverlo
    return this.sanitizer.bypassSecurityTrustHtml(processedHtml);
  }

  /**
   * Obtiene un valor anidado de un objeto usando una clave como "dtp.dtp_cod".
   */
  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  /**
   * Maneja el cambio en un campo de tipo select.
   */
  public onSelectChange(event: Event, column: TableColumn, index: number): void {
    const selectedValue = (event.target as HTMLSelectElement).value; // Este sigue siendo el UUID
    const data = this.resolvedOptions[column.key].filter(e => e.value === selectedValue)[0]["data"];

    // Actualiza el valor del campo principal
    if (this.isAddingRow) {
      this.newRow[column.key] = data;
    } else {
      this.data[index][column.key] = data;
      this.newRow[column.key] = data;
    }

    // Actualiza la propiedad vinculada si existe
    if (column.linkedProperty) {
      if (this.isAddingRow) {
        this.newRow[column.linkedProperty] = selectedValue;
      } else {
        this.data[index][column.linkedProperty] = selectedValue;
        this.newRow[column.linkedProperty] = selectedValue;
      }
    }
    
    // Logica de visibilidad
    if (column.visibilityTrigger) {
      const trigger = column.visibilityTrigger;

      const targetColumn = this.columns.find(c => c.key === trigger.targetColumnKey);

      if (targetColumn) {
        let valueToCompare: any;
        
        if (trigger.checkProperty) {
          const selectedOption = this.resolvedOptions[column.key]?.find(opt => opt.value == selectedValue);
          valueToCompare = selectedOption?.data?.[trigger.checkProperty];
        } else {
          valueToCompare = selectedValue;
        }

        const shouldBeVisible = valueToCompare == trigger.showOnValue;
        targetColumn.visible = shouldBeVisible;

        if (!shouldBeVisible && (this.isAddingRow || this.editingRowIndex !== null)) {
            this.newRow[targetColumn.key] = null;
        }
      }
    }
  }
}
