import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Log } from '../../models/log';
import { LogsService } from '../../services/logs.service';
import { Logs } from './logs.actions';

export interface LogsStateModel {
	logs: Array<Log>;
}

@State<LogsStateModel>({
	name: 'logs',
	defaults: {
		logs: [],
	},
})
@Injectable()
export class LogsState {
	constructor(private readonly logsService: LogsService) {}

	@Action(Logs.CreateLog)
	createLog(context: StateContext<LogsStateModel>, action: Logs.CreateLog) {
		const state = context.getState();

		return this.logsService.createLog(action.log).pipe(
			tap((createdLog) => {
				context.patchState({
					logs: [...state.logs, createdLog],
				});
			})
		);
	}

	@Action(Logs.ClearLogs)
	clearLogs(context: StateContext<LogsStateModel>) {
		context.patchState({ logs: [] });
	}
}
