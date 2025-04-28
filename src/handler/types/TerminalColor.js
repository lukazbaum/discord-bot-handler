const colors = {
    Red: '\x1b[31m',
    Green: '\x1b[32m',
    Yellow: '\x1b[33m',
    Blue: '\x1b[34m',
    Magenta: '\x1b[35m',
    Cyan: '\x1b[36m',
    Gray: '\x1b[90m',
};
const Reset = '\x1b[0m';
const colorFunctions = Object.fromEntries(Object.entries(colors).map(([colorName, colorValue]) => [
    colorName,
    (text) => `${colorValue}${text}${Reset}`,
]));
export const { Red, Green, Yellow, Blue, Magenta, Cyan, Gray } = colorFunctions;
