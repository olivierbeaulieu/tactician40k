// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import { TABLES_ORDER } from '../config';
import {
  buildTableFromProfilesList,
  createTableHeader,
  createTableRow,
  createTable
} from '../AppHelpers';
import type { Selection, Rule, Category, Profile } from '../Types';
import type { Element } from 'react';

const RULES_TITLE = 'Rules';
const KEYWORDS_TITLE = 'Keywords';
const MODELS_TITLE = 'Models';
const SELECTIONS_TITLE = 'Selections';
/**
 * Given an array of Rules, returns a React table element
 * @param {Rule[]} rules An array of Rule objects
 */
function getRulesJSX(rules: Rule[]): Element<'table'> {
  const rulesHeader = createTableHeader([RULES_TITLE, 'Description']);
  const rulesRows = rules.map(rule => createTableRow([rule.name, rule.description]));
  return createTable(rulesHeader, rulesRows);
}

/**
 * Give an array of Categories, returns a React table element listing out the categories
 * @param {Category[]} categories An array of Category objects
 */
function getKeywordsJSX(categories: Category[]): Element<'table'> {
  const categoriesListString = categories.map(category => category.name).join(', ');
  return createTable(createTableHeader([KEYWORDS_TITLE]), [createTableRow([categoriesListString])]);
}

/**
 * Given an array of selections, it find all the selections of type 'model' and returns a Table element that contains the information
 * @param {Selection[]} subselections An array of selections
 */
function getModelsJSX(subselections: Selection[]): Element<'table'> | null {
  const models = subselections.filter(selection => selection.type === 'model').map(model => {
    const selections = model.selections.map(selection => selection.name).join(', ')
    return createTableRow([`${model.number}x ${model.name}`, selections]);
  });

  if (models.length > 0) {
    return createTable(createTableHeader([MODELS_TITLE, SELECTIONS_TITLE]), models);
  } else {
    return null;
  }
}

/**
 * Given a selection, returns a map of Table elements for all profiles that can be found in the top element, and every child selection
 * @param {Selection} selection A selection object
 */
function getProfilesJSX(selection: Selection): { [string]: Element<'table'>} {
  // This function recursively find all profiles and returns them 
  function getAllProfiles(node: Selection): Profile[] {
    const allProfiles = [];
    const { profiles, selections } = node;

    // Add all the top-level profiles to the list
    allProfiles.push(...profiles);

    // Append all profiles found in the child selections
    selections.forEach(selection => {
      allProfiles.push(...getAllProfiles(selection));
    })

    return allProfiles;
  }

  // Recursively get all profiles
  const allProfiles = getAllProfiles(selection);

  // Group all profiles by their type
  const profilesGroupedByType: {[string]: Profile[]} = _.groupBy(allProfiles, 'type');

  // Iterate on all profile types
  return _.mapValues(profilesGroupedByType, (profiles, profileType) => {
    // Ensure that the same profile doesn't appear multiple times in the same table
    const uniqueProfiles = _.uniqBy(profilesGroupedByType[profileType], (profile: Profile) => profile.name);

    // Create tables from the list of profiles
    if (uniqueProfiles.length > 0) {
      return buildTableFromProfilesList(profileType, uniqueProfiles);
    } else {
      return null;
    }
  });
}

type Props = {
  selection: Selection
};

class SelectionView extends Component<Props> {
  render() {
    const { selection } = this.props;
    const subselections = selection.selections;
    const { id, name, categories, rules } = selection;

    // Build a map with all of the sections' JSX to be rendered
    const jsxSectionsMap = {
      [KEYWORDS_TITLE]: getKeywordsJSX(categories),
      [RULES_TITLE]: getRulesJSX(rules),
      [MODELS_TITLE]: getModelsJSX(subselections),
      ...getProfilesJSX(selection)
    };

    // Order all the sections to be rendered based on config
    const orderedSectionsJSX = [];
    _.sortBy(Object.keys(jsxSectionsMap), key => {
      const index = TABLES_ORDER.indexOf(key.toLowerCase());
      return index >= 0 ? index : 9000;
    })
      .forEach(key => orderedSectionsJSX.push(jsxSectionsMap[key]));

    // Return full datacard JSX
    return (
      <div id={'datacard-' + id} className="datacard" key={'selection-' + id}>
        <div className="datacard--header">
          {name}{/* [{costsValues.points} points / {costsValues.powerLevel}PL]*/}
        </div>
        <div className="datacard--body">
          {orderedSectionsJSX}
        </div>
      </div>
    )
  }
}

export default SelectionView;