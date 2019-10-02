import 'source-map-support/register';
import { save, getById } from '../../../repo/items/item';
import { checkUniqueCommand } from '../../../repo/events/event';
import { ItemQtyAdjustedV1, createAdjustQtyEvent } from './adjust-qty-event';
import { AdjustItemQtyCommand, createAdjustCommand } from './adjust-qty-command';
import { APIGatewayEvent } from 'aws-lambda';
import { adjustQtyReducer } from './adjust-qty-reducer';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { checkLocationExists } from '../shared/validations';

export async function entry(request: APIGatewayEvent) {
    return requestHandler(createAdjustment, request, request.pathParameters.itemId);
}

export async function createAdjustment(request: any, itemId: string): Promise<void> {
    const command: AdjustItemQtyCommand = createAdjustCommand(request, itemId);
    await Promise.all([
        checkUniqueCommand(command),
        checkLocationExists(command.customerId, command.locationId)
    ]);
    const event: ItemQtyAdjustedV1 = createAdjustQtyEvent(command);
    const item = await getById(command.customerId, itemId);
    const { locations } = adjustQtyReducer(item, event);
    event.state = locations;
    await save(event);
    return;
}
