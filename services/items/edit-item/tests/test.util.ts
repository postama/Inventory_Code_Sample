import { createEditItemEvent, ItemEditedV1 } from '../edit-item-event';
import { EditItemCommand, EditItemCommandValidator } from '../edit-item-command';
import { createTestBaseItemInfo } from '../../../../repo/items/test/test-util';
import { createTestInventoryCommand } from '../../shared/test.util';

export function createTestEditCommand(overrides?): EditItemCommand {
    const base = createTestBaseItemInfo();
    return createTestInventoryCommand('EditItem', EditItemCommandValidator, overrides, base);
}

export function createTestEditItemEvent(commandOverrides?, eventOverrides?): ItemEditedV1 {
    const command = createTestEditCommand(commandOverrides);
    const event = { ...createEditItemEvent(command), ...eventOverrides };
    return event;
}