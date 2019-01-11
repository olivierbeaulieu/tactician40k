// @flow
import React, { Component } from 'react';
import { parseXmlToJson, jsonToFormattedRoster } from '../AppHelpers';
import type { Roster } from '../Types';
import SidebarView from './SidebarView';
import ForcesView from './ForcesView';

type Props = {};
type State = {
  roster: Roster
}

class RosterView extends Component<Props, State> {
  constructor(props: Object) {
    super(props);

    // Attempt to read the roster data. If not possible, send the user back to the upload page
    const storageData = localStorage.getItem('roster-data');

    if (!storageData) {
      console.log('No storage data found, navigating to upload page')
      window.location.href = '/';
      return;
    }

    const json = parseXmlToJson(storageData);
    const roster: Roster = jsonToFormattedRoster(json);
    console.log('Roster:',roster);
    this.state = {
      roster: roster
    };
  }

  render() {
    // Set page title to the roster name
    // todo Find a better way to fix this type issue than any. Flow has issues with document.querySelector
    (document.querySelector('title'): any).innerHTML = this.state.roster.name;

    return (
      <div className="roster" key={'roster-' + this.state.roster.id}>
        <SidebarView
          rosterName={this.state.roster.name}
          costs={this.state.roster.costs}
          forces={this.state.roster.forces} />
        <div className="roster--body">
          <ForcesView forces={this.state.roster.forces} />
        </div>
      </div>
    );
  }
}

export default RosterView;