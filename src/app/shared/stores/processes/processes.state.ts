import { State, Action, StateContext, Selector } from "@ngxs/store";
import { Processes } from "./processes.actions";
import { Injectable } from "@angular/core";
import { Process } from "../../models/process";
import { ProcessesService } from "../../services/processes.service";
import { tap } from "rxjs";
import { ProcessStates } from "../../constants/process-states.constants";
import { ProcessTypes } from "../../constants/process-types.constants";
import { Color, ProcessColors } from "../../constants/process-colors.constants";

export interface ProcessesStateModel {
    data: Process[];
    colors: Color[];
    timer: number;
    ioWaitTime: number;
    timeSlice: number;
    cpuClock: number;
}

@State<ProcessesStateModel>({
    name: "processes",
    defaults: {
        data: [],
        colors: [],
        timer: 0,
        ioWaitTime: 1,
        timeSlice: 2,
        cpuClock: 1,
    },
})
@Injectable()
export class ProcessesState {
    ioTimerInterval: any;
    cpuTimerInterval: any;
    constructor(private processesService: ProcessesService) {}

    @Selector()
    static getAvailableProcesses(state: ProcessesStateModel) {
        return state.data.filter(
            (item) => item.state !== ProcessStates.finished
        );
    }

    @Selector()
    static getExecutingProcess(state: ProcessesStateModel) {
        return state.data.filter(
            (item) => item.state === ProcessStates.execution
        )[0];
    }

    @Selector()
    static getIOProcess(state: ProcessesStateModel) {
        return state.data.filter((item) => item.state === ProcessStates.io)[0];
    }

    @Selector()
    static getReadyProcesses(state: ProcessesStateModel) {
        return state.data.filter((item) => item.state === ProcessStates.ready);
    }

    @Selector()
    static getSuspendedProcesses(state: ProcessesStateModel) {
        return state.data.filter(
            (item) => item.state === ProcessStates.suspended
        );
    }

    @Selector()
    static getIOQueueProcesses(state: ProcessesStateModel) {
        return state.data.filter(
            (item) => item.state === ProcessStates.readyIo
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
                        item.priority === index &&
                        item.state === ProcessStates.ready
                ),
            }))
            .reverse();

        // console.log(execution);

        return {
            execution,
            waiting,
        };
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
        const index = state.data.findIndex(
            (item) => item.id === action.process.id
        );

        ProcessColors.forEach((item) => {
            if (item.color === action.process.color) item.isAvailable = true;
            else if (item.color === action.processDTO.color)
                item.isAvailable = false;
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
                state.data = [
                    ...dataWithoutExecutingProcess,
                    state.data[index],
                ];
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
        const state = context.getState();
        const data = state.data;
        const index = data.findIndex((item) => item.id === action.process.id);

        data[index] = { ...action.process, state: action.state };

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

        context.patchState({
            data: [...data],
        });
    }

    @Action(Processes.SetIOWaitTime)
    setIOWaitTIme(
        context: StateContext<ProcessesStateModel>,
        action: Processes.SetIOWaitTime
    ) {
        const state = context.getState();

        context.patchState({
            ioWaitTime: action.time,
        });
    }

    @Action(Processes.SetTimeSlice)
    setTimeSlice(
        context: StateContext<ProcessesStateModel>,
        action: Processes.SetTimeSlice
    ) {
        const state = context.getState();

        context.patchState({
            timeSlice: action.time,
        });
    }

    @Action(Processes.SetCpuClock)
    setCpuClock(
        context: StateContext<ProcessesStateModel>,
        action: Processes.SetCpuClock
    ) {
        const state = context.getState();

        context.patchState({
            cpuClock: action.clock,
        });
    }

    @Action(Processes.IncrementTimer)
    incrementTimer(context: StateContext<ProcessesStateModel>) {
        const state = context.getState();

        context.patchState({
            timer: state.timer + state.cpuClock,
        });
    }

    @Action(Processes.StartIOTimer)
    incrementIOTimer(context: StateContext<ProcessesStateModel>) {
        const state = context.getState();

        if (state.colors?.length)
            ProcessColors.forEach((item, index) => {
                item.isAvailable = state.colors[index].isAvailable;
            });

        context.dispatch([new Processes.RunIO(), new Processes.RunCPU()]);
    }

    @Action(Processes.RunCPU)
    runCPU(context: StateContext<ProcessesStateModel>) {
        clearInterval(this.cpuTimerInterval);
        const state = context.getState();

        const cooldown = (state.timeSlice / state.cpuClock) * 1000;

        if (!state.data.length) {
            this.cpuTimerInterval = setInterval(
                () => {
                    this.runCPU(context);
                },
                cooldown > 1000 ? 1000 : cooldown
            );

            return;
        }

        const readyProcesses = state.data.filter(
            (item) => item.state === ProcessStates.ready
        );

        const currentExecutingProcess = state.data.find(
            (item) => item.state === ProcessStates.execution
        );

        if (!readyProcesses.length && !currentExecutingProcess) {
            this.cpuTimerInterval = setInterval(
                () => {
                    this.runCPU(context);
                },
                cooldown > 1000 ? 1000 : cooldown
            );

            return;
        }

        if (currentExecutingProcess) {
            const dataWithoutExecutingProcess = state.data.filter(
                (item) => item.id !== currentExecutingProcess.id
            );

            if (currentExecutingProcess.type === ProcessTypes.cpuBound) {
                currentExecutingProcess.cpuTime += state.timeSlice;

                const indexOfFirstProcessWithLessPriority =
                    state.data.findIndex(
                        (item) =>
                            item.priority < currentExecutingProcess.priority
                    );

                if (indexOfFirstProcessWithLessPriority === -1) {
                    const data: Process[] = [
                        ...dataWithoutExecutingProcess,
                        currentExecutingProcess,
                    ];

                    context.patchState({
                        data: [...data],
                    });
                } else {
                    dataWithoutExecutingProcess.splice(
                        indexOfFirstProcessWithLessPriority === 0
                            ? 0
                            : indexOfFirstProcessWithLessPriority - 1,
                        0,
                        currentExecutingProcess
                    );

                    context.patchState({
                        data: [...dataWithoutExecutingProcess],
                    });
                }

                context.dispatch(
                    new Processes.UpdateProcessState(
                        currentExecutingProcess,
                        ProcessStates.ready
                    )
                );
            } else {
                currentExecutingProcess.cpuTime += 1;

                const data: Process[] = [
                    currentExecutingProcess,
                    ...dataWithoutExecutingProcess,
                ];

                context.patchState({
                    data: [...data],
                });

                context.dispatch(
                    new Processes.UpdateProcessState(
                        currentExecutingProcess,
                        ProcessStates.readyIo
                    )
                );
            }

            this.cpuTimerInterval = setInterval(
                () => {
                    this.runCPU(context);
                },
                cooldown > 1000 ? 1000 : cooldown
            );
        } else {
            const highestPriority = state.data
                .filter((item) => item.state === ProcessStates.ready)
                .reduce((prv, cur) =>
                    prv.priority > cur.priority ? prv : cur
                ).priority;

            const processesWithHighestPriority = state.data.filter(
                (item) =>
                    item.priority === highestPriority &&
                    item.state === ProcessStates.ready
            );

            if (processesWithHighestPriority.length)
                context.dispatch(
                    new Processes.UpdateProcessState(
                        processesWithHighestPriority[0],
                        ProcessStates.execution
                    )
                );

            const isIo =
                processesWithHighestPriority[0].type !== ProcessTypes.cpuBound;

            this.cpuTimerInterval = setInterval(() => {
                this.runCPU(context);
            }, (isIo ? 1 : state.timeSlice / state.cpuClock) * 1000);
        }
    }

    @Action(Processes.RunIO)
    runIO(context: StateContext<ProcessesStateModel>) {
        clearInterval(this.ioTimerInterval);
        const state = context.getState();

        if (!state.data.length) {
            this.ioTimerInterval = setInterval(() => {
                this.runIO(context);
            }, 1000);

            return;
        }

        const readyIOProcesses = state.data.filter(
            (item) => item.state === ProcessStates.readyIo
        );

        const currentIOProcess = state.data.find(
            (item) => item.state === ProcessStates.io
        );

        if (!readyIOProcesses.length && !currentIOProcess) {
            this.ioTimerInterval = setInterval(() => {
                this.runIO(context);
            }, 1000);

            return;
        }

        if (currentIOProcess) {
            const dataWithoutIOProcess = state.data.filter(
                (item) => item.id !== currentIOProcess.id
            );

            // const lastProcessWithCurrentPriorityIndex = state.data.findIndex(
            //     (item) => item.priority > currentIOProcess.priority
            // );

            const indexOfFirstProcessWithLessPriority = state.data.findIndex(
                (item) => item.priority < currentIOProcess.priority
            );

            if (indexOfFirstProcessWithLessPriority === -1) {
                const data: Process[] = [
                    ...dataWithoutIOProcess,
                    currentIOProcess,
                ];

                context.patchState({
                    data: [...data],
                });
            } else {
                dataWithoutIOProcess.splice(
                    indexOfFirstProcessWithLessPriority === 0
                        ? 0
                        : indexOfFirstProcessWithLessPriority - 1,
                    0,
                    currentIOProcess
                );

                context.patchState({
                    data: [...dataWithoutIOProcess],
                });
            }

            context.dispatch(
                new Processes.UpdateProcessState(
                    currentIOProcess,
                    ProcessStates.ready
                )
            );

            this.ioTimerInterval = setInterval(() => {
                this.runIO(context);
            }, 100);
        } else {
            if (readyIOProcesses.length)
                context.dispatch(
                    new Processes.UpdateProcessState(
                        readyIOProcesses[0],
                        ProcessStates.io
                    )
                );

            this.ioTimerInterval = setInterval(() => {
                this.runIO(context);
            }, state.ioWaitTime * 1000);
        }
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
    }

    ioProcessLeftExecution(
        process: Process,
        context: StateContext<ProcessesStateModel>,
        state: ProcessesStateModel
    ) {}
}
