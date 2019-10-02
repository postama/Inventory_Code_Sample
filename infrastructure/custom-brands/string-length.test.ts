import { type, partial } from 'io-ts';
import { stringMatch, minLength, maxLength } from './string-length';
import { validateType } from '../validator/validator';

describe('string length validator', () => {
    test('should validate with a string matching the validator length', () => {
        const testValidator = type({ name: stringMatch(6, 6) });

        const testObj = { name: '123456' };
        const valid = validateType(testObj, testValidator);

        expect(testObj).toEqual(valid);
    });

    test('should fail with strings not matching the validator length', () => {
        const testValidator = type({ name: stringMatch(6, 6) });
        const testObj = { name: '12345' };

        expect.assertions(2);

        try {
            validateType(testObj, testValidator);
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.message).toBe('Expecting (StringLength:min:6 & StringLength:max:6) at name but instead got: \"12345\".');
        }
    });

    test('should allow only a min, success', () => {
        const testValidator = type({ name: minLength(6) });
        const testObj = { name: '1234567' };

        const valid = validateType(testObj, testValidator);

        expect(testObj).toEqual(valid);
    });

    test('should fail when less than min', () => {
        const testValidator = type({ name: minLength(6) });
        const testObj = { name: '12345' };

        expect.assertions(2);

        try {
            validateType(testObj, testValidator);
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.message).toBe('Expecting StringLength:min:6 at name but instead got: \"12345\".');
        }
    });

    test('should allow only a max', () => {
        const testValidator = type({ name: maxLength(6) });
        const testObj = { name: '12345' };

        const valid = validateType(testObj, testValidator);

        expect(testObj).toEqual(valid);
    });

    test('should fail when over a max', () => {
        const testValidator = type({ name: maxLength(6) });
        const testObj = { name: '1234567' };

        expect.assertions(2);

        try {
            validateType(testObj, testValidator);
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.message).toBe('Expecting StringLength:max:6 at name but instead got: \"1234567\".');
        }
    });

    test('should allow between a min and a max', () => {
        const testValidator = type({ name: stringMatch(4, 6) });
        const testObj = { name: '12345' };

        const valid = validateType(testObj, testValidator);

        expect(testObj).toEqual(valid);
    });

    test('should allow partial values when used with a partial', () => {
        const testValidator = partial({ name: stringMatch(4, 6) });
        const testObj = {};

        const valid = validateType(testObj, testValidator);

        expect(testObj).toEqual(valid);
    });
});