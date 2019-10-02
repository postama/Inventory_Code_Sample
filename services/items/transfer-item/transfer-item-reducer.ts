import { Item } from '../../../repo/items/item.type';
import { ItemTransferredV1 } from './transfer-item-event';
import { isEmpty } from '../../../infrastructure/util/hasValues';
import { ValidationError } from '../../../../Kanso.Doorways.InventoryShared/errors';

export function transferItemReducer(item: Item, event: ItemTransferredV1): Item {
    if (isEmpty(item)) throw new ValidationError('Item does not exist, event cannot be processed');
    const newFromQty = (item.locations[event.data.locationId] || 0) - event.data.quantity;
    const newToQty = (item.locations[event.data.transferredTo] || 0) + event.data.quantity;
    if (newFromQty < 0) throw new ValidationError(`Cannot transfer quantity below 0 at location ${event.data.locationId}`);

    return {
        ...item,
        locations: {
            ...item.locations,
            [event.data.locationId]: newFromQty,
            [event.data.transferredTo]: newToQty
        }
    };
}