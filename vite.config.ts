/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import path from "path";
import { Alias, defineConfig } from "vite";
import resolve from "@rollup/plugin-node-resolve";

const customResolver = resolve({
	extensions: [".css"],
});

export default defineConfig({
	publicDir: "src",
	// esbuild: { tsconfigRaw: { compilerOptions: { useDefineForClassFields: true, importsNotUsedAsValues: 'remove' } } },
	build: {
		rollupOptions: {
			input: {
				index: path.resolve(__dirname, "index.html"),
				webExtensionHost: path.resolve(__dirname, "src/vs/workbench/services/extensions/worker/httpWebWorkerExtensionHostIframe.html"),
			}
		}
	},
	resolve: {
		alias: [
			{ find: /^vs\/css\!(.*)/, replacement: "$1.css", customResolver },
			{ find: "vs/base/common/marked/marked", replacement: "marked" },
			{ find: "vs/base/browser/dompurify/dompurify", replacement: "dompurify" },
			{ find: "vs/base/common/semver/semver", replacement: "semver" },
			{ find: "vs", replacement: path.resolve(__dirname, "src/vs") },
		] as Alias[],
	},

});
