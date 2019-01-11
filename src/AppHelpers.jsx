// @flow
import React from 'react';
import _ from 'lodash';
import parser from 'fast-xml-parser';
import he from 'he';
import type { Element } from 'react';
import type { RosterfileJson, Roster, Category, Profile, Selection } from './Types';

/**
 * Parses a stringified xml file into a JS object.
 * 
 * todo add some stricter return value than Object
 * @param {string} xmlData A stringified xml, extracted from a .rosz file
 */
export function parseXmlToJson(xmlData: string): Object {
  return parser.parse(xmlData, {
    attributeNamePrefix: '',
    // attrNodeName: "attributes", //default is 'false'
    // textNodeName : "#text",
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    // cdataTagName: "__cdata", //default is 'false'
    // cdataPositionChar: "\\c",
    // localeRange: "", //To support non english character in tag/attribute values.
    arrayMode: true,
    parseTrueNumberOnly: true,
    attrValueProcessor: a => he.decode(a, { isAttributeValue: true }),//default is a=>a
    tagValueProcessor: a => he.decode(a) //default is a=>a
  });
}

export function jsonToFormattedRoster(json: RosterfileJson): Roster {
  const jsonRosterData = json.roster;

  // Convert array to object for easier manipulation
  const costs = arrayToObj(jsonRosterData.costs.cost, 'name');

  // todo refactor this mess
  const forces = ensureArray(jsonRosterData.forces.force).map(force => {
    return {
      id: force.id,
      name: force.name,
      catalogueName: force.catalogueName,
      catalogueRevision: force.catalogueRevision,

      categories: ensureArray(force.categories.category).map(category => {
        return {
          primary: category.primary,
          name: category.name
        }
      }),

      selections: sortByPrimaryCategory(ensureArray(force.selections.selection).map(selection => {
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
          categories: ensureArray(selection.categories.category).map(category => {
            return {
              primary: category.primary,
              name: category.name
            }
          }),
          profiles: ensureArray(selection.profiles.profile).map(profile => {
            return {
              type: profile.profileTypeName,
              name: profile.name,
              id: profile.id,
              characteristics: ensureArray(profile.characteristics.characteristic).map(characteristic => {
                return {
                  name: characteristic.name,
                  value: characteristic.value
                };
              })
            };
          }),
          selections: ensureArray(selection.selections.selection).map(selection => {
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
              categories: ensureArray(selection.categories.category).map(category => {
                return {
                  primary: category.primary,
                  name: category.name
                }
              }),
              profiles: ensureArray(selection.profiles.profile).map(profile => {
                return {
                  type: profile.profileTypeName,
                  name: profile.name,
                  id: profile.id,
                  characteristics: ensureArray(profile.characteristics.characteristic).map(characteristic => {
                    return {
                      name: characteristic.name,
                      value: characteristic.value
                    };
                  })
                };
              }),
              rules: ensureArray(selection.rules.rule).map(rule => {
                return {
                  name: rule.name,
                  description: rule.description
                };
              }),
              selections: ensureArray(selection.selections.selection).map(selection => {
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
                  selections: [],
                  categories: [],
                  rules: [],
                  profiles: ensureArray(selection.profiles.profile).map(profile => {
                    return {
                      type: profile.profileTypeName,
                      name: profile.name,
                      id: profile.id,
                      characteristics: ensureArray(profile.characteristics.characteristic).map(characteristic => {
                        return {
                          name: characteristic.name,
                          value: characteristic.value
                        };
                      })
                    };
                  })
                }
              })
            }
          }),
          rules: ensureArray(selection.rules.rule).map(rule => {
            return {
              name: rule.name,
              description: rule.description
            };
          })
        }
      }))
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

export function arrayToObj<T: {}>(input: Array<T>, keyName: string): Object {
  if (typeof keyName !== 'string' || keyName.length === 0) {
    throw new Error('Argument keyName must be a non-empty string')
  }

  return input.reduce((obj: {}, value: T) => { obj[value[keyName.trim()]] = value; return obj }, {});
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
 * @param {*} element 
 */
export function getPrimaryCategory(element: { categories: Array<Category> }): ?Category {
  return element.categories.find(category => category.primary === true);
}


const unitTypeOrder = ['hq', 'troops', 'fast attack', 'flyer', 'dedicated transport'];

export function sortByPrimaryCategory(elements: Selection[]): Selection[] {
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
  const rowsJSX = profilesList.reduce((arr, profile, index) => {// Add profile details for this profile
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