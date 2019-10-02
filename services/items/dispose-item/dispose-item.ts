import 'source-map-support/register';
import { APIGatewayEvent } from 'aws-lambda';
import { DisposeItemCommand, createDisposeCommand } from './dispose-item-command';
import { checkUniqueCommand } from '../../../repo/events/event';
import { ItemDisposedV1, createDisposeEvent } from './dispose-item-event';
import { disposeItemReducer } from './dispose-item-reducer';
import { getById, save } from '../../../repo/items/item';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { checkLocationExists } from '../shared/validations';

export async function entry(request: APIGatewayEvent) {
    return requestHandler(createDisposal, request, request.pathParameters.itemId);
}

export async function createDisposal(request: any, itemId: string): Promise<void> {
    const command = createDisposeCommand(request, itemId);
    await Promise.all([checkLocationExists(command.customerId, command.locationId), checkUniqueCommand<DisposeItemCommand>(command)]);
    const event: ItemDisposedV1 = createDisposeEvent(command);
    const item = await getById(command.customerId, itemId);
    const { locations } = disposeItemReducer(item, event);
    event.state = locations;
    await save(event);
    return;
}
