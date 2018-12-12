import React from 'react'

import ClockContainer from './passdisplay/ClockContainer'
import UserListContainer from './passdisplay/UserListContainer'


// The root component
var App = function App(props) {
  return (
    React.createElement('div', {
      className: 'app'
    },
      React.createElement(ClockContainer, null),
      React.createElement(UserListContainer, null)
    )
  )
};

// Presentation


export default App