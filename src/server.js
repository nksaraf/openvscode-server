/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Gitpod. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
"use strict";

// const path = require('path');
// process.env.VSCODE_INJECT_NODE_MODULE_LOOKUP_PATH = path.join(__dirname, '../remote/node_modules');
// require('./bootstrap-node').injectNodeModuleLookupPath(process.env.VSCODE_INJECT_NODE_MODULE_LOOKUP_PATH);
// require('./bootstrap-amd').load('vs/server/node/server');

const { createServer } = require("vite");

global.require = require;

async function main() {
	let server = await createServer({});

	try {
		const mod = await server.ssrLoadModule("/src/vs/server/node/server.ts");
		// mod.start();
		console.log(mod);

		// server.
	} catch (e) {
		console.error(e);
	}
	await server.listen();
}

main();
