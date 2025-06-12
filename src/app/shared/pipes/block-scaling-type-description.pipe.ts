import { Pipe, PipeTransform } from '@angular/core';

import { BlocksScalingTypesEnum } from '../constants/blocks-types.contants';

@Pipe({
	name: 'blockScalingTypeDescription',
})
export class BlockScalingTypeDescriptionPipe implements PipeTransform {
	transform(value: BlocksScalingTypesEnum | null): string {
		switch (value) {
			case BlocksScalingTypesEnum.BestFit:
				return 'Best Fit';
			case BlocksScalingTypesEnum.FirstFit:
				return 'First Fit';
			case BlocksScalingTypesEnum.WorstFit:
				return 'Worst Fit';
			default:
				return '--';
		}
	}
}
