import { Component, OnDestroy, OnInit } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable, Subscription } from "rxjs";
import { Process } from "src/app/shared/models/process";
import { Processes } from "src/app/shared/stores/processes/processes.actions";
import { ProcessesState } from "src/app/shared/stores/processes/processes.state";

@Component({
    selector: "app-processes-stats",
    templateUrl: "./processes-stats.component.html",
    styleUrls: ["./processes-stats.component.scss"],
})
export class ProcessesStatsComponent implements OnInit, OnDestroy {
    @Select(ProcessesState.getAvailableProcesses)
    availableProcesses$!: Observable<Process[]>;
    @Select(ProcessesState.getTimer) timer$!: Observable<number>;
    @Select(ProcessesState.getIOWaitTime) ioWaitTime$!: Observable<number>;
    @Select(ProcessesState.getTimeSlice) timeSlice$!: Observable<number>;
    @Select(ProcessesState.getCpuClock) cpuClock$!: Observable<number>;
    private subscriptions: Subscription = new Subscription();
    ioWaitTime?: number;
    timeSlice?: number;
    cpuClock?: number;

    constructor(private store: Store) {}

    ngOnInit() {
        this.startTimer();

        this.subscriptions.add(
            this.ioWaitTime$.subscribe((ioWaitTime: number) => {
                this.ioWaitTime = ioWaitTime;
            })
        );

        this.subscriptions.add(
            this.timeSlice$.subscribe((timeSlice: number) => {
                this.timeSlice = timeSlice;
            })
        );

        this.subscriptions.add(
            this.cpuClock$.subscribe((cpuClock: number) => {
                this.cpuClock = cpuClock;
            })
        );
        
        this.store.dispatch(new Processes.StartIOTimer());
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    startTimer() {
        setInterval(() => {
            this.store.dispatch(new Processes.IncrementTimer());
        }, 1000);
    }

    stopProcesses() {
        this.store.dispatch(new Processes.StopProcesses());
    }

    changeIOWaitTime(event: any) {
        this.store.dispatch(new Processes.SetIOWaitTime(event.value));
    }

    changeTimeSlice(event: any) {
        this.store.dispatch(new Processes.SetTimeSlice(event.value));
    }

    changeCpuClock(event: any) {
        this.store.dispatch(new Processes.SetCpuClock(event.value));
    }
}
