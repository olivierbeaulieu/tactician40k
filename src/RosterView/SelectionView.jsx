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
import type { Selection, Profile } from '../Types';

type Props = {
  selection: Selection
};

class SelectionView extends Component<Props> {
  render() {
    const selection = this.props.selection;
    const id = selection.id;
    const name = selection.name;
    
    const subselections = selection.selections;
    const { categories, rules, profiles } = selection;

    const categoriesListString = categories.map(category => category.name).join(', ');

    // console.log('Selection:', name, this.props.selection);

    const jsxSectionsMap = {};

    // Generate JSX from rules
    if (rules) {
      const rulesTitle = 'Rules';
      const rulesHeader = createTableHeader([rulesTitle, 'Description']);
      const rulesRows = rules.map(rule => createTableRow([rule.name, rule.description]));

      // Add the rules JSX 
      jsxSectionsMap[rulesTitle] = createTable(rulesHeader, rulesRows);
    }

    // Generate JSX from profiles
    const groupedProfiles = _.groupBy(profiles, (profile: Profile) => profile.type);

    _.each(groupedProfiles, (profiles, profileTypeName) => {
      jsxSectionsMap[profileTypeName] = buildTableFromProfilesList(profileTypeName, profiles);
    });

    // Generate JSX from subselections
    if (subselections){
      // Recursively gather all profiles
      function getAllProfiles(node) {  
        const allProfiles = [];
        const { profiles, selections } = node;

        // Add all the top-level profiles to the list
        if (profiles) {
          allProfiles.push(...profiles);
        }

        if (selections) {
          selections.forEach(selection => {
            // Get all profiles from the selection
            allProfiles.push(...getAllProfiles(selection));
          })
        }

        return allProfiles;
      }

      const allProfiles = getAllProfiles(this.props.selection);

       // Build the list of models
      const modelsList = subselections
        .filter(x => x.type === 'model')
        .map(model => {
          const selections = model.selections.map(selection => selection.name).join(', ')
          return createTableRow([`${model.number}x ${model.name}`, selections]);
        });

      if (modelsList.length > 0) {
        jsxSectionsMap['Models'] = createTable(createTableHeader(['Models', 'Selections']), modelsList);
      }

      // Group all profiles by their type
      const profilesGroupedByType = _.groupBy(allProfiles, 'profileTypeName');

      // Iterate on all types
      _.each(profilesGroupedByType, (profiles, profileType) => {
        // Ensure that the same profile doesn't appear multiple times in the same table
        const uniqueProfiles = _.uniqBy(profiles, profile => profile.name);

        // Create tables from the list of profiles
        jsxSectionsMap[profileType] = buildTableFromProfilesList(profileType, uniqueProfiles);
      });
    }

    // Generate JSX from keywords
    const keywordsTitle = 'Keywords';
    jsxSectionsMap[keywordsTitle] = createTable(createTableHeader([keywordsTitle]), [createTableRow([categoriesListString])]);

    // rder all sections to be rendered in the right order, based on config
    const sectionsJSX = [];

    _.sortBy(Object.keys(jsxSectionsMap), key => {
      const index = TABLES_ORDER.indexOf(key.toLowerCase());
      return index >= 0 ? index : 9000;
    })
      .forEach(key => {
        sectionsJSX.push(jsxSectionsMap[key]);
      });

    // Return full datacard JSX
    return (
      <div id={'datacard-' + id} className="datacard" key={'selection-' + id}>
        <div className="datacard--header">
          {name}{/* [{costsValues.points} points / {costsValues.powerLevel}PL]*/}
        </div>
        <div className="datacard--body">
          {sectionsJSX}
        </div>
      </div>
    )
  }
}

export default SelectionView;