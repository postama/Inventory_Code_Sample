import { APIGatewayEvent } from 'aws-lambda';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { CreateLocationCommand, createCreateLocationCommand } from './create-location-command';
import { checkUniqueCommand } from '../../../repo/events/event';
import { LocationCreatedV1, createCreateLocationEvent } from './create-location-event';
import { createLocationReducer } from './create-location-reducer';
import { save } from '../../../repo/locations/location';

export function entry(request: APIGatewayEvent) {
    return requestHandler(createLocation, request);
}

export async function createLocation(request): Promise<void> {
    const command: CreateLocationCommand = createCreateLocationCommand(request);
    await checkUniqueCommand(command);
    const event: LocationCreatedV1 = createCreateLocationEvent(command);
    event.state = createLocationReducer({} as any, event);
    await save(event);
    return;
}