import { DisposeItemCommand, DisposeItemValidator } from '../dispose-item-command';
import { createDisposeEvent } from '../dispose-item-event';
import { createTestInventoryActionCommand } from '../../shared/test.util';

export function createTestDisposeCommand(overrides = {}): DisposeItemCommand {
    return createTestInventoryActionCommand('DisposeItem', DisposeItemValidator, overrides);
}

export function createTestDisposeEvent(commandOverrides = {}, eventOverrides = {}) {
    const command = createTestDisposeCommand(commandOverrides);
    const event = { ...createDisposeEvent(command), ...eventOverrides };
    return event;
}