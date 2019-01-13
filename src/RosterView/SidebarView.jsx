// @flow
import React, { Component } from 'react';
import type { Costs, Force } from '../Types';

type Props = {
  forces: Force[],
  costs: Costs,
  rosterName: string
};

class SidebarView extends Component<Props> {
  render() {
    const menuItems = [];

    this.props.forces.forEach(force => {
      force.selections.forEach(selection => {
        menuItems.push(<li key={selection.id}>
          <a href={'#datacard-' + selection.id}>{selection.name}</a>
        </li>);
      });
    });
    
    return (
      <div className="roster--sidebar">
        <div className="logo">
          <i className="fas fa-dice-d6"></i>
          Tactician
        </div>

        <a className="sidebar--back-button" href="/"><i className="fas fa-chevron-left"></i> Back</a>

        <div className="sidebar--title">{this.props.rosterName}</div>
        <div className="sidebar--subtitle">{this.props.costs.points} points - {this.props.costs.powerLevel} PL</div>
        <ul className="sidebar--menu">{menuItems}</ul>
      </div>
    );
  }
}

export default SidebarView;