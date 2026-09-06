import chalk, {mix, previewThemes, registerTheme} from '../source/index.js';

chalk.level = 3;
console.log();
console.log(chalk.sunset('Preset themes'));
console.log(chalk.ocean('background + underline color'));
console.log(chalk.matrix('bold on dark green'));
console.log();

registerTheme('brand', {gradient: ['#ff0080', '#7928ca'], bold: true});
console.log(chalk.brand('Custom gradient theme'));
console.log(chalk.success('Color mixing'));

const mixed = mix('#3b82f6', '#ef4444', 0.5);
console.log(chalk.lemon(`red + blue = ${mixed}`));

console.log();
console.log(chalk.aurora('All preset themes'));
console.log(previewThemes());
console.log();

registerTheme('custom-brand', {
	color: 'cyan',
	background: '#0b192c',
	bold: true,
	italic: true,
});
console.log(chalk['custom-brand']('Custom theme created with createTheme()'));
console.log(chalk.lemon('Bold on yellow'));
console.log(chalk.fire('Gradient with three stops'));
console.log();
