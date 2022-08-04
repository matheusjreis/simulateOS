import { Injectable } from "@angular/core";
import { Color, ProcessColors } from "../constants/process-colors.constants";
import { ProcessStates } from "../constants/process-states.constants";
import { CreateProcessDTO, Process } from "../models/process";
import { concatMap, delay, from, Observable, of, toArray } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ProcessesService {
    processColors: Color[] = [];

    createProcess(
        process: CreateProcessDTO,
        time: number
    ): Observable<Process[]> {
        return from(Array.from(Array(process.number).keys())).pipe(
            concatMap((index) => {
                const item = {
                    id: this.generateId(),
                    priority: process.priority,
                    color: this.generateColor(process.color, index),
                    type: process.type,
                    state: ProcessStates.ready,
                    cpuTime: 0,
                    timeCreated: time,
                };
                return of(item).pipe(delay(50));
            }),
            toArray()
        );
    }

    private generateId(): string {
        const date = new Date();
        return `${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
    }

    private generateColor(color: string, currentIndex: number): string {
        const randomIndex = this.getRandomNumber();

        let generatedColor = ProcessColors[randomIndex].color;

        if (currentIndex === 0) {
            const foundColor = ProcessColors.find(
                (item) => item.color === color && item.isAvailable
            );

            if (foundColor) generatedColor = foundColor.color;
        }

        ProcessColors.find(
            (item) => item.color === generatedColor
        )!.isAvailable = false;

        return generatedColor;
    }

    private getRandomNumber(): number {
        const availableColors = ProcessColors.length;
        return Math.floor(Math.random() * (availableColors - 1));
    }
}
