import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Box } from '../../models/box';
import { BlocksAction } from './blocks.action';
import { Process } from '../../models/process';
import { BlocksScalingTypesEnum } from '../../constants/blocks-types.contants';
import { Processes } from '../processes/processes.actions';
import { Sequence } from '../../models/sequence';

export interface BlocksStateModel {
	blocks: Box[];
	blockScaling: BlocksScalingTypesEnum;
}

export const BLOCKS_STATE_INITIAL_STATE: BlocksStateModel = {
	blocks: Array.from({ length: 120 }, (_, index) => ({
		process: null,
		index: index,
	})),
	blockScaling: BlocksScalingTypesEnum.FirstFit,
};

@State<BlocksStateModel>({
	name: 'simulateOSBlocks',
	defaults: { ...BLOCKS_STATE_INITIAL_STATE },
})
@Injectable()
export class BlocksState {
	constructor(private store: Store) {
		this.loadStateFromLocalStorage();
		window.addEventListener(
			'storage',
			this.syncStateFromLocalStorage.bind(this)
		);
	}

	@Selector()
	static getBlocks(state: BlocksStateModel) {
		return state.blocks;
	}

	@Selector()
	static getSequences(state: BlocksStateModel): Sequence[] {
		const blocks = state.blocks;
		const sequences: Sequence[] = [];
		let currentSequence: Sequence | null = null;

		for (let i = 0; i < blocks.length; i++) {
			if (!blocks[i].process) {
				if (currentSequence) {
					currentSequence.length++;
				} else {
					currentSequence = { start: i, length: 1 };
				}
			} else if (currentSequence) {
				sequences.push(currentSequence);
				currentSequence = null;
			}
		}

		if (currentSequence) {
			sequences.push(currentSequence);
		}

		return sequences;
	}

	@Selector()
	static getBlocksLength(state: BlocksStateModel): number {
		return state.blocks.length;
	}

	@Selector()
	static getOccupiedBlocksLength(state: BlocksStateModel): number {
		return state.blocks.filter((block) => block.process !== null).length;
	}

	@Selector()
	static getFreeBlocksLength(state: BlocksStateModel): number {
		return state.blocks.filter((block) => block.process === null).length;
	}

	@Selector()
	static getBlocksByProcessId(state: BlocksStateModel) {
		return (processId: string) =>
			state.blocks
				.map((block, index) => ({ block, index }))
				.filter(({ block }) => block.process?.id === processId)
				.map(({ index }) => index);
	}

	@Selector()
	static getBlockScaling(state: BlocksStateModel) {
		return state.blockScaling;
	}

	@Action(BlocksAction.AllocateBlocks)
	allocateBlocks(
		context: StateContext<BlocksStateModel>,
		action: BlocksAction.AllocateBlocks
	) {
		const state = context.getState();
		const blocks = [...state.blocks];
		const { memoryBlocksRequired } = action.payload;

		const emptyBlocksLength = blocks.filter((block) => !block.process).length;

		if (emptyBlocksLength < memoryBlocksRequired) {
			// Memória insuficiente
			return;
		}
		this.runMemoryBlockScaling(context, action);
		this.saveStateToLocalStorage(context.getState());
	}

	runFirstFit(
		context: StateContext<BlocksStateModel>,
		action: BlocksAction.AllocateBlocks
	) {
		const state = context.getState();
		const blocks = [...state.blocks];
		const { process, memoryBlocksRequired } = action.payload;

		const emptyBlocksLength = blocks.filter((block) => !block.process).length;

		if (emptyBlocksLength < memoryBlocksRequired) {
			// Memória insuficiente
			return;
		}

		let allocated = false;

		for (let i = 0; i <= blocks.length - memoryBlocksRequired; i++) {
			const canAllocate = blocks
				.slice(i, i + memoryBlocksRequired)
				.every((block) => !block.process);

			if (canAllocate) {
				for (let j = 0; j < memoryBlocksRequired; j++) {
					blocks[i + j] = { process, index: i + j }; // Registrando o índice do bloco
				}
				allocated = true;
				process.allocatedBlocks = blocks
					.slice(i, i + memoryBlocksRequired)
					.map((block) => block.index); // Guardando os índices dos blocos alocados no processo
				break;
			}
		}

		if (!allocated) {
			// Memória insuficiente ou fragmentada
			return;
		}

		context.patchState({ blocks });
	}

	runBestFit(
		context: StateContext<BlocksStateModel>,
		action: BlocksAction.AllocateBlocks
	) {
		const state = context.getState();
		const blocks = [...state.blocks];
		const { process, memoryBlocksRequired } = action.payload;

		const emptyBlocksLength = blocks.filter((block) => !block.process).length;

		if (emptyBlocksLength < memoryBlocksRequired) {
			// Memória insuficiente
			return;
		}

		let bestFitIndex = -1;
		let bestFitSize = Number.MAX_SAFE_INTEGER;

		let currentFreeIndex = -1;
		let currentFreeSize = 0;

		for (let i = 0; i < blocks.length; i++) {
			if (!blocks[i].process) {
				if (currentFreeSize === 0) {
					currentFreeIndex = i;
				}
				currentFreeSize++;
			} else {
				if (
					currentFreeSize >= memoryBlocksRequired &&
					currentFreeSize < bestFitSize
				) {
					bestFitIndex = currentFreeIndex;
					bestFitSize = currentFreeSize;
				}
				currentFreeSize = 0;
			}
		}

		// Verificar se o último bloco livre é o melhor ajuste
		if (
			currentFreeSize >= memoryBlocksRequired &&
			currentFreeSize < bestFitSize
		) {
			bestFitIndex = currentFreeIndex;
			bestFitSize = currentFreeSize;
		}

		if (bestFitIndex === -1) {
			// Memória insuficiente ou fragmentada
			return;
		}

		// Alocar o processo no bloco encontrado
		for (let i = 0; i < memoryBlocksRequired; i++) {
			blocks[bestFitIndex + i] = { process, index: bestFitIndex + i }; // Adicionando índice do bloco
		}
		process.allocatedBlocks = blocks
			.slice(bestFitIndex, bestFitIndex + memoryBlocksRequired)
			.map((block) => block.index); // Guardando os índices dos blocos alocados no processo

		context.patchState({ blocks });
	}

	runWorstFit(
		context: StateContext<BlocksStateModel>,
		action: BlocksAction.AllocateBlocks
	) {
		const state = context.getState();
		const blocks = [...state.blocks];
		const { process, memoryBlocksRequired } = action.payload;

		const emptyBlocksLength = blocks.filter((block) => !block.process).length;

		if (emptyBlocksLength < memoryBlocksRequired) {
			// Memória insuficiente
			return;
		}

		let worstFitIndex = -1;
		let worstFitSize = 0;

		let currentFreeIndex = -1;
		let currentFreeSize = 0;

		for (let i = 0; i < blocks.length; i++) {
			if (!blocks[i].process) {
				if (currentFreeSize === 0) {
					currentFreeIndex = i;
				}
				currentFreeSize++;
			} else {
				if (
					currentFreeSize >= memoryBlocksRequired &&
					currentFreeSize > worstFitSize
				) {
					worstFitIndex = currentFreeIndex;
					worstFitSize = currentFreeSize;
				}
				currentFreeSize = 0;
			}
		}

		// Verificar se o último bloco livre é o pior ajuste
		if (
			currentFreeSize >= memoryBlocksRequired &&
			currentFreeSize > worstFitSize
		) {
			worstFitIndex = currentFreeIndex;
			worstFitSize = currentFreeSize;
		}

		if (worstFitIndex === -1) {
			// Memória insuficiente ou fragmentada
			return;
		}

		// Alocar o processo no bloco encontrado
		for (let i = 0; i < memoryBlocksRequired; i++) {
			blocks[worstFitIndex + i] = { process, index: worstFitIndex + i }; // Adicionando índice do bloco
		}
		process.allocatedBlocks = blocks
			.slice(worstFitIndex, worstFitIndex + memoryBlocksRequired)
			.map((block) => block.index); // Guardando os índices dos blocos alocados no processo

		context.patchState({ blocks });
	}

	@Action(BlocksAction.ReleaseBlocks)
	releaseBlocks(
		context: StateContext<BlocksStateModel>,
		action: BlocksAction.ReleaseBlocks
	) {
		const { blocks } = context.getState();

		const newBlocks = blocks.map((block) => {
			if (
				block.process?.state === 'finished' ||
				block.process?.id === action.payload.id
			) {
				return { process: null, index: block.index }; // Manter o índice do bloco
			} else {
				return block; // Manter o bloco como está
			}
		});

		context.patchState({ blocks: newBlocks });
		this.saveStateToLocalStorage(context.getState());
	}

	@Action(BlocksAction.ReleaseBlockById)
	releaseBlockById(
		context: StateContext<BlocksStateModel>,
		action: BlocksAction.ReleaseBlockById
	) {
		const { blocks } = context.getState();
		const idToRelease = action.id;

		// Atualiza os blocos, liberando aquele que tem o ID correspondente
		const newBlocks = blocks.map((block) => {
			if (block.process?.id === idToRelease) {
				return { process: null, index: block.index }; // Manter o índice do bloco
			}
			return block; // Manter o bloco como está
		});

		context.patchState({ blocks: newBlocks });
		this.saveStateToLocalStorage(context.getState());
	}

	@Action(BlocksAction.ResetState)
	resetState(context: StateContext<BlocksStateModel>) {
		context.patchState({ blocks: BLOCKS_STATE_INITIAL_STATE.blocks });
		this.saveStateToLocalStorage(context.getState());
	}

	@Action(BlocksAction.PickBlockScalingType)
	pickBlockScalingType(
		context: StateContext<BlocksStateModel>,
		action: BlocksAction.PickBlockScalingType
	) {
		context.patchState({
			blockScaling: action.scalingType,
		});

		context.dispatch(new Processes.StopProcesses());
		this.runMemoryBlockScaling(context, action);
		this.saveStateToLocalStorage(context.getState());
	}

	private runMemoryBlockScaling(
		context: StateContext<BlocksStateModel>,
		action: any
	): void {
		const { blockScaling } = context.getState();

		switch (blockScaling) {
			case BlocksScalingTypesEnum.BestFit:
				this.runBestFit(context, action);
				break;
			case BlocksScalingTypesEnum.FirstFit:
				this.runFirstFit(context, action);
				break;
			case BlocksScalingTypesEnum.WorstFit:
				this.runWorstFit(context, action);
				break;
			default:
				break;
		}
		this.saveStateToLocalStorage(context.getState());
	}

	private saveStateToLocalStorage(state: BlocksStateModel) {
		localStorage.setItem('simulateOSBlocks', JSON.stringify(state));
	}

	private loadStateFromLocalStorage() {
		const localStorageState = localStorage.getItem('simulateOSBlocks');
		if (localStorageState) {
			this.store.reset({
				...this.store.snapshot(),
				simulateOSBlocks: JSON.parse(localStorageState),
			});
		}
	}

	private syncStateFromLocalStorage(event: StorageEvent) {
		if (event.key === 'simulateOSBlocks') {
			const localStorageState = JSON.parse(event.newValue || '{}');
			if (localStorageState) {
				this.store.reset({
					...this.store.snapshot(),
					simulateOSBlocks: localStorageState,
				});
			}
		}
	}
}
