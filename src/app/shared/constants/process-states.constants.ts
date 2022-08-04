export type ProcessStatesType = 'ready' | 'execution' | 'suspended' | 'io' | 'readyIo' | 'finished';

export interface IProcessStates {
    ready: ProcessStatesType;
    execution: ProcessStatesType;
    suspended: ProcessStatesType;
    io: ProcessStatesType;
	readyIo: ProcessStatesType;
    finished: ProcessStatesType;
}

export const ProcessStates: IProcessStates = {
    ready: 'ready',
    execution: 'execution',
    suspended: 'suspended',
    io: 'io',
	readyIo: 'readyIo',
    finished: 'finished'
};

export const ProcessStatesNames = {
    ready: 'Pronto',
    execution: 'Execução',
    suspended: 'Suspenso',
    io: 'I/O',
	readyIo: 'Pronto I/O',
    finished: 'finished'
};

export const ProcessStatesColors = {
    ready: 'primary',
    execution: 'accent',
    suspended: 'warn',
    io: 'primary',
	readyIo: 'primary',
    finished: 'finished'
};
