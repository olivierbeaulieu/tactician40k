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


export function getPrimaryCategory(node) {
  const { categories } = arrayToObj(node.elements, 'name');
  let primaryCategory;

  if (categories.elements) {
    primaryCategory = categories.elements.find(category => {
      // Yep, the xml has a 'true' string
      return category.attributes.primary === 'true'
    });
  }

  if (primaryCategory) {
    return primaryCategory.attributes.name;
  }
  
  return null;
}


const unitTypeOrder = ['hq', 'troops', 'fast attack', 'flyer', 'dedicated transport'];

export function sortByPrimaryCategory(elements) {
  return _.sortBy(elements, element => {
    const primaryCategory = getPrimaryCategory(element) || '';
    const index = unitTypeOrder.indexOf(primaryCategory.toLowerCase());
    return index === -1 ? 1000 : index;
  });
}


export function buildTableFromProfilesList(profileName, profilesList) {
  // Gather the table header values
  const headers = [profileName]; 

  // Build the rows
  const rowsJSX = profilesList.reduce((arr, profile, index) => {// Add profile details for this profile
    const { characteristics } = arrayToObj(profile.elements, 'name');

    if (characteristics) {
      const characteristicsArr = [profile.attributes.name];

      characteristics.elements.forEach((characteristic) => {
        if (index === 0) {
          headers.push(characteristic.attributes.name);
        }
        characteristicsArr.push(characteristic.attributes.value);
      });

      arr.push(createTableRow(characteristicsArr));
    }

    return arr;
  }, []);

  const headerJSX = createTableHeader(headers);

  return createTable(headerJSX, rowsJSX);
}