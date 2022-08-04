import { Component, ElementRef, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Store } from "@ngxs/store";
import {
    ProcessColors,
} from "src/app/shared/constants/process-colors.constants";
import {
    ProcessTypes,
    ProcessTypesNames,
} from "src/app/shared/constants/process-types.constants";
import { Process } from "src/app/shared/models/process";
import { Processes } from "src/app/shared/stores/processes/processes.actions";
import { ColorPickerDialogComponent } from "../color-picker-dialog/color-picker-dialog.component";

@Component({
    selector: "app-edit-process-dialog",
    templateUrl: "./edit-process-dialog.component.html",
    styleUrls: ["./edit-process-dialog.component.scss"],
})
export class EditProcessDialogComponent {
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

    constructor(
        public dialogRef: MatDialogRef<EditProcessDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private elementRef: ElementRef,
        private store: Store
    ) {
        this.processForm = this.formBuilder.group({
            priority: [
                data.process.priority,
                [Validators.min(0), Validators.max(15)],
            ],
            type: [data.process.type],
            color: [data.process.color],
            state: [data.process.state],
        });

        this.data = data;
    }

    pickColor() {
        const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
            width: "484px",
        });

        dialogRef.afterClosed().subscribe((res: string) => {
            this.processForm.patchValue({ color: res });
            this.elementRef.nativeElement
                .querySelector('[formcontrolname="color"]')
                .blur();
        });
    }

    onClose() {
        this.dialogRef.close();
    }

    onSubmit() {
        this.dialogRef.close(this.processForm.value);
    }

    suspendProcess() {
        this.processForm.patchValue({ state: "suspended" });
    }

    finishProcess() {
            ProcessColors.find(
                (item) => item.color === this.data.process!.color
            )!.isAvailable = true;

        this.processForm.patchValue({ state: "finished" });
    }

    resumeProcess() {
        this.processForm.patchValue({ state: "ready" });
    }
}
