import React from 'react';
import _ from 'lodash';
import parser from 'fast-xml-parser';
import he from 'he';

export function parseXmlToJson(xmlData) {
    return parser.parse(xmlData, {
        attributeNamePrefix : "",
        // attrNodeName: "attributes", //default is 'false'
        // textNodeName : "#text",
        ignoreAttributes : false,
        ignoreNameSpace : true,
        allowBooleanAttributes : true,
        parseNodeValue : true,
        parseAttributeValue : true,
        trimValues: true,
        // cdataTagName: "__cdata", //default is 'false'
        // cdataPositionChar: "\\c",
        // localeRange: "", //To support non english character in tag/attribute values.
        arrayMode: true,
        parseTrueNumberOnly: true,
        attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
        tagValueProcessor : a => he.decode(a) //default is a=>a
    });
}

export function arrayToObj(array, keyName) {
  if (typeof keyName !== 'string' || keyName.length === 0) {
    throw new Error('Argument keyName must be a non-empty string')
  }

  return array.reduce((obj, value) => { obj[value[keyName.trim()]] = value; return obj }, {});
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


/**
 * Always returns an array. If the passed argument is an array, that array will be returned.
 * Otherwise, whatever is passed will be wrapped in an array
 * If a string is passed, return an empty array
 * 
 * todo The last else statement should be only for objects
 * @param {Any} value 
 */
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

