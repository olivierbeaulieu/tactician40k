import React from 'react';

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