/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const mark = (...args: Parameters<typeof performance.mark>) =>
	performance.mark(...args);

export interface PerformanceMark {
	readonly name: string;
	readonly startTime: number;
}


/**
 * Returns all marks, sorted by `startTime`.
 */
export const getMarks = performance.getEntries;
