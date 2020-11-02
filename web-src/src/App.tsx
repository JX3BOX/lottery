import React from 'react';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom'
import Home from "./page/Home"
import Lottery from "./page/Lottery"
export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Route path="/home" component={Home}></Route>
        <Route path="/lottery/:settingId" component={Lottery} exact></Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>

      </Router>
    );
  }

}

