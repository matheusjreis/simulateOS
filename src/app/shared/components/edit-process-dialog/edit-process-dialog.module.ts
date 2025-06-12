import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatChipsModule } from "@angular/material/chips";
import { MatButtonModule } from "@angular/material/button";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatMenuModule } from "@angular/material/menu";
import { SharedModule } from "src/app/shared/shared.module";
import { EditProcessDialogComponent } from "./edit-process-dialog.component";
import { MatLabel } from "@angular/material/form-field";
import { MemoryManagerModule } from "src/app/modules/memory-manager/memory-manager.module";
import { FormsModule } from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        MatLabel,
		MatIconModule,
        MatTableModule,
        MatChipsModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        MemoryManagerModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSelectModule,
        MatMenuModule,
        SharedModule,
    ],
    declarations: [
        EditProcessDialogComponent
    ],
})
export class EditProcessDialog {}
