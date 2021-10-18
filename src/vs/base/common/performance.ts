/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
let marks: PerformanceMark[] = [];

export const mark = (...args: Parameters<typeof performance.mark>) => {
	console.log(...args)
	if (!import.meta.env.SSR) {
		performance.mark(...args)
	}
	marks.push({ name: args[0], startTime: Date.now() });
}
// performance.mark(...args);

export interface PerformanceMark {
	readonly name: string;
	readonly startTime: number;
}


/**
 * Returns all marks, sorted by `startTime`.
 */
export const getMarks = () => marks;
