import { Log } from '../../models/log';

export namespace Logs {
	export class CreateLog {
		static readonly type = '[Logs] Create Log';
		constructor(public log: Log) {}
	}

	export class ClearLogs {
		static readonly type = '[Logs] Clear Logs';
		constructor() {}
	}
}
