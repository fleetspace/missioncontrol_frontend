import React, { Component } from 'react'
import TimelinesChart from 'timelines-chart'

import UserList from './UserList'
import AccessTable from './AccessTable'
import Auth from '../Auth'
import { REST_API, TOKEN_KEY } from '../settings'


// Container
class UserListContainer extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()

        const token = localStorage.getItem(TOKEN_KEY)
        this.state = {
            accesses: [],
            chart: null,
            token,
        }
    }

    loadData = () => {
        if (!this.state.token) {
            return
        }
        const headers = {
            Authorization: `Bearer ${this.state.token}`,
        }
        fetch(`${REST_API}accesses/`, { headers }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw Error(response)
            }
        }).then(json => {
            this.setState({
                accesses: json
            });
        }).catch(error => {
            this.setState({
                accesses: [],
                token: null,
                chart: null,
            })
        })
    }

    onLogin = (token) => {
        this.setState({ token })
        this.loadData()
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
                    {this.state.accesses.length > 0 && <UserList accesses={this.state.accesses} chart={this.state.chart} />}
                </div>
                {this.state.accesses.length > 0 ? <AccessTable accesses={this.state.accesses} /> : <Auth onLogin={this.onLogin} />}
            </div>
        )

    }

}


export default UserListContainer