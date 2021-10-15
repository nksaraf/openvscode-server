/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI, UriComponents } from 'vs/base/common/uri';
import * as types from 'vs/workbench/api/common/extHostTypes';
import { IExtHostWorkspaceProvider, IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import * as vscode from 'vscode';
import * as tasks from './tasks';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { USER_TASKS_GROUP_KEY } from 'vs/workbench/contrib/tasks/common/taskService';


export namespace TaskDefinitionDTO {
	export function from(value: vscode.TaskDefinition): tasks.TaskDefinitionDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
	export function to(value: tasks.TaskDefinitionDTO): vscode.TaskDefinition | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
}

export namespace TaskPresentationOptionsDTO {
	export function from(value: vscode.TaskPresentationOptions): tasks.TaskPresentationOptionsDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
	export function to(value: tasks.TaskPresentationOptionsDTO): vscode.TaskPresentationOptions | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
}

export namespace ProcessExecutionOptionsDTO {
	export function from(value: vscode.ProcessExecutionOptions): tasks.ProcessExecutionOptionsDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
	export function to(value: tasks.ProcessExecutionOptionsDTO): vscode.ProcessExecutionOptions | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
}

export namespace ProcessExecutionDTO {
	export function is(value: tasks.ShellExecutionDTO | tasks.ProcessExecutionDTO | tasks.CustomExecutionDTO | undefined): value is tasks.ProcessExecutionDTO {
		if (value) {
			const candidate = value as tasks.ProcessExecutionDTO;
			return candidate && !!candidate.process;
		} else {
			return false;
		}
	}
	export function from(value: vscode.ProcessExecution): tasks.ProcessExecutionDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		const result: tasks.ProcessExecutionDTO = {
			process: value.process,
			args: value.args
		};
		if (value.options) {
			result.options = ProcessExecutionOptionsDTO.from(value.options);
		}
		return result;
	}
	export function to(value: tasks.ProcessExecutionDTO): types.ProcessExecution | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return new types.ProcessExecution(value.process, value.args, value.options);
	}
}

export namespace ShellExecutionOptionsDTO {
	export function from(value: vscode.ShellExecutionOptions): tasks.ShellExecutionOptionsDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
	export function to(value: tasks.ShellExecutionOptionsDTO): vscode.ShellExecutionOptions | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return value;
	}
}

export namespace ShellExecutionDTO {
	export function is(value: tasks.ShellExecutionDTO | tasks.ProcessExecutionDTO | tasks.CustomExecutionDTO | undefined): value is tasks.ShellExecutionDTO {
		if (value) {
			const candidate = value as tasks.ShellExecutionDTO;
			return candidate && (!!candidate.commandLine || !!candidate.command);
		} else {
			return false;
		}
	}
	export function from(value: vscode.ShellExecution): tasks.ShellExecutionDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		const result: tasks.ShellExecutionDTO = {};
		if (value.commandLine !== undefined) {
			result.commandLine = value.commandLine;
		} else {
			result.command = value.command;
			result.args = value.args;
		}
		if (value.options) {
			result.options = ShellExecutionOptionsDTO.from(value.options);
		}
		return result;
	}
	export function to(value: tasks.ShellExecutionDTO): types.ShellExecution | undefined {
		if (value === undefined || value === null || (value.command === undefined && value.commandLine === undefined)) {
			return undefined;
		}
		if (value.commandLine) {
			return new types.ShellExecution(value.commandLine, value.options);
		} else {
			return new types.ShellExecution(value.command!, value.args ? value.args : [], value.options);
		}
	}
}

export namespace CustomExecutionDTO {
	export function is(value: tasks.ShellExecutionDTO | tasks.ProcessExecutionDTO | tasks.CustomExecutionDTO | undefined): value is tasks.CustomExecutionDTO {
		if (value) {
			let candidate = value as tasks.CustomExecutionDTO;
			return candidate && candidate.customExecution === 'customExecution';
		} else {
			return false;
		}
	}

	export function from(value: vscode.CustomExecution): tasks.CustomExecutionDTO {
		return {
			customExecution: 'customExecution'
		};
	}

	export function to(taskId: string, providedCustomExeutions: Map<string, types.CustomExecution>): types.CustomExecution | undefined {
		return providedCustomExeutions.get(taskId);
	}
}

export namespace TaskHandleDTO {
	export function from(value: types.Task, workspaceService?: IExtHostWorkspace): tasks.TaskHandleDTO {
		let folder: UriComponents | string;
		if (value.scope !== undefined && typeof value.scope !== 'number') {
			folder = value.scope.uri;
		} else if (value.scope !== undefined && typeof value.scope === 'number') {
			if ((value.scope === types.TaskScope.Workspace) && workspaceService && workspaceService.workspaceFile) {
				folder = workspaceService.workspaceFile;
			} else {
				folder = USER_TASKS_GROUP_KEY;
			}
		}
		return {
			id: value._id!,
			workspaceFolder: folder!
		};
	}
}

export namespace TaskGroupDTO {
	export function from(value: vscode.TaskGroup): tasks.TaskGroupDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		return { _id: value.id, isDefault: value.isDefault };
	}
}

export namespace TaskDTO {
	export function fromMany(tasks: vscode.Task[], extension: IExtensionDescription): tasks.TaskDTO[] {
		if (tasks === undefined || tasks === null) {
			return [];
		}
		const result: tasks.TaskDTO[] = [];
		for (let task of tasks) {
			const converted = from(task, extension);
			if (converted) {
				result.push(converted);
			}
		}
		return result;
	}

	export function from(value: vscode.Task, extension: IExtensionDescription): tasks.TaskDTO | undefined {
		if (value === undefined || value === null) {
			return undefined;
		}
		let execution: tasks.ShellExecutionDTO | tasks.ProcessExecutionDTO | tasks.CustomExecutionDTO | undefined;
		if (value.execution instanceof types.ProcessExecution) {
			execution = ProcessExecutionDTO.from(value.execution);
		} else if (value.execution instanceof types.ShellExecution) {
			execution = ShellExecutionDTO.from(value.execution);
		} else if (value.execution && value.execution instanceof types.CustomExecution) {
			execution = CustomExecutionDTO.from(<types.CustomExecution>value.execution);
		}

		const definition: tasks.TaskDefinitionDTO | undefined = TaskDefinitionDTO.from(value.definition);
		let scope: number | UriComponents;
		if (value.scope) {
			if (typeof value.scope === 'number') {
				scope = value.scope;
			} else {
				scope = value.scope.uri;
			}
		} else {
			// To continue to support the deprecated task constructor that doesn't take a scope, we must add a scope here:
			scope = types.TaskScope.Workspace;
		}
		if (!definition || !scope) {
			return undefined;
		}
		const result: tasks.TaskDTO = {
			_id: (value as types.Task)._id!,
			definition,
			name: value.name,
			source: {
				extensionId: extension.identifier.value,
				label: value.source,
				scope: scope
			},
			execution: execution!,
			isBackground: value.isBackground,
			group: TaskGroupDTO.from(value.group as vscode.TaskGroup),
			presentationOptions: TaskPresentationOptionsDTO.from(value.presentationOptions),
			problemMatchers: value.problemMatchers,
			hasDefinedMatchers: (value as types.Task).hasDefinedMatchers,
			runOptions: value.runOptions ? value.runOptions : { reevaluateOnRerun: true },
			detail: value.detail
		};
		return result;
	}
	export async function to(value: tasks.TaskDTO | undefined, workspace: IExtHostWorkspaceProvider, providedCustomExeutions: Map<string, types.CustomExecution>): Promise<types.Task | undefined> {
		if (value === undefined || value === null) {
			return undefined;
		}
		let execution: types.ShellExecution | types.ProcessExecution | types.CustomExecution | undefined;
		if (ProcessExecutionDTO.is(value.execution)) {
			execution = ProcessExecutionDTO.to(value.execution);
		} else if (ShellExecutionDTO.is(value.execution)) {
			execution = ShellExecutionDTO.to(value.execution);
		} else if (CustomExecutionDTO.is(value.execution)) {
			execution = CustomExecutionDTO.to(value._id, providedCustomExeutions);
		}
		const definition: vscode.TaskDefinition | undefined = TaskDefinitionDTO.to(value.definition);
		let scope: vscode.TaskScope.Global | vscode.TaskScope.Workspace | vscode.WorkspaceFolder | undefined;
		if (value.source) {
			if (value.source.scope !== undefined) {
				if (typeof value.source.scope === 'number') {
					scope = value.source.scope;
				} else {
					scope = await workspace.resolveWorkspaceFolder(URI.revive(value.source.scope));
				}
			} else {
				scope = types.TaskScope.Workspace;
			}
		}
		if (!definition || !scope) {
			return undefined;
		}
		const result = new types.Task(definition, scope, value.name!, value.source.label, execution, value.problemMatchers);
		if (value.isBackground !== undefined) {
			result.isBackground = value.isBackground;
		}
		if (value.group !== undefined) {
			result.group = types.TaskGroup.from(value.group._id);
			if (result.group && value.group.isDefault) {
				result.group = new types.TaskGroup(result.group.id, result.group.label);
				if (value.group.isDefault) {
					result.group.isDefault = value.group.isDefault;
				}
			}
		}
		if (value.presentationOptions) {
			result.presentationOptions = TaskPresentationOptionsDTO.to(value.presentationOptions)!;
		}
		if (value._id) {
			result._id = value._id;
		}
		if (value.detail) {
			result.detail = value.detail;
		}
		return result;
	}
}

export namespace TaskFilterDTO {
	export function from(value: vscode.TaskFilter | undefined): tasks.TaskFilterDTO | undefined {
		return value;
	}

	export function to(value: tasks.TaskFilterDTO): vscode.TaskFilter | undefined {
		if (!value) {
			return undefined;
		}
		return Object.assign(Object.create(null), value);
	}
}
