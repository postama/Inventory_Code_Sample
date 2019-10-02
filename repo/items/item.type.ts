import { type, boolean, TypeOf, intersection, partial, string, number, Int, record } from 'io-ts';
import { validateType } from '../../infrastructure/validator/validator';
import { maxLength } from '../../infrastructure/custom-brands/string-length';
import { UUID } from 'io-ts-types/lib/UUID'

const ItemDataRequired = type({
    group: maxLength(100),
    name: maxLength(100),
    costPerUnit: Int,
    identifier: maxLength(50),
    isPreferred: boolean
});

const ItemDataOptional = partial({
    unitOfMeasurement: maxLength(100),
    supplier: maxLength(100),
    brand: maxLength(100),
    primaryLocation: UUID,
    deleted: string,
    created: string
});

export const ItemDataValidator = intersection([
    ItemDataRequired,
    ItemDataOptional
]);

export function createItemData(command): ItemData {
    return validateType(command, ItemDataValidator);
}

export type ItemData = TypeOf<typeof ItemDataValidator>;

const ItemValidator = intersection([
    type({
        quantity: number,
        created: string,
        locations: record(UUID, number)
    }),
    ItemDataValidator
]);

export type Item = TypeOf<typeof ItemValidator>;
