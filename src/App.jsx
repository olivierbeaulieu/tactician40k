import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import RosterView from './RosterView';
import RosterUploadView from './RosterUploadView';

// fetch('/wat').then(blob => blob.json()).then(x=>console.log(x));

class AppRouter extends Component {
  render() {
    return (<Router>
      <div>
        <Route exact path="/" component={RosterUploadView} />
        <Route path="/roster" component={RosterView} />
      </div>
    </Router>);
  }
}

export default AppRouter;