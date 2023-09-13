import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Log } from '../../models/log';
import { LogsService } from '../../services/logs.service';
import { Logs } from './logs.actions';

export interface LogsStateModel {
	data: Array<Log>;
}

@State<LogsStateModel>({
	name: 'logs',
	defaults: {
		data: [],
	},
})
@Injectable()
export class LogsState {
	constructor(private readonly logsService: LogsService) {}

	@Selector()
	static getLogs(state: LogsStateModel) {
		return state.data;
	}

	@Action(Logs.CreateLog)
	createLog(
		context: StateContext<LogsStateModel>,
		{ process }: Logs.CreateLog
	) {
		const state = context.getState();

		return this.logsService.createLog({ process }).pipe(
			tap((createdLog) => {
				context.patchState({
					data: [...state.data, createdLog],
				});
			})
		);
	}

	@Action(Logs.ClearLogs)
	clearLogs(context: StateContext<LogsStateModel>) {
		context.patchState({ data: [] });
	}
}
