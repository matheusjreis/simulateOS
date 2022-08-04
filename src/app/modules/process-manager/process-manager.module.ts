import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProcessManagerComponent } from "./process-manager.component";
import { ProcessManagerRoutingModule } from "./process-manager-routing.module";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatChipsModule } from "@angular/material/chips";
import { MatButtonModule } from "@angular/material/button";
import { CreateProcessDialogComponent } from "./components/create-process-dialog/create-process-dialog.component";
import { EditProcessDialogComponent } from "./components/edit-process-dialog/edit-process-dialog.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { ColorPickerDialogComponent } from "./components/color-picker-dialog/color-picker-dialog.component";
import { MatMenuModule } from "@angular/material/menu";
import { SharedModule } from "src/app/shared/shared.module";
import { UpdatePriorityDialogComponent } from "./components/update-priority-dialog/update-priority-dialog.component";

@NgModule({
    imports: [
        CommonModule,
        ProcessManagerRoutingModule,
		MatIconModule,
        MatTableModule,
        MatChipsModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSelectModule,
        MatMenuModule,
        SharedModule,
    ],
    declarations: [
        ProcessManagerComponent,
        CreateProcessDialogComponent,
        EditProcessDialogComponent,
        ColorPickerDialogComponent,
        UpdatePriorityDialogComponent,
    ],
})
export class ProcessManagerModule {}
