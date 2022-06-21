/**
 * @module dangerjs
 * This plugin is intended to be imported/required and called inside your dangerfile.(js|ts)
 * by using the exported dangerPerformance() function, optionally, passing an additional
 * configuration object of exported as `DangerPerformanceConfig`
 */

import { plugin as dangerJs } from './dangerjs';
import type { Config as DangerJsConfig } from './dangerjs';

export default dangerJs;
export type { DangerJsConfig };
