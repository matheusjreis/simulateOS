import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexDataLabels,
	ApexPlotOptions,
	ChartComponent,
} from 'ng-apexcharts';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import {
	ProcessTypesNames,
	ProcessTypesType,
} from 'src/app/shared/constants/process-types.constants';
import { Log } from 'src/app/shared/models/log';
import { Process } from 'src/app/shared/models/process';
import { LogsState } from 'src/app/shared/stores/logs/logs.state';
import { ProcessesState } from 'src/app/shared/stores/processes/processes.state';

interface CustomProcess extends Process {
	checked: boolean;
}

interface ChartOptions {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	dataLabels: ApexDataLabels;
	plotOptions: ApexPlotOptions;
}

@Component({
	selector: 'app-process-lifetime-dialog',
	templateUrl: './process-lifetime-dialog.component.html',
	styleUrls: ['./process-lifetime-dialog.component.scss'],
})
export class ProcessLifetimeDialogComponent implements OnInit, OnDestroy {
	@ViewChild('chart') chart!: ChartComponent;
	subscription = new Subscription();
	@Select(ProcessesState.getFinishedProcesses)
	getFinishedProcesses$!: Observable<Array<Process>>;
	@Select(ProcessesState.getDisplayedColumns)
	displayedColumns$!: Observable<string>;
	@Select(LogsState.getLogs)
	logs$!: Observable<Array<Log>>;
	finishedProcesses: Array<CustomProcess> = [];
	logs: Array<Log> = [];
	chartOptions: ChartOptions | null = null;

	constructor(
		private readonly dialogRef: MatDialogRef<ProcessLifetimeDialogComponent>
	) {}

	private getFinishedProcesses(): void {
		this.subscription.add(
			this.getFinishedProcesses$.pipe(take(1)).subscribe((processes) => {
				this.finishedProcesses = processes.map((process) => ({
					...process,
					checked: false,
				}));
			})
		);

		this.subscription.add(
			this.logs$.pipe(take(1)).subscribe((logs) => (this.logs = [...logs]))
		);
	}

	generateChart(): void {
		const checkedProcesses = this.finishedProcesses.filter(
			({ checked }) => checked
		);

		if (checkedProcesses.length === 0) return;

		const checkedProcessesPIDs = checkedProcesses.map(({ id }) => id);

		const filteredLogs = this.logs.filter(({ process }) =>
			checkedProcessesPIDs.includes(process.id)
		);

		const logsByPID = checkedProcessesPIDs.reduce<Array<Array<Log>>>(
			(result, pid) => {
				const logsForPID = filteredLogs.filter(
					({ process }) => process.id === pid
				);
				result.push(logsForPID);
				return result;
			},
			[]
		);

		debugger;

		this.chartOptions = {
			series: [
				{
					name: 'Tempo de Vida',
					data: [
						{
							x: 'Design',
							y: [
								new Date('2019-03-05').getTime(),
								new Date('2019-03-08').getTime(),
							],
						},
						{
							x: 'Code',
							y: [
								new Date('2019-03-02').getTime(),
								new Date('2019-03-05').getTime(),
							],
						},
						{
							x: 'Code',
							y: [
								new Date('2019-03-08').getTime(),
								new Date('2019-03-11').getTime(),
							],
						},
						{
							x: 'Test',
							y: [
								new Date('2019-03-11').getTime(),
								new Date('2019-03-16').getTime(),
							],
						},
					],
				},
			],
			chart: {
				height: '200px',
				type: 'rangeBar',
			},
			plotOptions: {
				bar: { horizontal: true },
			},
			dataLabels: {
				enabled: true,
				formatter: (a: number, b: number) => b - a,
			},
		};
	}

	getTypeName(type: ProcessTypesType): string {
		return ProcessTypesNames[type];
	}

	onCheck(event: MatCheckboxChange, processIndex: number): void {
		const process = this.finishedProcesses[processIndex];

		process.checked = event.checked;
	}

	onClose() {
		this.dialogRef.close();
	}

	ngOnInit(): void {
		this.getFinishedProcesses();
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
