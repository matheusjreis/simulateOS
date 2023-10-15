export type ProcessStatesType =
	| 'ready'
	| 'execution'
	| 'suspended'
	| 'finished';

export interface IProcessStates {
	ready: ProcessStatesType;
	execution: ProcessStatesType;
	suspended: ProcessStatesType;
	finished: ProcessStatesType;
}

export const ProcessStates: IProcessStates = {
	ready: 'ready',
	execution: 'execution',
	suspended: 'suspended',
	finished: 'finished',
};

export const ProcessStatesNames = {
	ready: 'Pronto',
	execution: 'Execução',
	suspended: 'Suspenso',
	finished: 'finished',
};

export const ProcessStatesColors = {
	ready: 'primary',
	execution: 'accent',
	suspended: 'warn',
	finished: 'finished',
};
