/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

(function () {
	const MonacoEnvironment = (<any>self).MonacoEnvironment;
	const monacoBaseUrl =
		MonacoEnvironment && MonacoEnvironment.baseUrl
			? MonacoEnvironment.baseUrl
			: '../../../';

	// const trustedTypesPolicy =
	// 	typeof self.trustedTypes?.createPolicy === "function"
	// 		? self.trustedTypes?.createPolicy("amdLoader", {
	// 				createScriptURL: (value) => value,
	// 				createScript: (_, ...args: string[]) => {
	// 					// workaround a chrome issue not allowing to create new functions
	// 					// see https://github.com/w3c/webappsec-trusted-types/wiki/Trusted-Types-for-function-constructor
	// 					const fnArgs = args.slice(0, -1).join(",");
	// 					const fnBody = args.pop()!.toString();
	// 					const body = `(function anonymous(${fnArgs}) {\n${fnBody}\n})`;
	// 					return body;
	// 				},
	// 		  })
	// 		: undefined;

	// function canUseEval(): boolean {
	// 	try {
	// 		const func = trustedTypesPolicy
	// 			? self.eval(<any>trustedTypesPolicy.createScript("", "true"))
	// 			: new Function("true");
	// 		func.call(self);
	// 		return true;
	// 	} catch (err) {
	// 		return false;
	// 	}
	// }

	const loadCode = function (moduleId: string) {
		import('./' + monacoBaseUrl + moduleId + '.ts')
			.then((ws) => {
				let messageHandler = ws.create(
					(msg: any, transfer?: Transferable[]) => {
						(<any>self).postMessage(msg, transfer);
					},
					null
				);
				self.onmessage = (e: MessageEvent) => messageHandler.onmessage(e.data);
				while (beforeReadyMessages.length > 0) {
					self.onmessage(beforeReadyMessages.shift()!);
				}
			})
			.catch(console.error);
	};

	// import(monacoBaseUrl + "/" + moduleId)
	// 	.then((m) => console.log(m))
	// 	.catch(console.error);
	// .then((text) => {
	// 	try {
	// 		const func = trustedTypesPolicy
	// 			? self.eval(
	// 					trustedTypesPolicy.createScript("", text) as unknown as string
	// 			  )
	// 			: new Function(text);
	// 		console.log(func);
	// 		func.call(self);
	// 	} catch (e) {
	// 		console.error(e);
	// 	}
	// });
	// require([moduleId], function (ws) {
	//
	// });

	let isFirstMessage = true;
	let beforeReadyMessages: MessageEvent[] = [];
	self.onmessage = (message: MessageEvent) => {
		if (!isFirstMessage) {
			beforeReadyMessages.push(message);
			return;
		}

		isFirstMessage = false;
		loadCode(message.data);
	};
})();
