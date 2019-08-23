// @flow
import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import RosterView from './RosterView';
import RosterUploadView from './RosterUploadView';
import withTracker from './withTracker';

class AppRouter extends Component<{}> {
  render() {
    return (<Router>
      <div>
        <Route exact path="/" component={withTracker(RosterUploadView)} />
        <Route path="/roster" component={withTracker(RosterView)} />
      </div>
    </Router>);
  }
}

export default AppRouter;