import { ItemEvent } from '../items/item-event-types';
import { LocationEvent } from '../locations/location-event-types';

export type Event =
    ItemEvent |
    LocationEvent;