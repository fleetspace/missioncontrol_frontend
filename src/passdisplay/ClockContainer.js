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
                curTime: new Date().toISOString()
            })
        }, 1000)
    }

    render() {
        return <ClockView utc={this.state.currTime} />
    }
}

export default ClockContainer