/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function () {
	const searchParams = new URL(document.location.toString()).searchParams;
	const vscodeWebWorkerExtHostId =
		searchParams.get('vscodeWebWorkerExtHostId') || '';
	const name = searchParams.get('debugged')
		? 'WorkerExtensionHost'
		: 'DebugWorkerExtensionHost';

	function sendError(error: Error) {
		window.parent.postMessage(
			{
				vscodeWebWorkerExtHostId,
				error: {
					name: error ? error.name : '',
					message: error ? error.message : '',
					stack: error ? error.stack : [],
				},
			},
			'*'
		);
	}

	try {
		const worker = new Worker('../../../../base/worker/worker', {
			name,
			type: 'module',
		});
		worker.postMessage(
			'vs/workbench/services/extensions/worker/extensionHostWorker'
		);
		const nestedWorkers = new Map();

		worker.onmessage = (event) => {
			const { data } = event;

			console.log(data);

			if (data?.type === '_newWorker') {
				const { id, port, url, options } = data;
				const newWorker = new Worker(url, options);
				newWorker.postMessage(port, [port]);
				worker.onerror = console.error.bind(console);
				nestedWorkers.set(id, newWorker);
			} else if (data?.type === '_terminateWorker') {
				const { id } = data;
				if (nestedWorkers.has(id)) {
					nestedWorkers.get(id).terminate();
					nestedWorkers.delete(id);
				}
			} else {
				worker.onerror = console.error.bind(console);
				window.parent.postMessage(
					{
						vscodeWebWorkerExtHostId,
						data,
					},
					'*',
					[data]
				);
			}
		};

		worker.onerror = (event) => {
			console.error(event.message, event.error);
			sendError(event.error);
		};
	} catch (err) {
		console.error(err);
		sendError(err);
	}
})();
