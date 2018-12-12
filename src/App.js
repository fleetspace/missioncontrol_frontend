import React from 'react'

import ClockContainer from './passdisplay/ClockContainer'
import UserListContainer from './passdisplay/UserListContainer'


// The root component
var App = function App(props) {
  return (
    <div className="app">
      <ClockContainer />
      <UserListContainer />
    </div>
  )
};

export default App