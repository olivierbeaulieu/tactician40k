import { ensureArray, arrayToObj, createTableRow } from './AppHelpers';
import { mount } from 'enzyme';

describe('#ensureArray', () => {
  test('if an array is passed, it should return that same array', () => {
    const array = [1, 2, 3];

    expect(ensureArray(array)).toEqual(array);
  });

  test('if a string is passed, it should return an empty array', () => {
    const result = ensureArray('hello');

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  test('if an object is passed, return an array that contains passed object', () => {
    const obj = { foo: true };
    const result = ensureArray(obj);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
    expect(result[0]).toStrictEqual(obj);
  });

  test('if undefined is passed, it should return an empty array', () => {
    const result = ensureArray(undefined);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  })
});

describe('#arrayToObj', () => {
  let input;

  beforeEach(() => {
    input = [
      {
        "name": "PL",
        "costTypeId": "e356-c769-5920-6e14",
        "value": 102
      },
      {
        "name": "pts",
        "costTypeId": "points",
        "value": 1961
      }
    ];
  });

  test('it should convert an array into an object based on the provided key', () => {
    const expectedOutput = {
      "PL": {
        "name": "PL",
        "costTypeId": "e356-c769-5920-6e14",
        "value": 102
      },
      "pts": {
        "name": "pts",
        "costTypeId": "points",
        "value": 1961
      }
    };

    expect(arrayToObj(input, 'name')).toEqual(expectedOutput);
  });

  test('it should throw an error when invoked with an invalid keyName argument', () => {
    expect(() => {
      arrayToObj(input, undefined);
    }).toThrowError();
  });
});

describe('#createTableRow', () => {
  test('it should return a table row element with the provided values as columns', () => {
    const result = mount(createTableRow(['Hello', 'world', '!']));
    expect(result.html()).toEqual('<tr><td>Hello</td><td>world</td><td>!</td></tr>');
  });
});