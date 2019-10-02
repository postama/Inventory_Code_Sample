import { APIGatewayEvent } from 'aws-lambda';
import { requestHandler } from '../../../../Kanso.Doorways.InventoryShared/entry-wrapper/entry-wrapper';
import { EditLocationCommand, createEditLocationCommand } from './edit-location-command';
import { checkUniqueCommand } from '../../../repo/events/event';
import { LocationEditedV1, createEditLocationEvent } from './edit-location-event';
import { editLocationReducer } from './edit-location-reducer';
import { getById, save } from '../../../repo/locations/location';

export async function entry(request: APIGatewayEvent) {
    return requestHandler(editLocation, request, request.pathParameters.locationId);
}

export async function editLocation(request: any, locationId: string): Promise<void> {
    const command: EditLocationCommand = createEditLocationCommand(request, locationId);
    await checkUniqueCommand(command);
    const event: LocationEditedV1 = createEditLocationEvent(command);
    const location = await getById(command.customerId, locationId);
    event.state = editLocationReducer(location, event);
    await save(event);
    return;
}