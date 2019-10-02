import uuid from 'uuid/v4';
import { TransferItemCommand, TransferItemValidator } from '../transfer-item-command';
import { createTestInventoryActionCommand } from '../../shared/test.util';
import { createTransferEvent } from '../transfer-item-event';

export function createTestTransferCommand(overrides = {}): TransferItemCommand {
    return createTestInventoryActionCommand('TransferItem', TransferItemValidator, overrides, { transferTo: uuid() });
}

export function createTestTransferItemEvent(commandOverrides = {}, eventOverrides = {}) {
    const command = createTestTransferCommand(commandOverrides);
    const event = { ...createTransferEvent(command), ...eventOverrides };
    return event;
}