import 'source-map-support/register';
import { save } from '../../../repo/items/item';
import { checkUniqueCommand } from '../../../repo/events/event';
import { ItemCreatedV1, createCreateItemEvent } from './create-item-event';
import { CreateItemCommand, createCreateItemCommand } from './create-item-command';
import { APIGatewayEvent } from 'aws-lambda';
import { createItemReducer } from './create-item-reducer';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { checkLocationExists } from '../shared/validations';

export async function entry(request: APIGatewayEvent) {
    return requestHandler(createItem, request);
}

export async function createItem(request): Promise<{ id: string }> {
    const command: CreateItemCommand = createCreateItemCommand(request);
    await Promise.all([
        command.primaryLocation && checkLocationExists(command.customerId, command.primaryLocation),
        checkUniqueCommand(command)
    ]);
    const event: ItemCreatedV1 = createCreateItemEvent(command);
    event.state = createItemReducer({} as any, event);
    await save(event);
    return { id: event.entityId };
}