import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';
import { Color, ProcessColors } from '../../constants/process-colors.constants';
import { ProcessStates } from '../../constants/process-states.constants';
import { ProcessTypes } from '../../constants/process-types.constants';
import { ScalingTypesEnum } from '../../constants/scaling-types.constants';
import { Process } from '../../models/process';
import { ProcessesService } from '../../services/processes.service';
import { Logs } from '../logs/logs.actions';
import { Processes } from './processes.actions';

export interface ProcessesStateModel {
	data: Process[];
	colors: Color[];
	timer: number;
	ioWaitTime: number;
	timeSlice: number;
	cpuClock: number;
	scalingType: ScalingTypesEnum;
	displayedColumns: Array<string>;
}

@State<ProcessesStateModel>({
	name: 'processes',
	defaults: {
		data: [],
		colors: [],
		timer: 0,
		ioWaitTime: 1,
		timeSlice: 2,
		cpuClock: 1,
		scalingType: ScalingTypesEnum.Circular,
		displayedColumns: ['id', 'cpuTime', 'processTimeToFinish'],
	},
})
@Injectable()
export class ProcessesState {
	constructor(private processesService: ProcessesService) {}

	@Selector()
	static getAvailableProcesses(state: ProcessesStateModel) {
		return state.data.filter((item) => item.state !== ProcessStates.finished);
	}

	@Selector()
	static getCurrentScalingType(state: ProcessesStateModel): ScalingTypesEnum {
		return state.scalingType;
	}

	@Selector()
	static getExecutingProcess(state: ProcessesStateModel) {
		return state.data.find(
			({ currentType, state }) =>
				currentType === ProcessTypes.cpuBound &&
				state === ProcessStates.execution
		);
	}

	@Selector()
	static getIOProcess(state: ProcessesStateModel) {
		return state.data.find(
			({ currentType, state }) =>
				currentType === ProcessTypes.ioBound &&
				state === ProcessStates.execution
		);
	}

	@Selector()
	static getReadyCPUProcesses(state: ProcessesStateModel) {
		const { scalingType, data } = state;

		const readyCPUProcesses = data.filter(
			({ state, currentType }) =>
				state === ProcessStates.ready && currentType === ProcessTypes.cpuBound
		);

		if (scalingType === ScalingTypesEnum.CircularWithPriorities)
			readyCPUProcesses.sort((a, b) => b.priority - a.priority);

		return readyCPUProcesses;
	}

	@Selector()
	static getSuspendedProcesses(state: ProcessesStateModel) {
		return state.data.filter((item) => item.state === ProcessStates.suspended);
	}

	@Selector()
	static getFinishedProcesses(state: ProcessesStateModel) {
		return state.data.filter(({ state }) => state === ProcessStates.finished);
	}

	@Selector()
	static getSuspendedAndFinishedProcesses(state: ProcessesStateModel) {
		const suspendedProcesses = state.data.filter(
			({ state }) => state === ProcessStates.suspended
		);
		const finishedProcesses = state.data.filter(
			({ state }) => state === ProcessStates.finished
		);

		return [...suspendedProcesses, ...finishedProcesses];
	}

	@Selector()
	static getIOQueueProcesses(state: ProcessesStateModel) {
		return state.data.filter(
			({ state, currentType }) =>
				state === ProcessStates.ready && currentType === ProcessTypes.ioBound
		);
	}

	@Selector()
	static getTimer(state: ProcessesStateModel) {
		return state.timer;
	}

	@Selector()
	static getTimeSlice(state: ProcessesStateModel) {
		return state.timeSlice;
	}

	@Selector()
	static getCpuClock(state: ProcessesStateModel) {
		return state.cpuClock;
	}

	@Selector()
	static getIOWaitTime(state: ProcessesStateModel) {
		return state.ioWaitTime;
	}

	@Selector()
	static getCPU(state: ProcessesStateModel) {
		const execution = state.data.find(
			(item) => item.state === ProcessStates.execution
		);
		const waiting = Array.from(Array(16).keys())
			.map((_, index) => ({
				priority: index,
				processes: state.data.filter(
					(item) =>
						item.priority === index && item.state === ProcessStates.ready
				),
			}))
			.reverse();

		return {
			execution,
			waiting,
		};
	}

	@Selector()
	static getDisplayedColumns(state: ProcessesStateModel) {
		return state.displayedColumns;
	}

	private getDisplayedColumnsByScalingType(
		scalingType: ScalingTypesEnum
	): Array<string> {
		let columns: Array<string> = [];

		switch (scalingType) {
			case ScalingTypesEnum.Circular:
				columns = ['id', 'cpuTime', 'processTimeToFinish'];
				break;
			case ScalingTypesEnum.CircularWithPriorities:
				columns = ['id', 'priority', 'cpuTime', 'processTimeToFinish'];
				break;
			default:
				break;
		}

		return columns;
	}

	@Action(Processes.PickScalingType)
	pickScalingType(
		context: StateContext<ProcessesStateModel>,
		action: Processes.PickScalingType
	) {
		context.patchState({
			scalingType: action.scalingType,
			displayedColumns: this.getDisplayedColumnsByScalingType(
				action.scalingType
			),
		});

		context.dispatch(new Processes.StopProcesses());

		this.runCPU(context);
		this.runIO(context);
	}

	@Action(Processes.CreateProcess)
	createProcess(
		context: StateContext<ProcessesStateModel>,
		action: Processes.CreateProcess
	) {
		const state = context.getState();

		const indexOfFirstProcessWithLessPriority = state.data.findIndex(
			(item) => item.priority < action.process.priority
		);

		if (indexOfFirstProcessWithLessPriority === -1) {
			return this.processesService
				.createProcess(action.process, state.timer)
				.pipe(
					tap((res) => {
						context.patchState({
							data: [...state.data, ...res],
							colors: ProcessColors,
						});
					})
				);
		} else {
			return this.processesService
				.createProcess(action.process, state.timer)
				.pipe(
					tap((res) => {
						state.data.splice(
							indexOfFirstProcessWithLessPriority === 0
								? 0
								: indexOfFirstProcessWithLessPriority,
							0,
							...res
						);

						context.patchState({
							data: [...state.data],
							colors: ProcessColors,
						});
					})
				);
		}
	}

	@Action(Processes.EditProcess)
	editProcess(
		context: StateContext<ProcessesStateModel>,
		action: Processes.EditProcess
	) {
		const state = context.getState();
		const index = state.data.findIndex((item) => item.id === action.process.id);

		ProcessColors.forEach((item) => {
			if (item.color === action.process.color) item.isAvailable = true;
			else if (item.color === action.processDTO.color) item.isAvailable = false;
		});

		state.data[index] = {
			...action.process,
			priority: action.processDTO.priority,
			type: action.processDTO.type,
			color: action.processDTO.color,
			state: action.processDTO.state!,
		};

		if (action.process.priority !== action.processDTO.priority) {
			const decreasedPriority =
				action.process.priority > action.processDTO.priority;

			const dataWithoutExecutingProcess = state.data.filter(
				(item) => item.id !== action.process.id
			);
			const indexOfFirstProcessWithLessPriority = state.data.findIndex(
				(item) => item.priority < state.data[index].priority
			);

			if (indexOfFirstProcessWithLessPriority === -1) {
				state.data = [...dataWithoutExecutingProcess, state.data[index]];
			} else {
				dataWithoutExecutingProcess.splice(
					indexOfFirstProcessWithLessPriority === 0
						? 0
						: decreasedPriority
						? indexOfFirstProcessWithLessPriority - 1
						: indexOfFirstProcessWithLessPriority,
					0,
					state.data[index]
				);

				state.data = dataWithoutExecutingProcess;
			}
		}

		context.patchState({
			data: [...state.data],
			colors: ProcessColors,
		});
	}

	@Action(Processes.UpdateProcessState)
	updateProcessState(
		context: StateContext<ProcessesStateModel>,
		action: Processes.UpdateProcessState
	) {
		const { data, timer } = context.getState();
		const index = data.findIndex((item) => item.id === action.process.id);

		const updatedProcess: Process = { ...action.process, state: action.state };

		data[index] = updatedProcess;

		context.dispatch(
			new Logs.CreateLog({
				process: updatedProcess,
				timer,
			})
		);

		context.patchState({
			data: [...data],
		});
	}

	@Action(Processes.UpdateProcessPriority)
	updateProcessPriority(
		context: StateContext<ProcessesStateModel>,
		action: Processes.UpdateProcessPriority
	) {
		const state = context.getState();
		const data = state.data;
		const index = data.findIndex((item) => item.id === action.process.id);

		data[index] = { ...action.process, priority: action.priority };

		context.patchState({ data: [...data] });
	}

	@Action(Processes.SetIOWaitTime)
	setIOWaitTIme(
		context: StateContext<ProcessesStateModel>,
		action: Processes.SetIOWaitTime
	) {
		context.patchState({ ioWaitTime: action.time });
	}

	@Action(Processes.SetTimeSlice)
	setTimeSlice(
		context: StateContext<ProcessesStateModel>,
		action: Processes.SetTimeSlice
	) {
		context.patchState({ timeSlice: action.time });
	}

	@Action(Processes.SetCpuClock)
	setCpuClock(
		context: StateContext<ProcessesStateModel>,
		action: Processes.SetCpuClock
	) {
		context.patchState({ cpuClock: action.clock });
	}

	@Action(Processes.IncrementTimer)
	incrementTimer(context: StateContext<ProcessesStateModel>) {
		const state = context.getState();

		context.patchState({
			timer: state.timer + state.cpuClock,
		});

		this.runCPU(context);
		this.runIO(context);
	}

	private runCircularProcess(
		currentExecutingProcess: Process,
		context: StateContext<ProcessesStateModel>
	): void {
		const {
			data: processes,
			cpuClock,
			ioWaitTime,
			timeSlice,
		} = context.getState();

		const executingTime =
			currentExecutingProcess.currentType === ProcessTypes.cpuBound
				? Math.min(
						currentExecutingProcess.processTimeToFinish -
							currentExecutingProcess.cpuTime,
						cpuClock
				  )
				: 1;

		const coolDown =
			currentExecutingProcess.currentType === ProcessTypes.cpuBound
				? timeSlice / cpuClock
				: ioWaitTime / cpuClock;

		currentExecutingProcess.executingTime += executingTime;
		currentExecutingProcess.cpuTime += executingTime;

		const dataWithoutExecutingProcess = processes.filter(
			({ id }) => id !== currentExecutingProcess.id
		);

		if (currentExecutingProcess.executingTime >= coolDown) {
			currentExecutingProcess.executingTime = 0;

			if (
				currentExecutingProcess.cpuTime >=
				currentExecutingProcess.processTimeToFinish
			) {
				context.patchState({
					data: [...dataWithoutExecutingProcess, currentExecutingProcess],
				});

				context.dispatch(
					new Processes.UpdateProcessState(
						currentExecutingProcess,
						ProcessStates.finished
					)
				);

				return;
			}

			context.patchState({
				data: [...dataWithoutExecutingProcess, currentExecutingProcess],
			});

			context.dispatch(
				new Processes.UpdateProcessState(
					currentExecutingProcess,
					ProcessStates.ready
				)
			);

			return;
		}

		if (
			currentExecutingProcess.cpuTime >=
			currentExecutingProcess.processTimeToFinish
		) {
			context.patchState({
				data: [...dataWithoutExecutingProcess, currentExecutingProcess],
			});

			context.dispatch(
				new Processes.UpdateProcessState(
					currentExecutingProcess,
					ProcessStates.finished
				)
			);

			return;
		}
	}

	private runFirstProcess(
		context: StateContext<ProcessesStateModel>,
		executionModel: 'cpu' | 'io'
	): void {
		const state = context.getState();

		const type =
			executionModel === 'cpu' ? ProcessTypes.cpuBound : ProcessTypes.ioBound;

		const firstProcess = state.data.find(
			({ state, currentType }) =>
				state === ProcessStates.ready && type === currentType
		);

		if (!firstProcess) return;

		context.dispatch(
			new Processes.UpdateProcessState(firstProcess, ProcessStates.execution)
		);
	}

	private runCPUByCircularType(
		context: StateContext<ProcessesStateModel>,
		executionModel: 'cpu' | 'io'
	): void {
		const state = context.getState();

		const type =
			executionModel === 'cpu' ? ProcessTypes.cpuBound : ProcessTypes.ioBound;

		const currentExecutingProcess = state.data.find(
			({ state, currentType }) =>
				state === ProcessStates.execution && type === currentType
		);

		if (currentExecutingProcess) {
			this.runCircularProcess(currentExecutingProcess, context);
		} else {
			this.runFirstProcess(context, executionModel);
		}
	}

	private runHighestPriorityProcess(
		context: StateContext<ProcessesStateModel>,
		executionModel: 'cpu' | 'io'
	): void {
		const state = context.getState();

		const type =
			executionModel === 'cpu' ? ProcessTypes.cpuBound : ProcessTypes.ioBound;

		if (type === ProcessTypes.ioBound) {
			// IO bound processes are not affected by priorities

			this.runFirstProcess(context, executionModel);

			return;
		}

		const readyProcesses = state.data.filter(
			({ state, currentType }) =>
				state === ProcessStates.ready && currentType === type
		);

		const highestPriority = readyProcesses.reduce((prv, cur) =>
			prv.priority > cur.priority ? prv : cur
		).priority;

		const highestPriorityProcess = state.data.find(
			(item) =>
				item.priority === highestPriority &&
				item.state === ProcessStates.ready &&
				item.currentType === type
		);

		if (!highestPriorityProcess) return;

		context.dispatch(
			new Processes.UpdateProcessState(
				highestPriorityProcess,
				ProcessStates.execution
			)
		);
	}

	private runCPUByCircularWithPrioritiesType(
		context: StateContext<ProcessesStateModel>,
		executionModel: 'cpu' | 'io'
	): void {
		const state = context.getState();

		const type =
			executionModel === 'cpu' ? ProcessTypes.cpuBound : ProcessTypes.ioBound;

		const currentExecutingProcess = state.data.find(
			({ state, currentType }) =>
				state === ProcessStates.execution && type === currentType
		);

		if (currentExecutingProcess) {
			this.runCircularProcess(currentExecutingProcess, context);
		} else {
			this.runHighestPriorityProcess(context, executionModel);
		}
	}

	private runCPUByScalingType(
		context: StateContext<ProcessesStateModel>,
		executionModel: 'cpu' | 'io'
	): void {
		const { scalingType } = context.getState();

		switch (scalingType) {
			case ScalingTypesEnum.Circular:
				this.runCPUByCircularType(context, executionModel);
				break;
			case ScalingTypesEnum.CircularWithPriorities:
				this.runCPUByCircularWithPrioritiesType(context, executionModel);
				break;
			default:
				break;
		}
	}

	private runCPU(context: StateContext<ProcessesStateModel>) {
		const state = context.getState();

		if (!state.data.length) return;

		const runnableProcesses = state.data.filter(
			({ currentType, state }) =>
				currentType === ProcessTypes.cpuBound &&
				[ProcessStates.ready, ProcessStates.execution].includes(state)
		);

		if (!runnableProcesses.length) return;

		this.runCPUByScalingType(context, 'cpu');
	}

	private runIO(context: StateContext<ProcessesStateModel>) {
		const state = context.getState();

		if (!state.data.length) return;

		const runnableProcesses = state.data.filter(
			({ currentType, state }) =>
				currentType === ProcessTypes.ioBound &&
				[ProcessStates.ready, ProcessStates.execution].includes(state)
		);

		if (!runnableProcesses.length) return;

		this.runCPUByScalingType(context, 'io');
	}

	@Action(Processes.StopProcesses)
	stopProcesses(context: StateContext<ProcessesStateModel>) {
		ProcessColors.forEach((processColor) => {
			processColor.isAvailable = true;
		});

		context.patchState({
			data: [],
			colors: ProcessColors,
			timer: 0,
		});

		context.dispatch([new Logs.ClearLogs()]);
	}
}
