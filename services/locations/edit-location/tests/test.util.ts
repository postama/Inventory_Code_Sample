import { createTestLocationCommand } from '../../shared/test.util';
import { EditLocationCommandValidator } from '../edit-location-command';
import { createEditLocationEvent } from '../edit-location-event';

export function createTestEditLocationCommand(overrides?) {
    return createTestLocationCommand('EditLocation', EditLocationCommandValidator, overrides);
}

export function createTestEditLocationEvent(commandOverrides?, eventOverrides?) {
    const command = createTestEditLocationCommand(commandOverrides);
    const event = { ...createEditLocationEvent(command), ...eventOverrides };
    event.data = { created: new Date().getTime().toString(), ...event.data };
    event.state = event.data;
    return event;
}