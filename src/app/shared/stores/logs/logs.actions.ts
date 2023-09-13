import { Process } from '../../models/process';

export namespace Logs {
	export class CreateLog {
		static readonly type = '[Logs] Create Log';
		constructor(public process: Process) {}
	}

	export class ClearLogs {
		static readonly type = '[Logs] Clear Logs';
		constructor() {}
	}
}
