export interface MyColorShade {
    dull: MyColor,
    regular: MyColor,
    emphasis: MyColor
}

export class MyColor {
    rgb: string;
    hex: string;
    hsl: number[];

    constructor(type: string, color: string) {
        if (type ==='rgb') {
            this.rgb = MyColor.isValidRgb(color) ? color : 'rgb(31, 111, 235)';
            this.hex = MyColor.rgbToHex(this.rgb);
            this.hsl = MyColor.rgbToHsl(this.rgb);
        } else {
            this.hex = MyColor.isValidHex(color) ? color : '#1f6feb';
            this.rgb = MyColor.hexToRgb(this.hex);
            this.hsl = MyColor.rgbToHsl(this.rgb);
        }
    }

    static createEmpty() {
        return new MyColor(
            'rgb',
            'rgb(31, 111, 235)'
        )
    }

    static fromRgb(rgb: string): MyColor {
        if (!MyColor.isValidRgb(rgb)) {
            throw new Error('Invalid RGB format');
        }

        const hex = MyColor.rgbToHex(rgb);
        return new MyColor(rgb, hex);
    }

    static fromHex(hex: string): MyColor {
        if (!MyColor.isValidHex(hex)) {
            throw new Error('Invalid HEX format');
        }

        const rgb = MyColor.hexToRgb(hex);
        return new MyColor(rgb, hex);
    }

    private static isValidRgb(rgb: string): boolean {
        return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(rgb);
    }

    private static isValidHex(hex: string): boolean {
        return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex);
    }

    public static rgbToHex(rgb: string): string {
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) {
            throw new Error('Invalid RGB format');
        }

        const [, r, g, b] = match.map(Number);
        const hexValue = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

        return `#${hexValue}`;
    }

    public static hexToRgb(hex: string): string {
        hex = hex.replace(/^#/, '');

        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgb(${r}, ${g}, ${b})`;
    }

    public static rgbToHsl(rgb: string): number[] {
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) {
            throw new Error('Invalid RGB format');
        }

        const [r, g, b] = match.slice(1).map(Number);

        const normalizedR = r / 255;
        const normalizedG = g / 255;
        const normalizedB = b / 255;

        const max = Math.max(normalizedR, normalizedG, normalizedB);
        const min = Math.min(normalizedR, normalizedG, normalizedB);

        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

            switch (max) {
                case normalizedR:
                    h = (normalizedG - normalizedB) / (max - min) + (normalizedG < normalizedB ? 6 : 0);
                    break;
                case normalizedG:
                    h = (normalizedB - normalizedR) / (max - min) + 2;
                    break;
                case normalizedB:
                    h = (normalizedR - normalizedG) / (max - min) + 4;
                    break;
            }

            h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    public static hslToRgb(hsl: number[]): string {
        const [h, s, l] = hsl;

        const normalizedH = h / 360;
        const normalizedS = s / 100;
        const normalizedL = l / 100;

        const hueToRgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = normalizedL;
        } else {
            const q = normalizedL < 0.5 ? normalizedL * (1 + normalizedS) : normalizedL + normalizedS - normalizedL * normalizedS;
            const p = 2 * normalizedL - q;
            r = hueToRgb(p, q, normalizedH + 1 / 3);
            g = hueToRgb(p, q, normalizedH);
            b = hueToRgb(p, q, normalizedH - 1 / 3);
        }

        return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
}