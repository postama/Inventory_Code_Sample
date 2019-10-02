import { getById } from '../../../repo/locations/location';
import { ValidationError } from '../../../../Kanso.Doorways.InventoryShared/errors';

export async function checkLocationExists(customerId: string, locationId: string, isActive = false): Promise<void> {
    const location = await getById(customerId, locationId);
    if (!location) throw new ValidationError(`Location ${locationId} does not exist`);
    if (isActive && !location.isActive) throw new ValidationError(`Location ${locationId} is not active`);
    return;
}