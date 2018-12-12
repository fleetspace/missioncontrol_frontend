import React, { Component } from 'react'
import ClockView from './ClockView'


class ClockContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            utc: new Date().toISOString()
        }
    }

    componentDidMount() {
        // Data is loaded async, therefore will be inserted after first DOM rendering
        setInterval(() => {
            this.setState({
                utc: new Date().toISOString()
            })
            // Add random here so the clock looks a bit more ... well ... random
        }, 100 + Math.random() * 10)
    }

    render() {
        return <ClockView utc={this.state.utc} />
    }
}

export default ClockContainer