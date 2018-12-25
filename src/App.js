import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import data from './XmlData';
import {
  arrayToObj,
  getPointsFromElement,
  getSelectionsFromNode,
  getProfilesFromNode,
  groupElementsByAttr,
  createTableRow,
  createTableHeader,
  createTable
} from './AppHelpers';

window.data = data;

const tablesOrder = ['unit', 'weapon', 'abilities', 'psyker', 'psychic power', 'rules'];

class App extends Component {
  constructor(props) {
    super(props);

    const root = data.elements[0];

    // Convert array to object for easier manipulation
    let { costLimits, costs, forces } = arrayToObj(root.elements, 'name');
    const costsValues = getPointsFromElement(costs);

    this.state = {
      rosterId: root.attributes.id,
      rosterName: root.attributes.name,
      powerLevel: costsValues.powerLevel,
      pointsValue: costsValues.points,
      // costLimits,
      forces,
    };
  }

  render() {
    // Set page title
    document.querySelector('title').innerHTML = this.state.rosterName;

    const forces = this.state.forces.elements.map(x => <Forces force={x} key={'forces-' + x.attributes.entryId} />);

    return (
      <div className="roster" key={'roster-' + this.state.rosterId}>
        <Sidebar forces={this.state.forces}></Sidebar>
        <div className="roster--body">
          <h1>{this.state.rosterName} (Warhammer 40,000 8th Edition) [{this.state.powerLevel} PL, {this.state.pointsValue}pts]</h1>
          {forces}
        </div>
      </div>
    );
  }
}

class Sidebar extends Component {
  render() {
    const menuItems = [];

    this.props.forces.elements.forEach(force => {
      const selections = arrayToObj(force.elements, 'name').selections;
      selections.elements.forEach(selection => {
        menuItems.push(<li>
          <a href={'#datacard-' + selection.attributes.entryId}>{selection.attributes.name}</a>
        </li>);
      });
    });
    
    return (<div className="roster--sidebar"><ul className="sidebar--menu">{menuItems}</ul></div>);
  }
}

class Forces extends Component {
  render() {
    const { force } = this.props;
    const { selections } = arrayToObj(force.elements, 'name');

    // const categoriesJSX = categories.elements.map(x => <div>{x.attributes.name}</div>);
    const selectionsJSX = selections.elements.map(x => <Selection selection={x} />)
    return (
      <div>
        <h2>{force.attributes.name} ({force.attributes.catalogueName} v{force.attributes.catalogueRevision})</h2>
        {selectionsJSX}
      </div>
    )
  }
}

function buildTableFromProfilesList(profileName, profilesList) {
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

class Selection extends Component {
  render() {
    const { attributes, elements } = this.props.selection;
    const { name, entryId } = attributes;
    const { categories, costs, rules, profiles, selections } = arrayToObj(elements, 'name');
    const categoriesListString = categories.elements.map(x => x.attributes.name).join(', ');
    const costsValues = getPointsFromElement(costs);

    console.log(`===${name}===`)

    const jsxSectionsMap = {};

    // Generate JSX from rules
    if (rules.elements) {
      const rulesTitle = 'Rules';
      const rulesHeader = createTableHeader([rulesTitle, 'Description']);
      const rulesRows = rules.elements.map(x => {
        const ruleName = x.attributes.name;
        const ruleDescription = arrayToObj(x.elements, 'name').description.elements[0].text;

        return createTableRow([ruleName, ruleDescription]);
      });

      // Add the rules JSX 
      jsxSectionsMap[rulesTitle] = createTable(rulesHeader, rulesRows);
    }

    // Generate JSX from profiles
    if (profiles.elements) {
      // Group profiles by profileTypeName
      const groupedProfiles = groupElementsByAttr(profiles.elements, 'profileTypeName');

      // Iterate on profiles
      Object.keys(groupedProfiles).forEach(key => {
        jsxSectionsMap[key] = buildTableFromProfilesList(key, groupedProfiles[key]);
      });
    }

    // Generate JSX from selections
    if (selections.elements){
      // Recursively gather all profiles
      function getAllProfiles(node) {  
        const allProfiles = [];
        const profilesNode = getProfilesFromNode(node);
        const selectionsNode = getSelectionsFromNode(node);

        if (profilesNode.elements) {
          allProfiles.push(...profilesNode.elements);
        }

        if (selectionsNode.elements) {
          selectionsNode.elements.forEach(node => {
            allProfiles.push(...getAllProfiles(node));
          })
        }

        return allProfiles;
      }

      const allProfiles = getAllProfiles(this.props.selection);

      // Group all profile by their type
      const profilesGroupedByType = groupElementsByAttr(allProfiles, 'profileTypeName');

      // Iterate on all types
      for (const profileType in profilesGroupedByType) {
        // Ensure that the same profile doesn't appear multiple times in the same table
        const uniqueProfiles = _.uniqBy(profilesGroupedByType[profileType], profiles => profiles.attributes.name);

        
        // Create tables from the list of profiles
        jsxSectionsMap[profileType] = buildTableFromProfilesList(profileType, uniqueProfiles);
      }
    }

    // Generate JSX from keywords
    const keywordsTitle = 'Keywords';
    jsxSectionsMap[keywordsTitle] = createTable(createTableHeader([keywordsTitle]), createTableRow([categoriesListString]));

    // Order all sections to be rendered in the right order, based on config
    const sectionsJSX = [];
    _.sortBy(Object.keys(jsxSectionsMap), key => {
      const index = tablesOrder.indexOf(key.toLowerCase());
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

export default App;
