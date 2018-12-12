import React, { Component } from 'react'
import TimelinesChart from 'timelines-chart'

import UserList from './UserList'

var REST_API = '/api/v0/accesses/';

// Container
class UserListContainer extends Component {
    constructor(props) {
        super(props)
        var tchart = TimelinesChart()(document.body)
            .zScaleLabel('My Scale Units')
            .zQualitative(true)
            .timeFormat("%Y-%m-%dT%H:%M:%S.%LZ")
            .useUtc(true)

        this.state = { accesses: [], chart: tchart }
    }

    loadData = () => {
        fetch(REST_API).then(response => {
            return response.json()
        }).then(json => {
            this.setState({
                accesses: json
            });
        });
    }

    componentDidMount() {
        setInterval(() => {
            this.loadData();
        }, 300000)
        this.loadData();
    }

    render() {
        return <UserList accesses={this.state.accesses} chart={this.state.chart} />
    }

}


export default UserListContainer