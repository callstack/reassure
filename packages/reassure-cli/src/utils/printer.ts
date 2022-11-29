import chalk from 'chalk';
import { CHALK } from '../constants';

const prefix = chalk.hex(CHALK.colors.primary)('reassure-cli: ');

const hello = `
========================================================================
======================== Welcome to reassure-cli =======================
========================================================================

          .(#################          (################(        
          *##################(       (######################      
          *#########//////(##      .########/       (########,    
          *#######                *#######            (#######    
          *#######                #######/             #######/   
          *#######               (############################(   
          *#######               (#############################   
          *#######                #######/                        
          *#######                ########,                       
          *#######                 #########                      
          *#######                  (################(######      
          *#######                    /#####################(     
          *#######                        (################(      
                                                       
`;

const bye = `
========================================================================
====================== built with ❤️  at callstack ======================
================================ --- ===================================
==================== find us @ https://callstack.io ====================
============= or on GitHub @ https://github.com/callstack ==============
========================================================================
`;

export const printHello = () => console.log(chalk.hex(CHALK.colors.primary)(hello));
export const printBye = () => console.log(chalk.hex(CHALK.colors.primary)(bye));

export const printLog = (logLevel: string | undefined, ...args: string[]) => {
  if (logLevel === 'silent') return;
  if (logLevel === 'default') return;
  if (logLevel === 'verbose') return console.log(prefix, chalk.hex(CHALK.colors.dim)(args));
};

export const printWarn = (logLevel: string | undefined, ...args: string[]) => {
  if (logLevel === 'silent') return;
  if (logLevel === 'default') return console.log(prefix, chalk.hex(CHALK.colors.warn)(args));
  if (logLevel === 'verbose') return console.log(prefix, chalk.hex(CHALK.colors.warn)(args));
};

export const printError = (logLevel: string | undefined, ...args: string[]) => {
  if (logLevel === 'silent') return;
  if (logLevel === 'default') return console.log(prefix, chalk.hex(CHALK.colors.error)(args));
  if (logLevel === 'verbose') return console.log(prefix, chalk.hex(CHALK.colors.error)(args));
};
