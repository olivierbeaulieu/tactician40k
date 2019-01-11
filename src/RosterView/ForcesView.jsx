// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import SelectionView from './SelectionView';
import type { Force } from '../Types';

type ForcesProps = {
  forces: Array<Force>
};

class ForcesView extends Component<ForcesProps> {
  render(): Node {
    return (
      this.props.forces.map(force => <ForceView force={force} />)
    );
  }
}

type ForceProps = {
  force: Force
}

class ForceView extends Component<ForceProps> {
  render() {
    const { force } = this.props;
    const selectionsJSX = force.selections.map(selection => <SelectionView selection={selection} />);
    
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

export default ForcesView;