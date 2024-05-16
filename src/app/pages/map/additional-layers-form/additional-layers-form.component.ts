import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AdditionalLayersService } from '../../../services/additional-layers.service';
import { AuthService } from '../../../services/auth.service';
import { AdditionalLayer, AdditionalLayerDb, AdditionalLayerStyle } from '../../../models/additional-layer.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-additional-layers-form',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './additional-layers-form.component.html',
  styleUrl: './additional-layers-form.component.scss'
})
export class AdditionalLayersFormComponent {
  public layers: AdditionalLayer[] = [];
  public isOpen: boolean = false;
  public uploadFileForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    fileName: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private additionalLayersService: AdditionalLayersService) {
    // this.uploadFileForm.valueChanges.subscribe(change => console.log(this.uploadFileForm));
  }

  public async onFileChange(event: Event): Promise<void> {
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    if (!inputElement.files) return;
    const file: any = inputElement.files[0];
    // const isValid: boolean = await this.additionalLayersService.readFile(file);
    const fileContentString: string | undefined = await this.additionalLayersService.readFile(file);
    let isValid: boolean = false;
    fileContentString ? isValid = this.additionalLayersService.isValidGeoJSON(fileContentString) : isValid = false;
    this.uploadFileForm.controls['fileName'].setValue(isValid ? file.name : '');
  }

  public async handleSubmit(input: HTMLInputElement): Promise<void> {
    if (!this.authService.currentApp) return;

    if (!input.files) return
    const file: File = input.files[0];

    const fileContentString: string | undefined = await this.additionalLayersService.readFile(file);

    if (!fileContentString) {
      this.uploadFileForm.reset();
      input.value = '';
      return;
    }

    const fileName: string = this.generateFileName(file);
    let style: AdditionalLayerStyle = this.additionalLayersService.getGeoJsonStyle(JSON.parse(fileContentString));

    await this.additionalLayersService.uploadGeoJSON(file, fileName);
    const layer: AdditionalLayerDb = new AdditionalLayerDb(this.uploadFileForm.value.name, fileName, this.authService.currentApp, style);
    this.additionalLayersService.setAdditionalLayer(layer);

    this.uploadFileForm.reset();
    input.value = '';
  }

  private generateFileName(file: File): string {
    const fileName: string = file.name.split('.')[0].trim().replaceAll(' ', '');
    const now: string = new Date().getTime().toString();
    return `${fileName}_${now}_${this.authService.currentApp}.${file.name.split('.').pop()}`;
  }

  public toggleForm(): void {
    this.isOpen = !this.isOpen;
  }

  private fileNameValidator(): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      const value: string = control.value;
      if (value !== '') return null;
      return { 'error': { value } }
    }
  }
}