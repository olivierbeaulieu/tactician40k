import React, { Component } from 'react';
import { arrayToObj, ensureArray } from '../AppHelpers';
import SidebarView from './SidebarView';
import ForcesView from './ForcesView';

class RosterView extends Component {
  constructor(props) {
    super(props);

    const { roster } = this.props.data;

    // Convert array to object for easier manipulation
    const costs = arrayToObj(roster.costs.cost, 'name');

    this.state = {
      rosterId: roster.id,
      rosterName: roster.name,
      powerLevel: costs.PL.value,
      pointsValue: costs.pts.value,
      // costLimits,
      forces: ensureArray(roster.forces.force),
    };
  }

  render() {
    // Set page title
    document.querySelector('title').innerHTML = this.state.rosterName;

    return (
      <div className="roster" key={'roster-' + this.state.rosterId}>
        <SidebarView
          powerLevel={this.state.powerLevel}
          pointsValue={this.state.pointsValue}
          rosterName={this.state.rosterName}
          forces={this.state.forces} />
        <div className="roster--body">
          {/*<h1>{this.state.rosterName} (Warhammer 40,000 8th Edition) [{this.state.powerLevel} PL, {this.state.pointsValue}pts]</h1>*/}
          <ForcesView forces={this.state.forces} />
        </div>
      </div>
    );
  }
}

export default RosterView;