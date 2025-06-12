import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store'; // Importe o Store
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { ProcessColors } from 'src/app/shared/constants/process-colors.constants';
import {
    ProcessTypes,
    ProcessTypesNames,
} from 'src/app/shared/constants/process-types.constants';
import { ScalingTypesEnum } from 'src/app/shared/constants/scaling-types.constants';
import { Process } from 'src/app/shared/models/process';
import { ProcessesState } from 'src/app/shared/stores/processes/processes.state';
import { BlocksAction } from 'src/app/shared/stores/blocks/blocks.action';

@Component({
    selector: 'app-edit-process-dialog',
    templateUrl: './edit-process-dialog.component.html',
    styleUrls: ['./edit-process-dialog.component.scss'],
})
export class EditProcessDialogComponent implements OnInit {
    processForm: FormGroup;
    typeOptions = [
        {
            label: ProcessTypesNames.cpuBound,
            value: ProcessTypes.cpuBound,
        },
        {
            label: ProcessTypesNames.ioBound,
            value: ProcessTypes.ioBound,
        },
        {
            label: ProcessTypesNames.cpuAndIoBound,
            value: ProcessTypes.cpuAndIoBound,
        },
    ];
    process?: Process;
    @Select(ProcessesState.getCurrentScalingType)
    currentScalingType$!: Observable<ScalingTypesEnum>;
    currentScalingType!: ScalingTypesEnum;

    constructor(
        public dialogRef: MatDialogRef<EditProcessDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly formBuilder: FormBuilder,
        private store: Store
    ) {
        this.processForm = this.formBuilder.group({
            priority: [
                data.process.priority,
                [Validators.min(0), Validators.max(15)],
            ],
            state: [data.process.state],
            type: [data.process.type],
            color: [data.process.color],
            isAvailable: [data.process.isAvailable],
        });

        this.data = data;
    }

    get isEditable(): boolean {
        return this.currentScalingType === ScalingTypesEnum.CircularWithPriorities;
    }

    get processTypeDescription(): string {
        return this.typeOptions.find(
            (item) => item.value === this.processForm.value.type
        )!.label;
    }

    // Adicionando um getter para os índices dos blocos alocados
    get allocatedBlocks(): number[] {
        return this.data.process.allocatedBlocks || [];
    }

    onClose() {
        this.dialogRef.close();
    }

    onSubmit() {
        this.dialogRef.close(this.processForm.value);
    }

    suspendProcess() {
        this.processForm.patchValue({ state: 'suspended' });
        this.data.process.state = 'suspended';
        console.log('Estado atual do formulário:', this.processForm.value);
        localStorage.setItem(`process-${this.data.process.id}`, JSON.stringify(this.processForm.value));
    }

    finishProcess() {
        ProcessColors.find(
            (item) => item.color === this.data.process!.color
        )!.isAvailable = true;
        this.processForm.patchValue({ state: 'finished' });
        this.store.dispatch(new BlocksAction.ReleaseBlockById(this.data.process!.id));
    }

    resumeProcess() {
        this.processForm.patchValue({ state: 'ready' });
        this.data.process.state = 'ready';
        console.log('Estado atual do formulário após retomar:', this.processForm.value);
        localStorage.setItem(`process-${this.data.process.id}`, JSON.stringify(this.processForm.value));
    }

    ngOnInit(): void {
        this.currentScalingType$.pipe(take(1)).subscribe({
            next: (value) => (this.currentScalingType = value),
        });
    }
}
