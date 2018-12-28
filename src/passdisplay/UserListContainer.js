import React, { Component } from 'react'
import TimelinesChart from 'timelines-chart'
import jwt_decode from 'jwt-decode'

import UserList from './UserList'
import AccessTable from './AccessTable'
import Auth, {getToken} from '../Auth'
import { REST_API, TOKEN_KEY } from '../settings'


// Container
class UserListContainer extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()

        this.state = {
            accesses: [],
            chart: null,
            token: null,
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
            })
        })
    }

    onLogin = (token) => {
        this.setState({ token })
        this.loadData()
    }

    componentDidMount() {
        const token = localStorage.getItem(TOKEN_KEY)

        const chart = TimelinesChart()

        chart.zScaleLabel('My Scale Units')
            .zQualitative(true)
            .timeFormat("%Y-%m-%dT%H:%M:%S.%LZ")
            .useUtc(true)

        chart(this.myRef.current)

        this.setState({ chart, token })

        setInterval(() => {
            this.loadData();
        }, 300000)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.token !== this.state.token) {
            // Set up a timer to refresh it
            let decoded = null
            try {
                decoded = jwt_decode(this.state.token)
            } catch {
                console.log("Couldn't decode....")
            }

            if (decoded !== null) {
                const now = Math.floor(Date.now() / 1000)
                if (decoded.exp > now) {
                    // At least 60 seconds before it expires, but not in the past
                    const sleepSeconds = Math.max(decoded.exp - now - 60, 0)
                    setTimeout(() => {
                        const headers = {
                            Authorization: `Bearer ${this.state.token}`,
                        }
                        getToken(headers, this.onLogin)
                    }, sleepSeconds * 1000)
                }
            }

            this.loadData()
        }
    }

    render() {
        return (
            <div>
                <div ref={this.myRef}>
                    <UserList accesses={this.state.accesses} chart={this.state.chart} />
                </div>
                {this.state.token ? <AccessTable accesses={this.state.accesses} /> : <Auth onLogin={this.onLogin} />}
            </div>
        )

    }

}


export default UserListContainer