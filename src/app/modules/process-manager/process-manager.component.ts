import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import {
	ProcessStates,
	ProcessStatesColors,
	ProcessStatesNames,
	ProcessStatesType,
} from 'src/app/shared/constants/process-states.constants';
import {
	ProcessTypesNames,
	ProcessTypesType,
} from 'src/app/shared/constants/process-types.constants';
import { ScalingTypesEnum } from 'src/app/shared/constants/scaling-types.constants';
import { CreateProcessDTO, Process } from 'src/app/shared/models/process';
import { Processes } from 'src/app/shared/stores/processes/processes.actions';
import { ProcessesState } from 'src/app/shared/stores/processes/processes.state';
import { CreateProcessDialogComponent } from './components/create-process-dialog/create-process-dialog.component';
import { EditProcessDialogComponent } from './components/edit-process-dialog/edit-process-dialog.component';
import { ProcessLifetimeDialogComponent } from './components/process-lifetime-dialog/process-lifetime-dialog.component';
import { UpdatePriorityDialogComponent } from './components/update-priority-dialog/update-priority-dialog.component';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-process-manager',
	templateUrl: './process-manager.component.html',
	styleUrls: ['./process-manager.component.scss'],
})
export class ProcessManagerComponent implements OnInit, OnDestroy {
	@Select(ProcessesState.getAvailableProcesses)
	availableProcesses$!: Observable<Process[]>;
	@Select(ProcessesState.getExecutingProcess)
	executingProcess$!: Observable<Process>;
	@Select(ProcessesState.getIOProcess)
	ioProcess$!: Observable<Process>;
	@Select(ProcessesState.getReadyProcesses) readyProcesses$!: Observable<
		Process[]
	>;
	@Select(ProcessesState.getSuspendedAndFinishedProcesses)
	suspendedFinishedProcesses$!: Observable<Process[]>;
	@Select(ProcessesState.getIOQueueProcesses) iOProcesses$!: Observable<
		Process[]
	>;
	@Select(ProcessesState.getDisplayedColumns)
	displayedColumns$!: Observable<Array<string>>;
	@Select(ProcessesState.getFinishedProcesses)
	finishedProcesses$!: Observable<Array<string>>;
	@Select(ProcessesState.getFinishedCPUBoundProcesses)
	getFinishedCPUBoundProcesses$!: Observable<Array<Process>>;

	@ViewChild(MatMenuTrigger) actionsMenu!: MatMenuTrigger;

	readonly processState = ProcessesState;
	readonly scalingTypeEnum = ScalingTypesEnum;

	private subscriptions: Subscription = new Subscription();
	availableProcesses: Process[] = [];
	executingProcess?: Process;
	ioProcess?: Process;
	maxProcesses = 15;
	ioColumns: Array<string> = [];

	constructor(private dialog: MatDialog, private store: Store, private userService: UserService, private router: Router, private snackBar: MatSnackBar) {}

	ngOnInit() {
		this.subscriptions.add(
			this.availableProcesses$.subscribe((processes: Process[]) => {
				this.availableProcesses = processes;
			})
		);

		this.userService.getLoggedUser().subscribe(
			response => {
			  if(response.success){
				this.userService.setUserDataOnLocalStorage(response.data!);
	  
				if(!response.data){
					this.router.navigate(['login']);
					this.snackBar.open('Sessão expirada, faça o login novamente!', 'OK');
				}
			  }
			},
			error => {
			  this.snackBar.open('Sessão expirada, faça o login novamente!', 'OK');
			  this.router.navigate(['login']);
			}
		  )

		this.subscriptions.add(
			this.executingProcess$.subscribe(
				(process) =>
					(this.executingProcess = process ? { ...process } : undefined)
			)
		);

		this.subscriptions.add(
			this.ioProcess$.subscribe(
				(process) => (this.ioProcess = process ? { ...process } : undefined)
			)
		);

		this.subscriptions.add(
			this.displayedColumns$.subscribe((columns) => {
				const ioColumns = columns.filter((column) => column !== 'priority');

				this.ioColumns = [...ioColumns];
			})
		);
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe();
	}

	getTypeName(type: ProcessTypesType): string {
		return ProcessTypesNames[type];
	}

	getStateName(state: ProcessStatesType): string {
		return ProcessStatesNames[state];
	}

	getStateColor(state: ProcessStatesType): string {
		return ProcessStatesColors[state];
	}

	createProcess() {
		const availableProcesses = this.availableProcesses?.length;

		const dialogRef = this.dialog.open(CreateProcessDialogComponent, {
			width: '600px',
			disableClose: true,
			data: {
				availableProcesses,
			},
		});

		dialogRef.afterClosed().subscribe((res?: CreateProcessDTO) => {
			if (res) {
				this.store.dispatch(new Processes.CreateProcess(res));
			}
		});
	}

	editProcess(process: Process) {
		if (process.state === ProcessStates.finished) return;

		const dialogRef = this.dialog.open(EditProcessDialogComponent, {
			width: '600px',
			disableClose: true,
			data: { process },
		});

		dialogRef.afterClosed().subscribe((res?: CreateProcessDTO) => {
			if (res) {
				this.store.dispatch(new Processes.EditProcess(process, res));
			}
		});
	}

	updateProcessState(process: Process, state: ProcessStatesType) {
		this.store.dispatch(new Processes.UpdateProcessState(process, state));
	}

	updateProcessPriority(process: Process) {
		const dialogRef = this.dialog.open(UpdatePriorityDialogComponent, {
			width: '300px',
			disableClose: true,
			data: process.priority,
		});

		dialogRef.afterClosed().subscribe((res?: number) => {
			if (res) {
				this.store.dispatch(new Processes.UpdateProcessPriority(process, res));
			}
		});
	}

	openActionsMenu(process: Process) {
		this.actionsMenu.menuData = { process };
		this.actionsMenu.openMenu();
	}

	canCreateProcess() {
		if (this.maxProcesses - this.availableProcesses.length > 0) return true;

		return false;
	}

	isProcessSuspended(process: Process) {
		return process.state === ProcessStates.suspended;
	}

	handleOpenProcessLifetimeDialog(): void {
		this.dialog.open(ProcessLifetimeDialogComponent, {
			width: '80%',
		});
	}
}
