/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

/**
 * @typedef {import('../../environment/common/argv').NativeParsedArgs} NativeParsedArgs
 * @param path
 * @param os
 * @param productName
 * @param cwd
 */
function factory(path: path.PlatformPath, os: typeof import('os'), productName: any, cwd: string) {
	/**
 * @param cliArgs
 * @returns
 */
	function getUserDataPath(cliArgs: any) {
		const userDataPath = doGetUserDataPath(cliArgs);
		const pathsToResolve = [userDataPath];

		// If the user-data-path is not absolute, make
		// sure to resolve it against the passed in
		// current working directory. We cannot use the
		// node.js `path.resolve()` logic because it will
		// not pick up our `VSCODE_CWD` environment variable
		// (https://github.com/microsoft/vscode/issues/120269)
		if (!path.isAbsolute(userDataPath)) {
			pathsToResolve.unshift(cwd);
		}

		return path.resolve(...pathsToResolve);
	}

	/**
 * @param cliArgs
 * @returns
 */
	function doGetUserDataPath(cliArgs: { [x: string]: any; }) {
		// 1. Support portable mode
		const portablePath = process.env['VSCODE_PORTABLE'];
		if (portablePath) {
			return path.join(portablePath, 'user-data');
		}

		// 2. Support global VSCODE_APPDATA environment variable
		let appDataPath = process.env['VSCODE_APPDATA'];
		if (appDataPath) {
			return path.join(appDataPath, productName);
		}

		// With Electron>=13 --user-data-dir switch will be propagated to
		// all processes https://github.com/electron/electron/blob/1897b14af36a02e9aa7e4d814159303441548251/shell/browser/electron_browser_client.cc#L546-L553
		// Check VSCODE_PORTABLE and VSCODE_APPDATA before this case to get correct values.
		// 3. Support explicit --user-data-dir
		const cliPath = cliArgs['user-data-dir'];
		if (cliPath) {
			return cliPath;
		}

		// 4. Otherwise check per platform
		switch (process.platform) {
			case 'win32':
				appDataPath = process.env['APPDATA'];
				if (!appDataPath) {
					const userProfile = process.env['USERPROFILE'];
					if (typeof userProfile !== 'string') {
						throw new Error(
							'Windows: Unexpected undefined %USERPROFILE% environment variable'
						);
					}

					appDataPath = path.join(userProfile, 'AppData', 'Roaming');
				}
				break;
			case 'darwin':
				appDataPath = path.join(os.homedir(), 'Library', 'Application Support');
				break;
			case 'linux':
				appDataPath =
					process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
				break;
			default:
				throw new Error('Platform not supported');
		}

		return path.join(appDataPath, productName);
	}

	return {
		getUserDataPath,
	};
}

import * as path from 'path';
import * as os from 'os';
// import * as network from 'vs/base/common/network';
// import * as resources from 'vs/base/common/resources';
import * as process from 'vs/base/common/process';
import * as fs from 'fs';

// const rootPath = resources.dirname(
// 	network.FileAccess.asFileUri('')
// );

// console.log(rootPath);

const pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }));

const fn = factory(path, os, pkg.name, process.cwd());
export const getUserDataPath = fn.getUserDataPath;
// } else if (typeof module === 'object' && typeof module.exports === 'object') {
// 	const pkg = require('../../../../../package.json');
// 	const path = require('path');
// 	const os = require('os');

// 	module.exports = factory(
// 		path,
// 		os,
// 		pkg.name,
// 		process.env['VSCODE_CWD'] || process.cwd()
// 	); // commonjs
// } else {
// 	throw new Error('Unknown context');
// }
