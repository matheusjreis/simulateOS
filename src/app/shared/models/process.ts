import { ProcessStatesType } from '../constants/process-states.constants';
import { ProcessTypesType } from '../constants/process-types.constants';

export interface Process {
  id: string;
  priority: number;
  color: string;
  type: ProcessTypesType;
  state: ProcessStatesType;
  cpuTime: number;
  timeCreated: number;
  timeDeleted?: number;
}

export interface CreateProcessDTO {
  priority: number;
  color: string;
  type: ProcessTypesType;
  number?: number;
  state?: ProcessStatesType;
  timeCreated?: number;
}
