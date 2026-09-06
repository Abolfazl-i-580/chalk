import test from 'ava';
import chalk, {
	theme,
	applyTheme,
	createTheme,
	registerTheme,
	unregisterTheme,
	mix,
	applyGradient,
	previewThemes,
	themes,
} from '../source/index.js';

chalk.level = 3;

test('apply a preset theme by name', t => {
	t.is(theme('danger', 'foo'), '\u{1B}[38;2;239;68;68m\u{1B}[1mfoo\u{1B}[22m\u{1B}[39m');
	t.is(theme('success', 'foo'), '\u{1B}[38;2;34;197;94m\u{1B}[1mfoo\u{1B}[22m\u{1B}[39m');
});

test('apply a theme that uses background and underline colors', t => {
	t.is(
		theme('ocean', 'foo'),
		'\u{1B}[38;2;72;202;228m\u{1B}[48;2;2;48;71m\u{1B}[58;2;255;209;102m\u{1B}[1mfoo\u{1B}[22m\u{1B}[59m\u{1B}[49m\u{1B}[39m',
	);
});

test('apply a custom theme created with createTheme', t => {
	const brand = createTheme({color: 'cyan', bold: true, italic: true});
	t.is(
		theme(brand, 'foo'),
		'\u{1B}[38;2;0;255;255m\u{1B}[1m\u{1B}[3mfoo\u{1B}[23m\u{1B}[22m\u{1B}[39m',
	);
});

test('apply a theme object inline', t => {
	t.is(
		theme({color: 'red', underline: true}, 'foo'),
		'\u{1B}[38;2;255;0;0m\u{1B}[4mfoo\u{1B}[24m\u{1B}[39m',
	);
});

test('apply a gradient theme', t => {
	const gradient = createTheme({gradient: ['#000000', '#ffffff']});
	t.is(
		theme(gradient, 'ab'),
		'\u{1B}[38;2;0;0;0ma\u{1B}[39m\u{1B}[38;2;255;255;255mb\u{1B}[39m',
	);
});

test('applyGradient interpolates multiple color stops', t => {
	const result = applyGradient('ab', ['#ff0000', '#0000ff']);
	t.is(
		result,
		'\u{1B}[38;2;255;0;0ma\u{1B}[39m\u{1B}[38;2;0;0;255mb\u{1B}[39m',
	);
});

test('applyGradient supports modifiers and a background', t => {
	const result = applyGradient('x', ['#000000', '#ffffff'], {bold: true, background: '#101010'});
	t.is(result, '\u{1B}[38;2;0;0;0m\u{1B}[48;2;16;16;16m\u{1B}[1mx\u{1B}[22m\u{1B}[49m\u{1B}[39m');
});

test('applyGradient returns an empty string for empty text', t => {
	t.is(applyGradient('', ['#ff0000', '#0000ff']), '');
});

test('theme supports multiple text arguments', t => {
	t.is(theme('danger', 'foo', 'bar'), theme('danger', 'foo bar'));
});

test('theme returns a reusable function when text is omitted', t => {
	t.is(typeof theme('info'), 'function');
	t.is(theme('info')('foo'), theme('info', 'foo'));
});

test('applyTheme is an alias of theme', t => {
	t.is(applyTheme('info', 'foo'), theme('info', 'foo'));
	const paint = applyTheme('info');
	t.is(paint('foo'), theme('info', 'foo'));
});

test('throw on unknown theme names', t => {
	t.throws(() => theme('not-a-theme', 'foo'), {message: /Unknown theme `not-a-theme`/v});
});

test('registerTheme adds a named theme', t => {
	registerTheme('test-brand', {color: 'green', bold: true});
	t.is(theme('test-brand', 'foo'), chalk.hex('#00ff00').bold('foo'));
});

test('registerTheme rejects duplicate names', t => {
	t.throws(() => registerTheme('test-brand', {}), {message: /already registered/v});
});

test('unregisterTheme removes a named theme', t => {
	unregisterTheme('test-brand');
	t.throws(() => theme('test-brand', 'foo'), {message: /Unknown theme `test-brand`/v});
});

test('mix two colors into a new color', t => {
	t.is(mix('#ff0000', '#0000ff'), '#800080');
	t.is(mix('red', 'blue', 0.25), '#bf0040');
	t.is(mix('#ff0000', '#00ff00', 0.25), '#bf4000');
	t.is(mix('red', 'blue', 0), '#ff0000');
	t.is(mix('red', 'blue', 1), '#0000ff');
});

test('mix accepts rgb arrays and hsl strings', t => {
	t.is(mix([255, 0, 0], [0, 0, 255], 0.5), '#800080');
	t.is(mix('hsl(0, 100%, 50%)', 'hsl(240, 100%, 50%)', 0.5), '#800080');
});

test('mix validates the ratio', t => {
	t.throws(() => mix('red', 'blue', 2), {message: /must be a number between 0 and 1/v});
	t.throws(() => mix('red', 'blue', -1), {message: /must be a number between 0 and 1/v});
});

test('createTheme validates options', t => {
	t.throws(() => createTheme({bold: 1}), {message: /must be a boolean/v});
	t.throws(() => createTheme({color: 'not-a-color'}), {message: /Unknown color/v});
	t.throws(() => createTheme({underlineStyle: 'zigzag'}), {message: /underlineStyle/v});
	t.throws(() => createTheme({gradient: ['#ff0000']}), {message: /at least two colors/v});
	t.throws(() => createTheme(null), {message: /must be an object/v});
});

test('applyGradient validates colors', t => {
	t.throws(() => applyGradient('x', ['#ff0000']), {message: /at least two colors/v});
});

test('themes registry exposes the registered themes', t => {
	t.true(themes.has('sunset'));
	t.true(themes.names.includes('matrix'));
	t.true(themes.size > 0);
	t.true(themes.get('sunset') !== undefined);
	t.false(themes.has('not-a-theme'));
});

test('previewThemes renders every theme name', t => {
	const preview = previewThemes();
	t.regex(preview, /^sunset/mv);
	t.regex(preview, /ocean/v);
});

test('chalk.theme exposes every registered theme as a styler', t => {
	t.is(chalk.theme.danger('foo'), theme('danger', 'foo'));
	t.is(chalk.theme.sunset('foo'), theme('sunset', 'foo'));
	t.is(chalk.theme.ocean('foo'), theme('ocean', 'foo'));
});

test('chalk exposes theme names directly', t => {
	t.is(chalk.danger('foo'), theme('danger', 'foo'));
	t.is(chalk.sunset('foo'), theme('sunset', 'foo'));
	t.is(chalk.ocean('foo'), theme('ocean', 'foo'));
});

test('chalk exposes direct theme names with multiple text arguments', t => {
	t.is(chalk.danger('foo', 'bar'), theme('danger', 'foo bar'));
});

test('chalk direct theme names include themes added at runtime', t => {
	registerTheme('direct-test', {color: 'magenta', bold: true});
	t.is(chalk['direct-test']('foo'), theme('direct-test', 'foo'));
	t.true('direct-test' in chalk);
	unregisterTheme('direct-test');
});

test('chalk.theme supports multiple text arguments', t => {
	t.is(chalk.theme.danger('foo', 'bar'), theme('danger', 'foo bar'));
});

test('chalk.theme includes themes added at runtime', t => {
	registerTheme('namespace-test', {color: 'magenta', bold: true});
	t.is(chalk.theme['namespace-test']('foo'), theme('namespace-test', 'foo'));
	unregisterTheme('namespace-test');
});

test('chalk.theme lists theme names preserving registration order', t => {
	t.deepEqual(Object.keys(chalk.theme), themes.names);
	t.is(Object.keys(chalk.theme)[0], 'success');
	t.true('matrix' in chalk.theme);
});

test('chalk direct theme names are kept apart from styles', t => {
	t.is(typeof chalk.success, 'function');
	t.is(chalk.success('foo'), theme('success', 'foo'));
	t.is(chalk.bold('foo'), '\u{1B}[1mfoo\u{1B}[22m');
});

test('chalk.theme returns undefined for unknown names', t => {
	t.is(chalk.theme['not-a-theme'], undefined);
});
