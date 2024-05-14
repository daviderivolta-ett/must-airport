import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdditionalLayersService } from '../../../services/additional-layers.service';
import { AuthService } from '../../../services/auth.service';
import { AdditionalLayer, AdditionalLayerDb } from '../../../models/additional-layer.model';
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
    file: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private additionalLayersService: AdditionalLayersService) { }

  public onFileChange(event: Event): void {
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    if (!inputElement.files) return;
    const file: any = inputElement.files[0];
    this.uploadFileForm.controls['file'].setValue(file ? file.name : '');
    this.additionalLayersService.readFile(file);
  }

  public async handleSubmit(input: HTMLInputElement): Promise<void> {
    if (!this.authService.currentApp) return;

    if (!input.files) return
    const file: File = input.files[0];
    const fileName: string = this.generateFileName(file);
    const url: string = await this.additionalLayersService.uploadGeoJSON(file, fileName);
    const layer: AdditionalLayerDb = new AdditionalLayerDb(this.uploadFileForm.value.name, url, this.authService.currentApp);
    this.additionalLayersService.setAdditionalLayer(layer);
    this.additionalLayersService.geoJson = null;
  }

  private generateFileName(file: File): string {
    const fileName: string = file.name.split('.')[0].trim().replaceAll(' ', '');
    const now: string = new Date().getTime().toString();
    return `${fileName}_${now}_${this.authService.currentApp}.${file.name.split('.').pop()}`;
  }

  public toggleForm(): void {
    this.isOpen = !this.isOpen;  
  }
}