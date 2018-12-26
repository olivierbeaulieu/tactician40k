import React from 'react';
import _ from 'lodash';

export function arrayToObj(array, keyName) {
 return array.reduce((obj, value) => { obj[value[keyName.trim()]] = value; return obj }, {});
}


export function getPointsFromElement(source) {
  const elementsAttributes = source.elements.map(x => x.attributes);
  const costs = arrayToObj(elementsAttributes, 'name');

  return {
    powerLevel: costs[' PL'].value,
    points: costs['pts'].value,
  }
}


export function getSelectionsFromNode(node) {
  return arrayToObj(node.elements, 'name').selections;
}


export function getProfilesFromNode(node) {
  return arrayToObj(node.elements, 'name').profiles;
}


/*
 * Returns the passed elements as a map, where the key is the attr
 * and the value is an array of the elements that share the same attr value
 */
export function groupElementsByAttr(elements, attr) {
  return elements.reduce((obj, entry) => {
    const attrValue = entry.attributes[attr];

    if (typeof obj[attrValue] === 'undefined') {
      obj[attrValue] = [entry];
    } else {
      obj[attrValue].push(entry);
    }
    return obj;
  }, {});
}


export function createTableRow(arrayRowValues) {
  const rows = [];

  for (const i in arrayRowValues) {
    rows.push(<td>{arrayRowValues[i]}</td>);
  }
  return (<tr>
    {rows}
  </tr>);
}


export function createTableHeader(arrayRowValues) {
  const rows = [];

  for (const i in arrayRowValues) {
    rows.push(<th>{arrayRowValues[i]}</th>);
  }
  return (<tr>
    {rows}
  </tr>);
}


export function createTable(headerJSX, rowsJSX) {
  return (<table>
    <thead>
      {headerJSX}
    </thead>
    <tbody>
      {rowsJSX}
    </tbody>
  </table>);
}


export function getPrimaryCategory(element) {
  const categories = ensureArray(element.categories.category);
  return categories.find(category => category.primary === true);
}


const unitTypeOrder = ['hq', 'troops', 'fast attack', 'flyer', 'dedicated transport'];

export function sortByPrimaryCategory(elements) {
  return _.sortBy(elements, element => {
    const primaryCategory = getPrimaryCategory(element);

    if (primaryCategory) {
      const index = unitTypeOrder.indexOf(primaryCategory.name.toLowerCase());
      return index === -1 ? 1000 : index;
    } else {
      return 1000;
    }
  });
}


// Always returns an array. If the passed argument is an array, that array will be returned.
// Otherwise, whatever is passed will be wrapped in an array
// If a string is passed, return an empty array
export function ensureArray(value) {
  if (value instanceof Array) {
    return value
  } else if (typeof value === 'string') {
    return [];
  } else {
    return [value];
  }
}


export function buildTableFromProfilesList(profileTypeName, profilesList) {
  // Gather the table header values
  const headers = [profileTypeName]; 

  // Build the rows
  const rowsJSX = profilesList.reduce((arr, profile, index) => {// Add profile details for this profile
    const characteristics = getCharacteristics(profile);

    if (characteristics) {
      const characteristicsArr = [profile.name];

      characteristics.forEach((characteristic) => {
        if (index === 0) {
          headers.push(characteristic.name);
        }
        characteristicsArr.push(characteristic.value);
      });

      arr.push(createTableRow(characteristicsArr));
    }

    return arr;
  }, []);

  const headerJSX = createTableHeader(headers);

  return createTable(headerJSX, rowsJSX);
}


export function getRules(element) {
  if (element.rules && element.rules.rule) {
    return ensureArray(element.rules.rule);
  }
}

export function getCategories(element) {
  if (element.categories && element.categories.category) {
    return ensureArray(element.categories.category);
  }
}

export function getSelections(element) {
  if (element.selections && element.selections.selection) {
    return ensureArray(element.selections.selection);
  }
}

export function getCosts(element) {
  if (element.costs && element.costs.cost) {
    return ensureArray(element.costs.cost);
  }
}

export function getProfiles(element) {
  if (element.profiles && element.profiles.profile) {
    return ensureArray(element.profiles.profile);
  }
}

export function getCharacteristics(element) {
  if (element.characteristics && element.characteristics.characteristic) {
    return ensureArray(element.characteristics.characteristic);
  }
}