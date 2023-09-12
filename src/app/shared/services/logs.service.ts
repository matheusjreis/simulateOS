import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { CreateLogDTO, Log } from '../models/log';

@Injectable({
	providedIn: 'root',
})
export class LogsService {
	public createLog({ process }: CreateLogDTO) {
		const createdLog: Log = {
			id: uuidv4(),
			process,
		};

		return of(createdLog).pipe(delay(50));
	}
}
