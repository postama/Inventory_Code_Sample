import { DeleteItemCommand, DeleteItemCommandValidator } from '../delete-item-command';
import { createDeleteItemEvent, ItemDeletedV1 } from '../delete-item-event';
import { createTestInventoryCommand } from '../../shared/test.util';
import { createTestItem } from '../../../../repo/items/test/test-util';

export function createTestDeleteCommand(overrides = {}): DeleteItemCommand {
    return createTestInventoryCommand('DeleteItem', DeleteItemCommandValidator, overrides);
}

export function createTestDeleteEvent(commandOverrides = {}, eventOverrides = {}): ItemDeletedV1 {
    const command = createTestDeleteCommand(commandOverrides);
    const event = { ...createDeleteItemEvent(command), ...eventOverrides };
    event.data = createTestItem();
    event.data.deleted = new Date().getTime().toString();
    event.state = event.data;
    return event;
}