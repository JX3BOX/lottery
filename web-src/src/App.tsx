import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Home from "./page/home"
import Lottery from "./page/lottery"
function App() {
  return (
    <Router>
      <Route path="/" component={Home}></Route>
      <Route path="/lottery" component={Lottery}></Route>
    </Router>
  );
}

export default App;
