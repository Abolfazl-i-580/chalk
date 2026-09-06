import chalk from './source/index.js';

chalk.level = 3;

const text = 'سلام خوبی چطوری چ خبر اینم از متن';

console.log(chalk.sunset(text));
console.log(chalk.matrix(text));
console.log(chalk.ocean(text));
console.log(chalk.cyberpunk(text));
console.log(chalk.fire(text));
console.log(chalk.lemon(text));
