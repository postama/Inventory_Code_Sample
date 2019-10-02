import { ItemCreatedV1 } from '../../services/items/create-item/create-item-event';
import { ItemQtyAdjustedV1 } from '../../services/items/adjust-qty/adjust-qty-event';
import { ItemIssuedV1 } from '../../services/items/issue-item/issue-item-event';
import { ItemDisposedV1 } from '../../services/items/dispose-item/dispose-item-event';
import { ItemReceivedV1 } from '../../services/items/receive-item/receive-item-event';
import { ItemDeletedV1 } from '../../services/items/delete-item/delete-item-event';
import { ItemEditedV1 } from '../../services/items/edit-item/edit-item-event';
import { ItemTransferredV1 } from '../../services/items/transfer-item/transfer-item-event';

export type ItemEvent =
    ItemCreatedV1 |
    ItemQtyAdjustedV1 |
    ItemIssuedV1 |
    ItemDisposedV1 |
    ItemReceivedV1 |
    ItemDeletedV1 |
    ItemEditedV1 |
    ItemTransferredV1
    ;