import { BackgroundColor, Color, Format } from '../types/Formatting';

export class ColoredMessageBuilder {
  private message: string = '';
  private readonly start: string = '\u001b[';
  private readonly reset: string = '\u001b[0m';

  public add(
    text: string,
    param1: Color | BackgroundColor,
    param2?: BackgroundColor | Format,
    param3: Format = Format.Normal,
  ): this {
    let color: Color | undefined;
    let backgroundColor: BackgroundColor | undefined;
    let format: Format = Format.Normal;

    if (Object.values(Color).includes(param1 as Color)) color = param1 as Color;
    if (Object.values(BackgroundColor).includes(param1 as BackgroundColor)) backgroundColor = param1 as BackgroundColor;
    if (param2 && Object.values(BackgroundColor).includes(param2 as BackgroundColor))
      backgroundColor = param2 as BackgroundColor;
    if (param2 && Object.values(Format).includes(param2 as Format)) format = param2 as Format;
    if (param3) format = param3;

    backgroundColor = backgroundColor ? (`${backgroundColor};` as BackgroundColor) : BackgroundColor.None;

    this.message += `${this.start}${format};${backgroundColor}${color}m${text}${this.reset}`;
    return this;
  }

  public addRainbow(text: string, format: Format = Format.Normal): this {
    const rainbowColors: Color[] = [Color.Red, Color.Yellow, Color.Green, Color.Cyan, Color.Blue, Color.Pink];

    for (let i: number = 0; i < text.length; i++) {
      const char: string = text.charAt(i);
      const color: Color = rainbowColors[i % rainbowColors.length];
      this.message += `${this.start}${format};${color}m${char}${this.reset}`;
    }

    return this;
  }

  public addNewLine(): this {
    this.message += '\n';
    return this;
  }

  public build(): string {
    return `\`\`\`ansi\n${this.message}\n\`\`\``;
  }
}

export function colored(
  text: string,
  param1: Color | BackgroundColor,
  param2?: BackgroundColor | Format,
  param3: Format = Format.Normal,
): string {
  return new ColoredMessageBuilder().add(text, param1, param2, param3).build();
}

export function rainbow(text: string, format: Format = Format.Normal): string {
  return new ColoredMessageBuilder().addRainbow(text, format).build();
}
