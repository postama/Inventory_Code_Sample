import { Item } from '../../../repo/items/item.type';
import { isEmpty } from '../../../infrastructure/util/hasValues';
import { ValidationError } from '../../../../Kanso.Doorways.InventoryShared/errors';
import { ItemQtyAdjustedV1 } from './adjust-qty-event';

export function adjustQtyReducer(item: Item, event: ItemQtyAdjustedV1): Item {
    if (isEmpty(item)) throw new ValidationError('Item does not exist, event cannot be processed');
    const newQty = (item.locations[event.data.locationId] || 0) + event.data.quantity;
    if (newQty < 0) throw new ValidationError(`Cannot adjust quantity below 0 at location ${event.data.locationId}`);

    return {
        ...item,
        quantity: item.quantity + event.data.quantity,
        locations: {
            ...item.locations,
            [event.data.locationId]: newQty
        }
    };
}
