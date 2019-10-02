import { ReceiveItemCommand, ReceiveItemValidator } from '../receive-item-command';
import { createReceiveEvent } from '../receive-item-event';
import { createTestInventoryActionCommand } from '../../shared/test.util';

export function createTestReceiveCommand(overrides = {}): ReceiveItemCommand {
    return createTestInventoryActionCommand('ReceiveItem', ReceiveItemValidator, overrides);
}

export function createTestReceiveEvent(commandOverrides = {}, eventOverrides = {}) {
    const command = createTestReceiveCommand(commandOverrides);
    const event = { ...createReceiveEvent(command), ...eventOverrides };
    return event;
}