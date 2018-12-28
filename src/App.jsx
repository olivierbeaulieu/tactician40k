import React, { Component } from 'react';
import './App.css';

// import data from './RosterData';
import data from './RosterDataDarkAngels';
import RosterView from './RosterView';

import {
  arrayToObj,
  ensureArray,
} from './AppHelpers';

// fetch('/wat').then(blob => blob.json()).then(x=>console.log(x));

class App extends Component {
  render() {
    return <RosterView data={data} />
  }
}

export default App;