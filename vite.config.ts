/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import path from 'path-browserify';
import { Alias, defineConfig } from 'vite';
import resolve from '@rollup/plugin-node-resolve';

let basePath = path.resolve(__dirname);
console.log(basePath);

export default defineConfig({
	// publicDir: 'src',
	// plugins: [{
	// 	config: (config, env) => {
	// 		// if (env.)
	// 	}
	// }],
	esbuild: {
		banner: `let require = {
			toUrl: (s) => {
				let meta = import.meta
				// if (s.length > 0 && typeof global !== 'undefined') {
				// 	try {
				// 		console.log(global.require.resolve(s))
				// 	} catch (e) {
				// 		console.log('ERROR', e)
				// 	}
				// }
				if (s === 'bootstrap-fork') {
					return "${basePath}/src/bootstrap-vite-fork.js"
				}
				return "${basePath}/" + (s.length === 0 ? 'package.json' : s);
			},
			__$__nodeRequire: import.meta.env.SSR ? ((...args) => global.require(...args)) : undefined
		};`,
	},
	build: {
		rollupOptions: {
			input: {
				index: path.resolve(__dirname, 'index.html'),
				webExtensionHost: path.resolve(
					__dirname,
					'src/vs/workbench/services/extensions/worker/httpWebWorkerExtensionHostIframe.html',
				),
			},
		},
	},

	resolve: {
		alias: [
			{
				find: /^vs\/css\!(.*)/,
				replacement: '$1.css',
				customResolver: resolve({
					extensions: ['.css'],
				}),
			},
			{ find: 'vs/base/common/marked/marked', replacement: 'marked' },
			{ find: 'vs/base/browser/dompurify/dompurify', replacement: 'dompurify' },
			// { find: 'vs/base/common/semver/semver', replacement: 'semver' },
			{ find: 'vs', replacement: path.resolve(__dirname, 'src/vs') },
		] as Alias[],
	},
});
