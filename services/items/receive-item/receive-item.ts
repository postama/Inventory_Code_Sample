import { APIGatewayEvent } from 'aws-lambda';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { ReceiveItemCommand, createReceiveCommand } from './receive-item-command';
import { checkUniqueCommand } from '../../../repo/events/event';
import { ItemReceivedV1, createReceiveEvent } from './receive-item-event';
import { getById, save } from '../../../repo/items/item';
import { receiveItemReducer } from './receive-item-reducer';
import { checkLocationExists } from '../shared/validations';

export async function entry(request: APIGatewayEvent): Promise<any> {
    return requestHandler(createReceive, request, request.pathParameters.itemId);
}

export async function createReceive(request: any, itemId: string) {
    const command: ReceiveItemCommand = createReceiveCommand(request, itemId);
    await Promise.all([checkLocationExists(command.customerId, command.locationId, true), checkUniqueCommand(command)]);
    const event: ItemReceivedV1 = createReceiveEvent(command);
    const item = await getById(command.customerId, itemId);
    const { locations } = receiveItemReducer(item, event);
    event.state = locations;
    await save(event);
    return;
}