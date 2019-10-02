import { createCreateItemEvent } from '../create-item-event';
import { CreateItemCommand, CreateItemCommandValidator } from '../create-item-command';
import { createTestBaseItemInfo } from '../../../../repo/items/test/test-util';
import { createTestInventoryCommand } from '../../shared/test.util';

export function createTestCreateItemCommand(overrides?): CreateItemCommand {
    const base = createTestBaseItemInfo();
    return createTestInventoryCommand('CreateItem', CreateItemCommandValidator, overrides, base);
}

export function createTestCreateItemEvent(commandOverrides?, eventOverrides?) {
    const command = createTestCreateItemCommand(commandOverrides);
    const event = { ...createCreateItemEvent(command), ...eventOverrides };
    event.data = { created: new Date().getTime().toString(), ...event.data };
    event.state = event.data;
    return event;
}