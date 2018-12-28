import React, { Component } from 'react';
import { sortByPrimaryCategory, ensureArray } from '../AppHelpers';
import SelectionsView from './SelectionsView';

class Forces extends Component {
  render() {
    const sortedForces = sortByPrimaryCategory(this.props.forces);

    return (
      sortedForces.map(force => <Force force={force} />)
    );
  }
}

class Force extends Component {
  render() {
    const { force } = this.props;
    const selections = ensureArray(force.selections.selection);
    const sortedSelections = sortByPrimaryCategory(selections);
    const selectionsJSX = sortedSelections.map(selection => <SelectionsView selection={selection} />);
    
    return (
      <div>
        <div className="datacard--header">
          {force.name} ({force.catalogueName} v{force.catalogueRevision})
        </div>
            
        {selectionsJSX}
      </div>
    )
  }
}

export default Forces;