import chalk from './index.js';

const THEME = Symbol('THEME');
const underlineStyleNames = ['double', 'curly', 'dotted', 'dashed'];
const modifierKeys = ['bold', 'dim', 'italic', 'underline', 'overline', 'inverse', 'hidden', 'strikethrough'];

const integerToRgb = integer => [
	Math.floor(integer / 65_536),
	Math.floor(integer / 256) % 256,
	integer % 256,
];

const hexToRgb = hex => {
	let normalized = hex.replace('#', '');
	if (normalized.length === 3) {
		normalized = normalized[0] + normalized[0] + normalized[1] + normalized[1] + normalized[2] + normalized[2];
	}

	const integer = Number.parseInt(normalized, 16);
	if (normalized.length !== 6 || !Number.isSafeInteger(integer)) {
		throw new Error(`Invalid hex color \`${hex}\``);
	}

	return integerToRgb(integer);
};

const rgbToHex = (red, green, blue) => {
	const channel = value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
	return `#${channel(red)}${channel(green)}${channel(blue)}`;
};

const hslToRgb = (hue, saturation, lightness) => {
	const h = ((hue % 360) + 360) % 360;
	const chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
	const section = h / 60;
	const x = chroma * (1 - Math.abs((section % 2) - 1));
	let rgb;
	if (section < 1) {
		rgb = [chroma, x, 0];
	} else if (section < 2) {
		rgb = [x, chroma, 0];
	} else if (section < 3) {
		rgb = [0, chroma, x];
	} else if (section < 4) {
		rgb = [0, x, chroma];
	} else if (section < 5) {
		rgb = [x, 0, chroma];
	} else {
		rgb = [chroma, 0, x];
	}

	const match = lightness - (chroma / 2);
	return rgb.map(value => Math.round((value + match) * 255));
};

const namedColors = new Map(Object.entries({
	black: '#000000',
	red: '#ff0000',
	green: '#00ff00',
	yellow: '#ffff00',
	blue: '#0000ff',
	magenta: '#ff00ff',
	cyan: '#00ffff',
	white: '#ffffff',
	gray: '#808080',
	grey: '#808080',
	blackBright: '#555555',
	redBright: '#ff5555',
	greenBright: '#55ff55',
	yellowBright: '#ffff55',
	blueBright: '#5555ff',
	magentaBright: '#ff55ff',
	cyanBright: '#55ffff',
	whiteBright: '#ffffff',
}));

const parseColorString = value => {
	if (namedColors.has(value)) {
		return hexToRgb(namedColors.get(value));
	}

	if (value.startsWith('#')) {
		return hexToRgb(value);
	}

	const rgb = value.match(/^rgba?\(\s*(?<red>\d+)\s*,\s*(?<green>\d+)\s*,\s*(?<blue>\d+)\s*(?:,\s*[\d.]+%?\s*)?\)$/v);
	if (rgb) {
		return [Number(rgb.groups.red), Number(rgb.groups.green), Number(rgb.groups.blue)];
	}

	const hsl = value.match(/^hsla?\(\s*(?<hue>\d+(?:\.\d+)?)\s*,\s*(?<saturation>\d+(?:\.\d+)?)%\s*,\s*(?<lightness>\d+(?:\.\d+)?)%\s*(?:,\s*[\d.]+%?\s*)?\)$/v);
	if (hsl) {
		return hslToRgb(Number(hsl.groups.hue), Number(hsl.groups.saturation) / 100, Number(hsl.groups.lightness) / 100);
	}

	throw new Error(`Unknown color \`${value}\``);
};

const parseColorToRgb = color => {
	if (typeof color === 'string') {
		return parseColorString(color.trim().toLowerCase());
	}

	if (Array.isArray(color)) {
		if (color.length !== 3 || color.some(value => !Number.isFinite(value))) {
			throw new Error(`Invalid RGB color \`${JSON.stringify(color)}\``);
		}

		return color.map(Number);
	}

	if (Number.isFinite(color)) {
		return integerToRgb(color);
	}

	throw new TypeError(`Unsupported color \`${String(color)}\``);
};

const interpolateStops = (stops, ratio) => {
	if (ratio <= 0) {
		return stops[0];
	}

	if (ratio >= 1) {
		return stops.at(-1);
	}

	const scaled = ratio * (stops.length - 1);
	const index = Math.floor(scaled);
	const segmentRatio = scaled - index;
	const [redA, greenA, blueA] = stops[index];
	const [redB, greenB, blueB] = stops[index + 1];

	return [
		redA + ((redB - redA) * segmentRatio),
		greenA + ((greenB - greenA) * segmentRatio),
		blueA + ((blueB - blueA) * segmentRatio),
	];
};

const applyModifiers = (styler, {bold, dim, italic, underline, overline, inverse, hidden, strikethrough, underlineStyle}) => {
	if (bold) {
		styler = styler.bold;
	}

	if (dim) {
		styler = styler.dim;
	}

	if (italic) {
		styler = styler.italic;
	}

	if (underline) {
		styler = styler.underline;
	}

	if (overline) {
		styler = styler.overline;
	}

	if (inverse) {
		styler = styler.inverse;
	}

	if (hidden) {
		styler = styler.hidden;
	}

	if (strikethrough) {
		styler = styler.strikethrough;
	}

	if (underlineStyle) {
		styler = styler['underline' + underlineStyle[0].toUpperCase() + underlineStyle.slice(1)];
	}

	return styler;
};

export const mix = (colorA, colorB, ratio = 0.5) => {
	if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
		throw new Error('The `ratio` must be a number between 0 and 1');
	}

	const [redA, greenA, blueA] = parseColorToRgb(colorA);
	const [redB, greenB, blueB] = parseColorToRgb(colorB);

	return rgbToHex(
		redA + ((redB - redA) * ratio),
		greenA + ((greenB - greenA) * ratio),
		blueA + ((blueB - blueA) * ratio),
	);
};

export const applyGradient = (text, colors, options = {}) => {
	const characterArray = [...String(text)];
	if (characterArray.length === 0) {
		return '';
	}

	if (!Array.isArray(colors) || colors.length < 2) {
		throw new Error('The `colors` must be an array of at least two colors');
	}

	const stops = colors.map(color => parseColorToRgb(color));
	const background = options.background === undefined ? undefined : rgbToHex(...parseColorToRgb(options.background));
	const underlineColor = options.underlineColor === undefined ? undefined : rgbToHex(...parseColorToRgb(options.underlineColor));

	return characterArray
		.map((character, index) => {
			const ratio = characterArray.length === 1 ? 0 : index / (characterArray.length - 1);
			let styler = chalk.hex(rgbToHex(...interpolateStops(stops, ratio)));

			if (background) {
				styler = styler.bgHex(background);
			}

			if (underlineColor) {
				styler = styler.underlineHex(underlineColor);
			}

			return applyModifiers(styler, options)(character);
		})
		.join('');
};

const parseThemeColor = value => value === undefined ? null : parseColorToRgb(value);

const validateModifiers = definition => {
	for (const key of modifierKeys) {
		if (definition[key] !== undefined && typeof definition[key] !== 'boolean') {
			throw new TypeError(`The theme option \`${key}\` must be a boolean`);
		}
	}
};

const validateUnderlineStyle = underlineStyle => {
	if (underlineStyle !== undefined && !underlineStyleNames.includes(underlineStyle)) {
		throw new Error(`The \`underlineStyle\` must be one of: ${underlineStyleNames.join(', ')}`);
	}
};

const validateGradient = gradient => {
	if (gradient !== undefined && (!Array.isArray(gradient) || gradient.length < 2)) {
		throw new Error('The `gradient` must be an array of at least two colors');
	}
};

export const createTheme = definition => {
	if (typeof definition !== 'object' || definition === null || Array.isArray(definition)) {
		throw new TypeError('A theme definition must be an object');
	}

	const {
		color,
		background,
		underlineColor,
		underlineStyle,
		gradient,
		bold = false,
		dim = false,
		italic = false,
		underline = false,
		overline = false,
		inverse = false,
		hidden = false,
		strikethrough = false,
	} = definition;

	validateModifiers(definition);
	validateUnderlineStyle(underlineStyle);
	validateGradient(gradient);

	return Object.freeze({
		[THEME]: true,
		color: parseThemeColor(color),
		background: parseThemeColor(background),
		underlineColor: parseThemeColor(underlineColor),
		underlineStyle: underlineStyle === undefined ? null : underlineStyle,
		gradient: gradient === undefined ? null : gradient.map(gradientColor => parseColorToRgb(gradientColor)),
		modifiers: Object.freeze({
			bold,
			dim,
			italic,
			underline,
			overline,
			inverse,
			hidden,
			strikethrough,
		}),
	});
};

const themeRegistry = new Map();

export const registerTheme = (name, definition) => {
	if (typeof name !== 'string' || name.trim() === '') {
		throw new TypeError('The theme name must be a non-empty string');
	}

	if (themeRegistry.has(name)) {
		throw new Error(`The theme \`${name}\` is already registered`);
	}

	themeRegistry.set(name, createTheme(definition));

	return name;
};

export const unregisterTheme = name => {
	if (!themeRegistry.delete(name)) {
		throw new Error(`The theme \`${name}\` is not registered`);
	}
};

const themeOptions = themeObject => ({
	background: themeObject.background === null ? undefined : rgbToHex(...themeObject.background),
	underlineColor: themeObject.underlineColor === null ? undefined : rgbToHex(...themeObject.underlineColor),
	...themeObject.modifiers,
	underlineStyle: themeObject.underlineStyle ?? undefined,
});

const applyThemeObject = (themeObject, string) => {
	if (themeObject.gradient !== null) {
		return applyGradient(string, themeObject.gradient, themeOptions(themeObject));
	}

	let styler = chalk;
	if (themeObject.color !== null) {
		styler = styler.hex(rgbToHex(...themeObject.color));
	}

	if (themeObject.background !== null) {
		styler = styler.bgHex(rgbToHex(...themeObject.background));
	}

	if (themeObject.underlineColor !== null) {
		styler = styler.underlineHex(rgbToHex(...themeObject.underlineColor));
	}

	return applyModifiers(styler, themeOptions(themeObject))(string);
};

export const theme = (nameOrTheme, ...text) => {
	let themeObject;
	if (typeof nameOrTheme === 'string') {
		themeObject = themeRegistry.get(nameOrTheme);
		if (themeObject === undefined) {
			throw new Error(`Unknown theme \`${nameOrTheme}\`. Available themes: ${themeRegistry.keys().toArray().join(', ')}`);
		}
	} else if (nameOrTheme?.[THEME]) { // eslint-disable-line unicorn/no-computed-property-existence-check -- Reads the Boolean marker, not a property existence check.
		themeObject = nameOrTheme;
	} else {
		themeObject = createTheme(nameOrTheme);
	}

	if (text.length === 0) {
		return value => applyThemeObject(themeObject, String(value));
	}

	return applyThemeObject(themeObject, text.join(' '));
};

export const applyTheme = (nameOrTheme, ...text) => theme(nameOrTheme, ...text);

export const previewThemes = () => {
	const names = themeRegistry.keys().toArray();
	const width = Math.max(...names.map(name => name.length));
	return names
		.map(name => `${name.padEnd(width)} : ${applyThemeObject(themeRegistry.get(name), 'Hello world!')}`)
		.join('\n');
};

export const themes = {
	get names() {
		return themeRegistry.keys().toArray();
	},

	get size() {
		return themeRegistry.size;
	},

	has: name => themeRegistry.has(name),
	get: name => themeRegistry.get(name),
	preview: previewThemes,
};

export const presetThemes = {
	success: {color: '#22c55e', bold: true},
	warning: {color: '#f59e0b', bold: true},
	danger: {color: '#ef4444', bold: true},
	info: {color: '#3b82f6', bold: true},

	sunset: {gradient: ['#ff6b6b', '#ffd166'], bold: true},
	ocean: {
		color: '#48cae4',
		background: '#023047',
		bold: true,
		underlineColor: '#ffd166',
	},
	forest: {color: '#a7c957', background: '#15211a', italic: true},
	matrix: {color: '#00ff41', background: '#001a00', bold: true},
	cyberpunk: {gradient: ['#f72585', '#7209b7'], bold: true},
	midnight: {color: '#e0e1dd', background: '#1a1a2e', bold: true},
	mint: {color: '#003d33', background: '#9fffcb', bold: true},
	fire: {gradient: ['#f94144', '#f8961e', '#f9c74f'], bold: true},
	ice: {gradient: ['#90e0ef', '#0077b6', '#003049'], bold: true},
	candy: {gradient: ['#ff9a9e', '#fad0c4', '#a18cd1']},
	lemon: {color: '#333300', background: '#fff1ad', bold: true},
	lava: {gradient: ['#ff512f', '#dd2476'], bold: true},
	aurora: {gradient: ['#00f5a0', '#00d9f5', '#7b2ff7'], italic: true},
};

for (const [name, definition] of Object.entries(presetThemes)) {
	registerTheme(name, definition);
}

const themeStyler = name => (...text) => theme(name, ...text);

export const themeNamespace = new Proxy(
	{},
	{
		ownKeys: () => themeRegistry.keys().toArray(),
		get(target, name) {
			if (typeof name !== 'string' || !themeRegistry.has(name)) {
				return undefined;
			}

			return themeStyler(name);
		},
		has(target, name) {
			return typeof name === 'string' && themeRegistry.has(name);
		},
		getOwnPropertyDescriptor(target, name) {
			if (typeof name === 'string' && themeRegistry.has(name)) {
				return {enumerable: true, configurable: true, value: themeStyler(name)};
			}
		},
	},
);
