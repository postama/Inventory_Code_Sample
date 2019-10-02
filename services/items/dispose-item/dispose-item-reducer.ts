import { Item } from '../../../repo/items/item.type';
import { isEmpty } from '../../../infrastructure/util/hasValues';
import { ValidationError } from '../../../../Kanso.Doorways.InventoryShared/errors';
import { ItemDisposedV1 } from './dispose-item-event';

export function disposeItemReducer(item: Item, event: ItemDisposedV1): Item {
    if (isEmpty(item)) throw new ValidationError('Item does not exist, event cannot be processed');
    const newLocationQty = (item.locations[event.data.locationId] || 0) - event.data.quantity;
    if (newLocationQty < 0) throw new ValidationError(`Cannot reduce quantity below 0 at location ${event.data.locationId}`);
    return {
        ...item,
        quantity: item.quantity - event.data.quantity,
        locations: {
            ...item.locations,
            [event.data.locationId]: newLocationQty
        }
    };
}