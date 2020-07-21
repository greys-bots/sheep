import React, {Fragment as Frag} from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import './App.css';

import Home from './pages/home';
import DocsHome from './pages/docs/docs-home';
import DashHome from './pages/dashboard/dash-home';
import NotFound from './pages/notfound';
import Generator from './pages/generator';

function App() {
  return (
    <div className="App">
      <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/docs" component={DocsHome} />
        <Route path="/dash" component={DashHome} />
        <Route path="/gen" component={Generator} />
        <Route component={NotFound} />
      </Switch>
      </Router>
    </div>
  );
}

export default App;
