import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import About from './components/About';
import Clothing from './components/Clothing';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min';

class App extends Component {
  componentDidMount() {
    document.body.classList.add("body-bg-gray");
    document.body.classList.add("body-border");

    $('[data-toggle="tooltip"]').tooltip();
  }

  render() {
    return(
      <Router>
        <div className="App">
          <Header />
          <div className="container main-content">  
            <Route exact path={["/", "/clothing"]} component={Clothing} />
            <Route path="/about" component={About} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
