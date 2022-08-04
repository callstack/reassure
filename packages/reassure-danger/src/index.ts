/**
 * @module dangerjs
 * This plugin is intended to be imported/required and called inside your dangerfile.(js|ts)
 * by using the exported dangerPlugin() function, optionally, passing an additional
 * configuration object of exported as `DangerPluginConfig`
 */

export { dangerPlugin } from './dangerjs';
import type { DangerPluginConfig } from './dangerjs';

export type { DangerPluginConfig };
