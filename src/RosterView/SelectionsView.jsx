import React, { Component } from 'react';
import _ from 'lodash';
import { TABLES_ORDER } from '../config';
import {
  getSelections,
  getCategories,
  getRules,
  buildTableFromProfilesList,
  getProfiles,
  createTableHeader,
  createTableRow,
  createTable
} from '../AppHelpers';

class SelectionsView extends Component {
  render() {
    const selection = this.props.selection;
    const { name, entryId } = this.props.selection;
    
    const selections = getSelections(selection);
    const categories = getCategories(selection);
    const rules = getRules(selection);
    // const costs = getCosts(selection);
    const profiles = getProfiles(selection);

    const categoriesListString = categories.map(category => category.name).join(', ');
    // const costsValues = getPointsFromElement(costs);

    console.log(`===${name}===`);
    // console.log(this.props.selection);

    const jsxSectionsMap = {};

    // Generate JSX from rules
    if (rules) {
      const rulesTitle = 'Rules';
      const rulesHeader = createTableHeader([rulesTitle, 'Description']);
      const rulesRows = rules.map(rule => {
        return createTableRow([rule.name, rule.description]);
      });

      // Add the rules JSX 
      jsxSectionsMap[rulesTitle] = createTable(rulesHeader, rulesRows);
    }

    // Generate JSX from profiles
    if (profiles) {
      const groupedProfiles = _.groupBy(profiles, profile => profile.profileTypeName);

      _.each(groupedProfiles, (profiles, profileTypeName) => {
        jsxSectionsMap[profileTypeName] = buildTableFromProfilesList(profileTypeName, profiles);
      });
    }

    // Generate JSX from selections
    if (selections){
      // Recursively gather all profiles
      function getAllProfiles(node) {  
        const allProfiles = [];
        const profiles = getProfiles(node);
        const selections = getSelections(node);

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
      const modelsList = selections
        .filter(x => x.type === 'model')
        .map(model => {
          const selections = getSelections(model)
            .map(selection => selection.name)
            .join(', ')

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

    // // Generate JSX from keywords
    const keywordsTitle = 'Keywords';
    jsxSectionsMap[keywordsTitle] = createTable(createTableHeader([keywordsTitle]), createTableRow([categoriesListString]));

    // // Order all sections to be rendered in the right order, based on config
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
      <div id={'datacard-' + entryId} className="datacard" key={'selection-' + entryId}>
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

export default SelectionsView;