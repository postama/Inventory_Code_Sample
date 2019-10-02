import { createTransferCommand, TransferItemCommand } from './transfer-item-command';
import { checkLocationExists } from '../shared/validations';
import { checkUniqueCommand } from '../../../repo/events/event';
import { ItemTransferredV1, createTransferEvent } from './transfer-item-event';
import { getById, save } from '../../../repo/items/item';
import { transferItemReducer } from './transfer-item-reducer';
import { APIGatewayEvent } from 'aws-lambda';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';

export async function entry(request: APIGatewayEvent): Promise<any> {
    return requestHandler(createTransfer, request, request.pathParameters.itemId);
}

export async function createTransfer(request: any, itemId: string) {
    const command: TransferItemCommand = createTransferCommand(request, itemId);
    await Promise.all([checkLocationExists(command.customerId, command.locationId), checkUniqueCommand(command)]);
    const event: ItemTransferredV1 = createTransferEvent(command);
    const item = await getById(command.customerId, itemId);
    const { locations } = transferItemReducer(item, event);
    event.state = locations;
    await save(event);
    return;
}