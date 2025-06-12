import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlocksScalingTypesEnum } from 'src/app/shared/constants/blocks-types.contants';
import { Box } from 'src/app/shared/models/box';
import { BlocksState } from 'src/app/shared/stores/blocks/blocks.state';
import { PickBlockScalingTypeDialogComponent } from './components/pick-block-scaling-type-dialog/pick-block-scaling-type-dialog.component';
import { BlocksAction } from 'src/app/shared/stores/blocks/blocks.action';
import { CreateProcessDialogComponent } from 'src/app/shared/components/create-process-dialog/create-process-dialog.component';
import { Processes } from 'src/app/shared/stores/processes/processes.actions';
import { CreateProcessDTO, Process } from 'src/app/shared/models/process';
import { ProcessesState } from 'src/app/shared/stores/processes/processes.state';
import { EditProcessDialogComponent } from '../../shared/components/edit-process-dialog/edit-process-dialog.component';
import { Sequence } from 'src/app/shared/models/sequence';

@Component({
  selector: 'app-memory-manager',
  templateUrl: './memory-manager.component.html',
  styleUrls: ['./memory-manager.component.scss']
})
export class MemoryManagerComponent implements OnInit, OnDestroy {
  @Select(BlocksState.getSequences) sequences$!: Observable<Sequence[]>;
  @Select(BlocksState.getBlocks) blocks$!: Observable<Box[]>;
  @Select(ProcessesState.getTimer) timer$!: Observable<number>;
  @Select(BlocksState.getBlockScaling) blockScaling$!: Observable<BlocksScalingTypesEnum>;
  @Select(ProcessesState.getAvailableProcesses) availableProcesses$!: Observable<Process[]>;
	@Select(ProcessesState.getSuspendedProcesses) suspendedProcesses$!: Observable<Process[]>;
  availableProcesses: Process[] = [];


	private _notifier$ = new Subject<void>();


  constructor(private readonly dialog: MatDialog, private readonly store: Store) {}

  ngOnInit(): void {
    this.availableProcesses$.pipe(takeUntil(this._notifier$)).subscribe((processes) => (this.availableProcesses = [...processes]));
  }

  openBlockScalingTypeDialog(): void {
    const ref = this.dialog.open(PickBlockScalingTypeDialogComponent);

    ref.afterClosed().pipe(takeUntil(this._notifier$)).subscribe((result?: BlocksScalingTypesEnum) => {
      if (!result) return;

      this.store.dispatch(new BlocksAction.PickBlockScalingType(result));
    });
  }

  createProcess() {
    const availableProcesses = this.availableProcesses.length;

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




  stopProcesses() {
    this.store.dispatch(new Processes.StopProcesses());
  }

  ngOnDestroy(): void {
    this._notifier$.next();
    this._notifier$.complete();
  }
}
