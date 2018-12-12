import React from 'react'

var ClockView = function ClockView(props) {
    return (
        React.createElement('h1', null, ' ', props.utc)
    );
};

export default ClockView