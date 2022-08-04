import { ProcessStatesType } from "../../constants/process-states.constants";
import { CreateProcessDTO, Process } from "../../models/process";

export namespace Processes {
    export class CreateProcess {
        static readonly type = "[Processes] Create Process";
        constructor(public process: CreateProcessDTO) {}
    }

    export class EditProcess {
		static readonly type = "[Processes] Edit Process";
		constructor(public process: Process, public processDTO: CreateProcessDTO) {}
	}

    export class UpdateProcessState {
        static readonly type = "[Processes] Update Process State";
        constructor(public process: Process, public state: ProcessStatesType) {}
    }

    export class UpdateProcessPriority {
        static readonly type = "[Processes] Update Process Priority";
        constructor(public process: Process, public priority: number) {}
    }

    export class IncrementTimer {
        static readonly type = "[Processes] Increment Timer";
        constructor() {}
    }

    export class StartIOTimer {
        static readonly type = "[Processes] Start IO Timer";
        constructor() {}
    }

    export class SetIOWaitTime {
        static readonly type = "[Processes] Set IO Wait Time";
        constructor(public time: number) {}
    }

    export class SetTimeSlice {
        static readonly type = "[Processes] Set Time Slice";
        constructor(public time: number) {}
    }

    export class SetCpuClock {
        static readonly type = "[Processes] Set CPU Clock";
        constructor(public clock: number) {}
    }

    export class RunCPU {
        static readonly type = "[Processes] Run CPU";
        constructor() {}
    }

    export class RunIO {
        static readonly type = "[Processes] Run IO";
        constructor() {}
    }

    export class StopProcesses {
        static readonly type = "[Processes] Stop Processes";
        constructor() {}
    }
}
