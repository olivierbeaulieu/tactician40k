import React, { Component } from 'react';
import { sortByPrimaryCategory, ensureArray } from '../AppHelpers';

class SidebarView extends Component {
  render() {
    const menuItems = [];

    this.props.forces.forEach(force => {
      const selections = ensureArray(force.selections.selection);
      const sortedSelections = sortByPrimaryCategory(selections);

      sortedSelections.forEach(selection => {
        menuItems.push(<li key={selection.id}>
          <a href={'#datacard-' + selection.id}>{selection.name}</a>
        </li>);
      });
    });
    
    return (
      <div className="roster--sidebar">
        <div className="sidebar--title">{this.props.rosterName}</div>
        <div className="sidebar--subtitle">{this.props.pointsValue} points - {this.props.powerLevel} PL</div>
        <ul className="sidebar--menu">{menuItems}</ul>
      </div>
    );
  }
}

export default SidebarView;