import { brand, string, Branded, intersection } from 'io-ts';

export function minLength(min: number) {
    return brand(
        string,
        (a): a is Branded<string, any> => (a.length >= min),
        `StringLength:min:${min}`
    );
}

export function maxLength(max: number) {
    return brand(
        string,
        (a): a is Branded<string, any> => (a.length <= max),
        `StringLength:max:${max}`
    );
}

export function stringMatch(min: number, max: number) {
    return intersection([minLength(min), maxLength(max)]);
}