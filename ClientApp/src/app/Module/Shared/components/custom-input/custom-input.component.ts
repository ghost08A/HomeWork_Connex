import { Component, OnChanges, OnInit, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { 
  DxTextBoxModule, 
  DxTextAreaModule, 
  DxNumberBoxModule, 
  DxDateBoxModule, 
  DxSelectBoxModule, 
  DxCheckBoxModule,
  DxButtonModule
} from 'devextreme-angular';
import { ErrorEditorState } from "../../directives/validate-error.directive";




export interface DropDownViewModel { key: string; value: string;}

export class DateUtilService {
  toOrgString(date: any){ return date }
}

export type InputType = 'Text' | 'Number' | 'TextArea' | 'Password' | 'Date' | 'DateTime' | 'Phone' | 'Email' | 'DropDown' | 'Checkbox' | 'Search' | string;
@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [
    DxTextBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxButtonModule
  ],
  providers: [DateUtilService],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss',
})



export class CustomInputComponent {

  @Input() componentState: ErrorEditorState = new ErrorEditorState();
  @Input() type: InputType = 'Text';
  @Input() dropdownDs: (DropDownViewModel | string)[] = [];
  @Input() attributeName: any;
  @Input() placeholder = '';
  @Input() isRequired = false;
  @Input() fieldValue: any;
  @Input() testId = '';
  @Input() label = '';
  @Input() isDisabled = false;
  @Input() layout: 'col' | 'row' = 'col';           // 'row' = label + input side by side
  @Input() labelPosition: 'top' | 'bottom' = 'top'; // 'bottom' = label below input
  @Input() fontSize?: number = 14;
  @Input() max?: number;
  @Input() min?: number;

  @Input() minDate: any = undefined;
  @Input() maxDate: any = undefined;

  /* OUTPUT */
  @Output() fieldValueChange = new EventEmitter<any>();

  public showPassword = false;
  public uiValue: any = '';
  public phoneDisplay: string = '';

  constructor(private dateUtilService: DateUtilService) { }

  ngOnInit(): void { this.syncUiValue(); }

  ngOnChanges(changes: SimpleChanges): void {
    if ('fieldValue' in changes) {
      this.syncUiValue();
    }
  }

  private syncUiValue() {
    this.uiValue = this.fieldValue === null || this.fieldValue === undefined ? '' : this.fieldValue;

    if (this.type === 'Checkbox') {
      if (this.dropdownDs?.length > 0) {
        if (typeof this.uiValue === 'string') {
          this.uiValue = this.uiValue === '' ? [] : this.uiValue.split(',');
        }
      } else {
        if (typeof this.uiValue === 'string') {
          this.uiValue = this.uiValue.toLowerCase() === 'true';
        }
      }
    } else if (this.type === 'Phone') {
      let raw = this.uiValue ? this.uiValue.toString() : '';
      this.phoneDisplay = this.formatPhoneDisplay(raw);
    }
  }

  private formatPhoneDisplay(raw: string): string {
    if (!raw) return raw;
    if (raw.startsWith('0')) {
      if (raw.length >= 7) return raw.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1-$2-$3').replace(/-$/, '');
      if (raw.length >= 4) return raw.replace(/(\d{3})(\d+)/, '$1-$2');
      return raw;
    }
    if (raw.length >= 6) return raw.replace(/(\d{2})(\d{3})(\d{0,4})/, '$1-$2-$3').replace(/-$/, '');
    if (raw.length >= 3) return raw.replace(/(\d{2})(\d+)/, '$1-$2');
    return raw;
  }

  displayExpr = (item: DropDownViewModel | string): string => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.value;
  };

  valueExpr = (item: DropDownViewModel | string): string => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.key;
  };

  onValueChange(value: any) {
    this.uiValue = value ?? '';
    let modelValue: any = value;
    if (value === '' || value === undefined) modelValue = null;
    if (this.type === 'Date' || this.type === 'DateTime') {
      modelValue = value ? this.dateUtilService.toOrgString(value) : null;
    }
    if (this.type === 'DropDown') modelValue = value ?? null;
    if (Array.isArray(modelValue)) modelValue = modelValue.join(',');
    
    this.fieldValueChange.emit(modelValue !== null && modelValue !== undefined ? modelValue.toString() : null);
  }

   clearValue() {
    this.uiValue = '';
    this.fieldValueChange.emit(null);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onPhoneInput(event: Event | undefined) {
    if (!event) return;
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/\D/g, '');
    const maxLength = raw.startsWith('0') ? 10 : 9;
    if (raw.length > maxLength) raw = raw.slice(0, maxLength);
    const display = this.formatPhoneDisplay(raw);
    this.phoneDisplay = display;
    input.value = display;
    this.fieldValueChange.emit(raw);
  }

  onPhoneClear(value: string) {
    if (!value) {
      this.phoneDisplay = '';
      this.fieldValueChange.emit('');
    }
  }

  isOptionSelected(key: string): boolean {
    if (Array.isArray(this.uiValue)) return this.uiValue.includes(key);
    return this.uiValue === key;
  }

  onMultiOptionChange(key: string, isChecked: boolean) {
    let currentValues: string[] = [];
    if (Array.isArray(this.uiValue)) currentValues = [...this.uiValue];
    else if (this.uiValue) currentValues = [this.uiValue];

    if (isChecked) {
      if (!currentValues.includes(key)) currentValues.push(key);
    } else {
      currentValues = currentValues.filter(v => v !== key);
    }
    this.onValueChange(currentValues);
  }
}
