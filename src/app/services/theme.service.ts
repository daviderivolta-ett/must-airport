import { Inject, Injectable, WritableSignal, effect, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MYCOLORTYPE, MyColor, MyColorShade } from '../models/color.model';
import { COLORMODE } from '../models/color-mode.model';
import { WebAppConfigStyle } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public colorMode: COLORMODE | null = COLORMODE.Dark;
  public colorModeSignal: WritableSignal<COLORMODE | null> = signal(null);

  constructor(@Inject(DOCUMENT) private document: Document) {
    effect(() => {
      if (this.colorModeSignal() === null) return;
      this.colorMode = this.colorModeSignal();
      this.colorMode === COLORMODE.Light ? this.setLightMode() : this.setDarkMode();
    });
  }

  public setTheme(style: WebAppConfigStyle): void {
    let colorShade: MyColorShade = this.generateColorShade(style.accentColor);
    this.document.documentElement.style.setProperty('--bg-accent', colorShade.regular.hex);
    this.document.documentElement.style.setProperty('--bg-accent-dull', colorShade.dull.hex);
    this.document.documentElement.style.setProperty('--bg-accent-emphasis', colorShade.emphasis.hex);
    this.document.documentElement.style.setProperty('--f-accent', colorShade.regular.hex);
  }

  public generateColorShade(colorString: string): MyColorShade {
    let color = colorString.includes('#') ? new MyColor(MYCOLORTYPE.Hex, colorString) : new MyColor(MYCOLORTYPE.Rgb, colorString);
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
    let dullColor = MyColor.createEmpty();
    dullColor.hsl = [...newHsl];
    dullColor.rgb = MyColor.hslToRgb(dullColor.hsl);
    dullColor.hex = MyColor.rgbToHex(dullColor.rgb);

    return dullColor;
  }

  public generateEmphasisColor(color: MyColor): MyColor {
    let newHsl = [...color.hsl];
    newHsl[2] = Math.min(100, newHsl[2] + 20);
    let emphasisColor = MyColor.createEmpty();
    emphasisColor.hsl = [...newHsl];
    emphasisColor.rgb = MyColor.hslToRgb(emphasisColor.hsl);
    emphasisColor.hex = MyColor.rgbToHex(emphasisColor.rgb);

    return emphasisColor;
  }

  public setLightMode(): void {
    this.document.documentElement.style.setProperty('color-scheme', 'light');
    this.document.documentElement.style.setProperty('--f-default', 'rgb(31, 35, 40)');
    this.document.documentElement.style.setProperty('--f-muted', 'rgb(101, 109, 118)');
    this.document.documentElement.style.setProperty('--f-subtle', 'rgb(21, 21, 21)');

    this.document.documentElement.style.setProperty('--bg-inset', 'rgb(248, 250, 253)');
    this.document.documentElement.style.setProperty('--bg-default', 'rgb(255, 255, 255)');
    this.document.documentElement.style.setProperty('--bg-overlay', 'rgb(22, 27, 34)');
    this.document.documentElement.style.setProperty('--bg-subtle', 'rgb(242, 242, 242)');
    this.document.documentElement.style.setProperty('--bg-emphasis', 'rgb(233, 238, 246)');

    this.document.documentElement.style.setProperty('--border-default', 'rgb(232, 234, 237)');    
    this.document.documentElement.style.setProperty('--border-emphasis', 'rgb(206, 206, 206)');    
    this.document.documentElement.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.1)');    

    this.document.documentElement.style.setProperty('--bg-success-dull', 'rgb(218, 251, 225)');    
    this.document.documentElement.style.setProperty('--bg-attention-dull', 'rgb(255, 248, 197)');    
    this.document.documentElement.style.setProperty('--bg-severe-dull', 'rgb(255, 241, 229)');    
    this.document.documentElement.style.setProperty('--bg-danger-dull', 'rgb(255, 235, 233)');    
    this.document.documentElement.style.setProperty('--bg-done-dull', 'rgb(251, 239, 255)');    
    this.document.documentElement.style.setProperty('--bg-other-dull', 'rgb(255, 239, 247)');    
  }
  
  public setDarkMode(): void {
    this.document.documentElement.style.setProperty('color-scheme', 'dark');
    this.document.documentElement.style.setProperty('--f-default', 'rgb(230, 237, 243)');
    this.document.documentElement.style.setProperty('--f-muted', 'rgb(125, 133, 144)');
    this.document.documentElement.style.setProperty('--f-subtle', 'rgb(110, 118, 129)');
    
    this.document.documentElement.style.setProperty('--bg-inset', 'rgb(1, 4, 9)');
    this.document.documentElement.style.setProperty('--bg-default', 'rgb(13, 17, 23)');
    this.document.documentElement.style.setProperty('--bg-overlay', 'rgb(22, 27, 34)');
    this.document.documentElement.style.setProperty('--bg-subtle', 'rgb(39, 45, 52)');
    this.document.documentElement.style.setProperty('--bg-emphasis', 'rgb(110, 118, 129)');
    
    this.document.documentElement.style.setProperty('--border-default', 'rgb(48, 54, 61)');    
    this.document.documentElement.style.setProperty('--border-emphasis', 'rgb(139, 148, 158)');
    this.document.documentElement.style.setProperty('--border-subtle', 'rgba(240, 246, 252, 0.1)'); 
    
    this.document.documentElement.style.setProperty('--bg-success-dull', 'rgb(18, 38, 30)');
    this.document.documentElement.style.setProperty('--bg-attention-dull', 'rgb(39, 33, 21)');    
    this.document.documentElement.style.setProperty('--bg-severe-dull', 'rgb(34, 26, 25)');
    this.document.documentElement.style.setProperty('--bg-danger-dull', 'rgb(37, 23, 28)'); 
    this.document.documentElement.style.setProperty('--bg-done-dull', 'rgb(21, 19, 41)');    
    this.document.documentElement.style.setProperty('--bg-other-dull', 'rgb(34, 25, 38)');    
  }
}