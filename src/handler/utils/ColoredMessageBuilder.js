import { BackgroundColor, Color, Format } from '../types/Formatting';
export class ColoredMessageBuilder {
    message = '';
    start = '\u001b[';
    reset = '\u001b[0m';
    add(text, param1, param2, param3 = Format.Normal) {
        let color;
        let backgroundColor;
        let format = Format.Normal;
        if (Object.values(Color).includes(param1))
            color = param1;
        if (Object.values(BackgroundColor).includes(param1))
            backgroundColor = param1;
        if (param2 && Object.values(BackgroundColor).includes(param2))
            backgroundColor = param2;
        if (param2 && Object.values(Format).includes(param2))
            format = param2;
        if (param3)
            format = param3;
        backgroundColor = backgroundColor ? `${backgroundColor};` : BackgroundColor.None;
        this.message += `${this.start}${format};${backgroundColor}${color}m${text}${this.reset}`;
        return this;
    }
    addRainbow(text, format = Format.Normal) {
        const rainbowColors = [Color.Red, Color.Yellow, Color.Green, Color.Cyan, Color.Blue, Color.Pink];
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            const color = rainbowColors[i % rainbowColors.length];
            this.message += `${this.start}${format};${color}m${char}${this.reset}`;
        }
        return this;
    }
    addNewLine() {
        this.message += '\n';
        return this;
    }
    build() {
        return `\`\`\`ansi\n${this.message}\n\`\`\``;
    }
}
export function colored(text, param1, param2, param3 = Format.Normal) {
    return new ColoredMessageBuilder().add(text, param1, param2, param3).build();
}
export function rainbow(text, format = Format.Normal) {
    return new ColoredMessageBuilder().addRainbow(text, format).build();
}
