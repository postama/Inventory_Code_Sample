import 'source-map-support/register';
import { APIGatewayEvent } from 'aws-lambda';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { DeleteItemCommand, createDeleteItemCommand } from './delete-item-command';
import { checkUniqueCommand } from '../../../repo/events/event';
import { ItemDeletedV1, createDeleteItemEvent } from './delete-item-event';
import { deleteItemReducer } from './delete-item-reducer';
import { getById, save } from '../../../repo/items/item';

export async function entry(request: APIGatewayEvent) {
    return requestHandler(deleteItem, request, request.pathParameters.itemId);
}

export async function deleteItem(request: any, itemId: string): Promise<void> {
    const command: DeleteItemCommand = createDeleteItemCommand(request, itemId);
    await checkUniqueCommand<DeleteItemCommand>(command);
    const event: ItemDeletedV1 = createDeleteItemEvent(command);
    const item = await getById(event.customerId, event.entityId);
    event.state = deleteItemReducer(item, event);
    await save(event);
    return;
}