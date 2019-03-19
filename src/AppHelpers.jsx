// @flow
import React from 'react';
import _ from 'lodash';
import parser from 'fast-xml-parser';
import he from 'he';
import { UNIT_TYPE_ORDER } from './config';
import type { Element } from 'react';
import type { RosterfileJson, Roster, Category, Profile, Force, Selection, Characteristic, Rule } from './Types';

/**
 * Parses a stringified xml file into a JS object.
 * 
 * todo add some stricter return value than Object
 * @param {string} xmlData A stringified xml, extracted from a .rosz file
 */
export function parseXmlToJson(xmlData: string): Object {
  return parser.parse(xmlData, {
    attributeNamePrefix: '',
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    arrayMode: true,
    parseTrueNumberOnly: true,
    attrValueProcessor: a => he.decode(a, { isAttributeValue: true }),//default is a=>a
    tagValueProcessor: a => he.decode(a) //default is a=>a
    // attrNodeName: "attributes", //default is 'false'
    // textNodeName : "#text",
    // cdataTagName: "__cdata", //default is 'false'
    // cdataPositionChar: "\\c",
    // localeRange: "", //To support non english character in tag/attribute values.
  });
}

export function jsonToFormattedRoster(json: RosterfileJson): Roster {
  const jsonRosterData = json.roster;
  console.log(json)

  // Convert array to object for easier manipulation
  const costs: {
    PL: { value: number },
    pts: { value: number }
  } = arrayToObj(jsonRosterData.costs.cost, 'name');

  type RawForceData = Categorized & Selectioned & {
    id: string,
    entryId: string,
    name: string,
    catalogueName: string,
    catalogueRevision: number
  };

  const forces: Force[] = ensureArray(jsonRosterData.forces.force).map((force: RawForceData) => {
    return {
      id: force.id,
      name: force.name,
      catalogueName: force.catalogueName,
      catalogueRevision: force.catalogueRevision,
      categories: getCategories(force),
      selections: getSelections(force)
    };
  });

  const roster: Roster = {
    id: jsonRosterData.id,
    entryId: jsonRosterData.entryId,
    name: jsonRosterData.name,
    forces: forces,
    costs: {
      powerLevel: costs.PL.value,
      points: costs.pts.value
    }
  };

  return roster;
}

// todo fix the typing issues here.
export function arrayToObj(input: Object[], keyName: string) {
  if (typeof keyName !== 'string' || keyName.length === 0) {
    throw new Error('Argument keyName must be a non-empty string')
  }

  return input.reduce((obj, value) => {
    const trimmedKeyName: string = keyName.trim();
    const keyNamedValue: mixed = value[trimmedKeyName];

    if (typeof keyNamedValue === 'string') {
      obj[keyNamedValue] = value;
    }

    return obj;
  }, {});
}

export function createTableRow(arrayRowValues: Array<string | number>): Element<'tr'> {
  const rows = [];

  for (let i = 0; i < arrayRowValues.length; i++) {
    rows.push(<td>{arrayRowValues[i]}</td>);
  }

  return (<tr>
    {rows}
  </tr>);
}

export function createTableHeader(arrayRowValues: Array<string | number>): Element<'tr'> {
  const rows = [];

  for (let i = 0; i < arrayRowValues.length; i++) {
    rows.push(<th>{arrayRowValues[i]}</th>);
  }
  return (<tr>
    {rows}
  </tr>);
}


export function createTable(headerJSX: Element<'tr'>, rowsJSX: Array<Element<'tr'>>): Element<'table'> {
  return (<table>
    <thead>
      {headerJSX}
    </thead>
    <tbody>
      {rowsJSX}
    </tbody>
  </table>);
}

/**
 * Return the Category object that has primary: true.
 * todo Figure out how to handle the case where no primary category exists
 */
export function getPrimaryCategory(element: { categories: Array<Category> }): ?Category {
  return element.categories.find(category => category.primary === true);
}


/**
 * Sorts an array or Selections by their primary category
 */
export function sortByPrimaryCategory(elements: Selection[]): Selection[] {
  return _.sortBy(elements, element => {
    const primaryCategory = getPrimaryCategory(element);

    if (primaryCategory) {
      const index = UNIT_TYPE_ORDER.indexOf(primaryCategory.name.toLowerCase());
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
export function ensureArray(value: any): Array<any> {
  if (value instanceof Array) {
    return value
  } else if (typeof value === 'string' || typeof value === 'undefined') {
    return [];
  } else {
    return [value];
  }
}

export function buildTableFromProfilesList(profileTypeName: string, profilesList: Profile[]): Element<'table'> {
  // Gather the table header values
  const headers = [profileTypeName];

  // Build the rows
  const rowsJSX = profilesList.reduce((arr, profile, index) => {
    // Add profile details for this profile
    const { characteristics } = profile;

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


/**
 * Types and utility methods used that match and extract parts of the converted json source data structure
 */
type Categorized = {
  categories: {
    category: Array<{
      primary: boolean,
      name: string
    }>
  }
};

type Characterized = {
  characteristics: {
    characteristic: Array<{
      name: string,
      description: string
    }>
  }
};

type Profiled = {
  profiles: {
    profile: Array<Characterized & {
      id: string,
      name: string,
      characteristics: Array<{}>
    }>
  }
};

type Ruled = {
  rules: {
    rule: Array<{
      name: string,
      description: string
    }>
  }
};

type Selectioned = Profiled & {
  number: number,
  type: string,
  entryId: string,
  id: string,
  name: string,
  costs: {
    cost: Array<{ PL?: { value: number }, pts?: { value: number } }>
  },
  selections: {
    selection: []
  }
}

/**
 * Extracts and formats category data from raw JSON source
 * @param {Categorized} element An element coming from the XML to JSON converter
 */
function getCategories(element: Categorized): Category[] {
  return ensureArray(element.categories.category).map(category => {
    return {
      primary: category.primary,
      name: category.name
    }
  });
}

/**
 * Extracts and formats the characteristics from the source json data
 * @param {Characterized} element A characteristics-ish object, coming from the xml source converted to JSON
 */
function getCharacteristics(element: Characterized): Characteristic[] {
  return ensureArray(element.characteristics.characteristic).map(characteristic => {
    return {
      name: characteristic.name,
      value: characteristic.value
    };
  })
}

/**
 * Extracts and formats the profiles from the source json data
 * @param {Profiled} element A profile-ish object, coming from the xml source converted to JSON
 */
function getProfiles(element: Profiled): Profile[] {
 return  ensureArray(element.profiles.profile).map(profile => {
    return {
      type: profile.profileTypeName,
      name: profile.name,
      id: profile.id,
      characteristics: getCharacteristics(profile)
    };
  })
}

/**
 * Extracts and formats the rules from the source json data
 * @param {Ruled} element A rule-ish object, coming from the xml source converted to JSON
 */
function getRules(element: Ruled): Rule[] {
  return ensureArray(element.rules.rule).map(rule => {
    return {
      name: rule.name,
      description: rule.description
    };
  })
}

/**
 * Extracts and formats the selections from the source json data
 * @param {Selectioned} element A selection-ish object, coming from xml source converted to JSON 
 */
function getSelections(element: Selectioned): Selection[] {
  return sortByPrimaryCategory(ensureArray(element.selections.selection).map(selection => {
    const costs = arrayToObj(selection.costs.cost, 'name');

    return {
      number: selection.number,
      type: selection.type,
      entryId: selection.entryId,
      id: selection.id,
      name: selection.name,
      costs: {
        powerLevel: costs.PL.value,
        points: costs.pts.value
      },
      categories: getCategories(selection),
      profiles: getProfiles(selection),
      selections: getSelections(selection),
      rules: getRules(selection)
    }
  }));
}