import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { Select, Store } from "@ngxs/store";
import { Observable, Subscription } from "rxjs";
import {
    ProcessStates,
    ProcessStatesColors,
    ProcessStatesNames,
    ProcessStatesType,
} from "src/app/shared/constants/process-states.constants";
import {
    ProcessTypes,
    ProcessTypesNames,
    ProcessTypesType,
} from "src/app/shared/constants/process-types.constants";
import { CreateProcessDTO, Process } from "src/app/shared/models/process";
import { Processes } from "src/app/shared/stores/processes/processes.actions";
import { ProcessesState } from "src/app/shared/stores/processes/processes.state";
import { CreateProcessDialogComponent } from "./components/create-process-dialog/create-process-dialog.component";
import { EditProcessDialogComponent } from "./components/edit-process-dialog/edit-process-dialog.component";
import { UpdatePriorityDialogComponent } from "./components/update-priority-dialog/update-priority-dialog.component";

@Component({
    selector: "app-process-manager",
    templateUrl: "./process-manager.component.html",
    styleUrls: ["./process-manager.component.scss"],
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
    @Select(ProcessesState.getSuspendedProcesses)
    suspendedProcesses$!: Observable<Process[]>;
    @Select(ProcessesState.getIOQueueProcesses) iOProcesses$!: Observable<Process[]>;

    @ViewChild(MatMenuTrigger) actionsMenu!: MatMenuTrigger;

    displayedColumns: string[] = ["id", "priority", "cpuTime"];
    displayedColumnsIO: string[] = ["id"];

    readonly processStates = ProcessStates;

    private subscriptions: Subscription = new Subscription();
    availableProcesses: Process[] = [];
    executingProcess?: Process;
    ioProcess?: Process;
    maxProcesses = 15;

    constructor(private dialog: MatDialog, private store: Store) {}

    ngOnInit() {
        this.subscriptions.add(
            this.availableProcesses$.subscribe((processes: Process[]) => {
                this.availableProcesses = processes;
            })
        );

        this.subscriptions.add(
            this.executingProcess$.subscribe((process: Process) => {
                this.executingProcess = process;
            })
        );

        this.subscriptions.add(
            this.ioProcess$.subscribe((process: Process) => {
                this.ioProcess = process;
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
            width: "600px",
            disableClose: true,
            data: {
                availableProcesses
            }
        });

        dialogRef.afterClosed().subscribe((res?: CreateProcessDTO) => {
            if (res) {
                this.store.dispatch(new Processes.CreateProcess(res));
            }
        });
    }

    editProcess(process: Process) {
        const dialogRef = this.dialog.open(EditProcessDialogComponent, {
            width: "600px",
            disableClose: true,
            data: {
                process,
            },
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
            width: "300px",
            disableClose: true,
            data: process.priority,
        });

        dialogRef.afterClosed().subscribe((res?: number) => {
            if (res) {
                this.store.dispatch(
                    new Processes.UpdateProcessPriority(process, res)
                );
            }
        });
    }

    openActionsMenu(process: Process) {
        this.actionsMenu.menuData = { process: process };
        this.actionsMenu.openMenu();
    }

    canCreateProcess() {
        if (this.maxProcesses - this.availableProcesses.length > 0)
            return true;
            
        return false;
    }
}
