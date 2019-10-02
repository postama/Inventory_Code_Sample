import { APIGatewayEvent } from 'aws-lambda';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { createEditItemCommand, EditItemCommand } from './edit-item-command';
import { checkUniqueCommand } from '../../../repo/events/event';
import { createEditItemEvent, ItemEditedV1 } from './edit-item-event';
import { editItemReducer } from './edit-item-reducer';
import { save, getById } from '../../../repo/items/item';
import { checkLocationExists } from '../shared/validations';

export async function entry(request: APIGatewayEvent) {
    return requestHandler(editItem, request, request.pathParameters.itemId);
}

export async function editItem(request: any, itemId: string): Promise<void> {
    const command: EditItemCommand = createEditItemCommand(request, itemId);
    await Promise.all([
        command.primaryLocation && checkLocationExists(command.customerId, command.primaryLocation),
        checkUniqueCommand(command)
    ]);

    const event: ItemEditedV1 = createEditItemEvent(command);
    const item = await getById(command.customerId, itemId);
    event.state = editItemReducer(item, event);
    await save(event);
    return;
}