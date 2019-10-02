import * as dynamo from '../../infrastructure/persistence/dynamo';
import { Reducer } from '../../infrastructure/reducer/reducer';
import { Location } from './location-type';
import { LocationEvent } from './location-event-types';
import { CREATE_LOCATION } from '../../services/locations/create-location/create-location-event';
import { createLocationReducer } from '../../services/locations/create-location/create-location-reducer';
import { getEntityQuery } from '../events/entity';
import { EDIT_LOCATION } from '../../services/locations/edit-location/edit-location-event';
import { editLocationReducer } from '../../services/locations/edit-location/edit-location-reducer';

export const LocationReducer = new Reducer<Location, LocationEvent>();

LocationReducer.register(CREATE_LOCATION, createLocationReducer);
LocationReducer.register(EDIT_LOCATION, editLocationReducer);

export async function getById(customerId: string, locationId: string): Promise<Location> {
    return await dynamo.pagedReducer<Location, LocationEvent>(LocationReducer, getEntityQuery(customerId, locationId));
}

export async function save(event: LocationEvent) {
    return await dynamo.put(event);
}