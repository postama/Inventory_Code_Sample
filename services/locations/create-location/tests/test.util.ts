import { createTestLocationCommand } from '../../shared/test.util';
import { CreateLocationCommandValidator } from '../create-location-command';
import { createCreateLocationEvent } from '../create-location-event';

export function createTestCreateLocationCommand(overrides?) {
    return createTestLocationCommand('CreateLocation', CreateLocationCommandValidator, overrides);
}

export function createTestCreateLocationEvent(commandOverrides?, eventOverrides?) {
    const command = createTestCreateLocationCommand(commandOverrides);
    const event = { ...createCreateLocationEvent(command), ...eventOverrides };
    event.data.created = new Date().getTime().toString();
    event.state = event.data;
    return event;
}