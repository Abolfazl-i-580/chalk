/**
A color accepted by the theme system.

Can be a hex string (`#ff0000`, `#f00`), a named ANSI color (`'red'`, `'blueBright'`, `'gray'`), an RGB array (`[255, 0, 0]`), an `rgb()`/`hsl()` string, or a 24-bit integer.
*/
export type ThemeColor =
	| string
	| readonly [red: number, green: number, blue: number]
	| number;

/**
A compiled theme returned by `createTheme`. Pass it to `theme()` or `applyTheme()` to style text.
*/
export interface Theme {
	readonly color: readonly [red: number, green: number, blue: number] | null;
	readonly background: readonly [red: number, green: number, blue: number] | null;
	readonly underlineColor: readonly [red: number, green: number, blue: number] | null;
	readonly underlineStyle: 'double' | 'curly' | 'dotted' | 'dashed' | null;
	readonly gradient: readonly (readonly [red: number, green: number, blue: number])[] | null;
	readonly modifiers: Readonly<Record<'bold' | 'dim' | 'italic' | 'underline' | 'overline' | 'inverse' | 'hidden' | 'strikethrough', boolean>>;
}

/**
Function returned by `chalk.theme.<name>`. Call it with text to style it.

```js
import chalk from 'chalk';

const paint = chalk.theme.sunset;
console.log(paint('Hello world!'));
```
*/
export type ThemeStyler = (...text: unknown[]) => string;

/**
The `chalk.theme` namespace on the main Chalk instance. Every registered theme name is a callable property:

```js
import chalk from 'chalk';

console.log(chalk.theme.sunset('Hello world!'));
```

Themes added at runtime with `registerTheme()` are available here too:

```js
import chalk, {registerTheme} from 'chalk';

registerTheme('brand', {color: 'cyan', bold: true});
console.log(chalk.theme.brand('Styled text'));
```
*/
export interface ThemeNamespace {
	readonly success: ThemeStyler;
	readonly warning: ThemeStyler;
	readonly danger: ThemeStyler;
	readonly info: ThemeStyler;
	readonly sunset: ThemeStyler;
	readonly ocean: ThemeStyler;
	readonly forest: ThemeStyler;
	readonly matrix: ThemeStyler;
	readonly cyberpunk: ThemeStyler;
	readonly midnight: ThemeStyler;
	readonly mint: ThemeStyler;
	readonly fire: ThemeStyler;
	readonly ice: ThemeStyler;
	readonly candy: ThemeStyler;
	readonly lemon: ThemeStyler;
	readonly lava: ThemeStyler;
	readonly aurora: ThemeStyler;

	/**
	Themes registered at runtime with `registerTheme()`.
	*/
	readonly [themeName: string]: ThemeStyler;
}

/**
The theme namespace attached to the main Chalk instance as `chalk.theme`.
*/
export const themeNamespace: ThemeNamespace;

/**
Options for `createTheme`, `registerTheme`, and `theme()`.
*/
export interface ThemeOptions {
	/**
	Foreground/text color.
	*/
	readonly color?: ThemeColor;

	/**
	Background color.
	*/
	readonly background?: ThemeColor;

	/**
	Underline color. Only visible when an underline style is also applied.
	*/
	readonly underlineColor?: ThemeColor;

	/**
	Make the text bold.
	*/
	readonly bold?: boolean;

	/**
	Make the text have lower opacity.
	*/
	readonly dim?: boolean;

	/**
	Make the text italic. *(Not widely supported)*
	*/
	readonly italic?: boolean;

	/**
	Put a horizontal line below the text. *(Not widely supported)*
	*/
	readonly underline?: boolean;

	/**
	Style of the underline. Only visible when an underline style is also applied.
	*/
	readonly underlineStyle?: 'double' | 'curly' | 'dotted' | 'dashed';

	/**
	Put a horizontal line above the text. *(Not widely supported)*
	*/
	readonly overline?: boolean;

	/**
	Invert the background and foreground colors.
	*/
	readonly inverse?: boolean;

	/**
	Print the text but make it invisible.
	*/
	readonly hidden?: boolean;

	/**
	Put a horizontal line through the center of the text. *(Not widely supported)*
	*/
	readonly strikethrough?: boolean;

	/**
	When set, the text is colored character by character, interpolating between at least two colors from first to last.
	*/
	readonly gradient?: readonly ThemeColor[];
}

/**
Apply a preset or custom theme to text.

```js
import {theme} from 'chalk';

console.log(theme('sunset', 'Hello world!'));
```

When `text` is omitted, a reusable function is returned instead:

```js
const paint = theme('ocean');
console.log(paint('Deep blue text'));
```

@param nameOrTheme - Name of a registered theme, a theme returned by `createTheme()`, or a `ThemeOptions` object.
@param text - Text to style. Multiple arguments are separated by a space.
*/
export function theme(nameOrTheme: string | Theme | ThemeOptions, ...text: unknown[]): string | ((text: unknown) => string);

/**
Alias for `theme()`, kept for readability when used without inline text.
*/
export function applyTheme(nameOrTheme: string | Theme | ThemeOptions, ...text: unknown[]): string | ((text: unknown) => string);

/**
Compile a theme definition into a reusable `Theme` object.

```js
import {createTheme, theme} from 'chalk';

const brand = createTheme({
	color: '#ff6b6b',
	background: '#2d1b2e',
	bold: true,
});
console.log(theme(brand, 'Styled with a custom theme'));
```
*/
export function createTheme(definition: ThemeOptions): Theme;

/**
Register a named theme so it can be used by string with `theme()`.

@returns The registered theme name.
@throws If the name is not a non-empty string or the theme is already registered.
*/
export function registerTheme(name: string, definition: ThemeOptions): string;

/**
Remove a registered theme.

@throws If the theme is not registered.
*/
export function unregisterTheme(name: string): void;

/**
Blend two colors into a new hex color.

```js
import {mix} from 'chalk';

console.log(mix('red', 'blue', 0.5));
//=> '#800080'

console.log(mix('#ff0000', '#00ff00', 0.25));
//=> '#bf4000'
```

@param ratio - How much of `colorB` to blend in, from `0` to `1`. Defaults to `0.5`.
@returns A hex color string like `'#rrggbb'`.
*/
export function mix(colorA: ThemeColor, colorB: ThemeColor, ratio?: number): string;

/**
Color text with a gradient across at least two colors.

```js
import {applyGradient} from 'chalk';

console.log(applyGradient('Gradient text', ['#ff0000', '#0000ff']));
```

@param options - Extra styling, such as `bold: true` or `background: '#000000'`.
*/
export function applyGradient(text: string, colors: readonly ThemeColor[], options?: ThemeOptions): string;

/**
Render every registered theme next to its name. Great for discovering the available themes.

```js
import {previewThemes} from 'chalk';

console.log(previewThemes());
```
*/
export function previewThemes(): string;

/**
Introspection object for the theme registry.
*/
export const themes: {
	/**
	Names of every registered theme.
	*/
	readonly names: readonly string[];

	/**
	Number of registered themes.
	*/
	readonly size: number;

	/**
	Check whether a theme is registered.
	*/
	has(name: string): boolean;

	/**
	Get a registered theme, or `undefined` if it does not exist.
	*/
	get(name: string): Theme | undefined;

	/**
	See `previewThemes()`.
	*/
	preview(): string;
};

/**
The built-in themes that are registered on import.

Useful to discover what is available or to build a custom theme from one of them:

```js
import {presetThemes, createTheme} from 'chalk';

const custom = createTheme({...presetThemes.sunset, italic: true});
```
*/
export const presetThemes: Readonly<Record<string, ThemeOptions>>;