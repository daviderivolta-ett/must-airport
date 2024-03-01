import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SettingsStyles } from '../models/settings.model';
import { MyColor, MyColorShade } from '../models/color.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(@Inject(DOCUMENT) private document: Document) { }

  public setTheme(style: SettingsStyles): void {
    let colorShade: MyColorShade = this.generateColorShade(style.accent);
    this.document.documentElement.style.setProperty('--bg-accent', colorShade.regular.hex);
    this.document.documentElement.style.setProperty('--bg-accent-dull', colorShade.dull.hex);
    this.document.documentElement.style.setProperty('--bg-accent-emphasis', colorShade.emphasis.hex);
    this.document.documentElement.style.setProperty('--f-accent', colorShade.regular.hex);
  }

  public generateColorShade(colorString: string): MyColorShade {
    let color = new MyColor(colorString);
    let dullColor = this.generateDullColor(color);
    let emphasisColor = this.generateEmphasisColor(color);

    let colorShade: MyColorShade = {
      regular: color,
      dull: dullColor,
      emphasis: emphasisColor
    }
    return colorShade;
  }

  public generateDullColor(color: MyColor): MyColor {   
    let newHsl = [...color.hsl];
    newHsl[2] = Math.min(100, newHsl[2] - 20);
    let dullColor = new MyColor();
    dullColor.hsl = [...newHsl];
    dullColor.rgb = MyColor.hslToRgb(dullColor.hsl);
    dullColor.hex = MyColor.rgbToHex(dullColor.rgb);
    
    return dullColor;
  }

  public generateEmphasisColor(color: MyColor): MyColor {
    let newHsl = [...color.hsl];
    newHsl[2] = Math.min(100, newHsl[2] + 20);
    let emphasisColor = new MyColor();
    emphasisColor.hsl = [...newHsl];
    emphasisColor.rgb = MyColor.hslToRgb(emphasisColor.hsl);
    emphasisColor.hex = MyColor.rgbToHex(emphasisColor.rgb);
    
    return emphasisColor;
  }
}