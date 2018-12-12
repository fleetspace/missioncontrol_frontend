import React, { Component } from 'react'
import TimelinesChart from 'timelines-chart'

import UserList from './UserList'
import AccessTable from './AccessTable'

var REST_API = '/api/v0/accesses/';

// Container
class UserListContainer extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()


        this.state = {
            accesses: [],
            chart: null,
        }
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
        const chart = TimelinesChart()

        chart.zScaleLabel('My Scale Units')
            .zQualitative(true)
            .timeFormat("%Y-%m-%dT%H:%M:%S.%LZ")
            .useUtc(true)

        chart(this.myRef.current)

        this.setState({ chart: chart })

        setInterval(() => {
            this.loadData();
        }, 300000)
        this.loadData();
    }

    render() {
        return (
            <div>
                <div ref={this.myRef}>
                    {this.state.chart && <UserList accesses={this.state.accesses} chart={this.state.chart} />}

                </div>
                <AccessTable accesses={this.state.accesses} />
            </div>
        )
    }

}


export default UserListContainer