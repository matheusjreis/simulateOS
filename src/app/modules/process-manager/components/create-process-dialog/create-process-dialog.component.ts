import { Component, ElementRef, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { ProcessColors, ProcessColorsHex } from "src/app/shared/constants/process-colors.constants";
import {
    ProcessTypes,
    ProcessTypesNames,
} from "src/app/shared/constants/process-types.constants";
import { ColorPickerDialogComponent } from "../color-picker-dialog/color-picker-dialog.component";

@Component({
    selector: "app-create-process-dialog",
    templateUrl: "./create-process-dialog.component.html",
    styleUrls: ["./create-process-dialog.component.scss"],
})
export class CreateProcessDialogComponent {
    processForm: FormGroup;
    maxProcesses = 15;
    maxAvailableProcesses = this.maxProcesses;
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

    constructor(
        public dialogRef: MatDialogRef<CreateProcessDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private elementRef: ElementRef
    ) {
        this.maxAvailableProcesses = this.maxProcesses - data.availableProcesses;

        this.processForm = this.formBuilder.group({
            priority: [0, [Validators.min(0), Validators.max(15)]],
            type: [ProcessTypes.cpuBound],
            color: [ProcessColors.find((color) => color.isAvailable)?.color],
            number: [1, [Validators.min(1), Validators.max(this.maxAvailableProcesses)]],
        });
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
}
