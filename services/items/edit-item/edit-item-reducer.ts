import { Item } from '../../../repo/items/item.type';
import { ItemEditedV1 } from './edit-item-event';
import { isEmpty } from '../../../infrastructure/util/hasValues';
import { ValidationError } from '../../../../Kanso.Doorways.InventoryShared/errors';

export function editItemReducer(item: Item, event: ItemEditedV1): Item {
    if (isEmpty(item)) throw new ValidationError('Item does not exist, event cannot be processed');
    return {
        ...event.data,
        quantity: item.quantity,
        created: item.created,
        locations: item.locations
    };
}