import { Process } from './process';

export interface Log {
	id: string;
	process: Process;
}

export interface CreateLogDTO {
	process: Process;
}
