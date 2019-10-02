import { Item } from '../../../repo/items/item.type';
import { ItemCreatedV1 } from './create-item-event';

// _item is unused but still passed in. Starting with _ makes the compiler not complain about it being unused, but makes tslint complain about naming
// tslint:disable-next-line variable-name
export function createItemReducer(_item: Item, event: ItemCreatedV1): Item {
    return {
        ...event.data,
        quantity: 0,
        created: event.created,
        locations: {}
    };
}
