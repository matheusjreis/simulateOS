import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CPU } from 'src/app/shared/models/cpu';
import { ProcessesState } from 'src/app/shared/stores/processes/processes.state';

@Component({
  selector: 'app-cpu-manager',
  templateUrl: './cpu-manager.component.html',
  styleUrls: ['./cpu-manager.component.scss'],
})
export class CpuManagerComponent implements OnInit {
  @Select(ProcessesState.getCPU) cpu$!: Observable<CPU>;

  waitTime: number = 1;
  timeSlice: number = 1;
  displayedColumns: string[] = ['priority', 'processes'];
  headerColumns: string[] = ['execution', 'currentProcess'];

  constructor(private store: Store) {}

  ngOnInit() {}
}
