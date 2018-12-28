import React from 'react'

import ClockContainer from './passdisplay/ClockContainer'
import AccessListContainer from './passdisplay/AccessListContainer'


// The root component
var App = function App(props) {
  return (
    <div className="app">
      <ClockContainer />
      <AccessListContainer />
    </div>
  )
};

export default App