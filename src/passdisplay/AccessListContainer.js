import React, { Component } from 'react'
import TimelinesChart from 'timelines-chart'
import jwt_decode from 'jwt-decode'
import uuidv4 from 'uuid/v4'

import UserList from './UserList'
import AccessTable from './AccessTable'
import Auth, { getToken } from '../Auth'
import { REST_API, TOKEN_KEY } from '../settings'


// Container
class AccessListContainer extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()

        this.state = {
            accesses: [],
            passes: [],
            chart: null,
            token: null,
        }
    }

    getHeaders = () => {
        return {
            Authorization: `Bearer ${this.state.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }

    loadData = () => {
        if (!this.state.token) {
            return
        }
        const headers = this.getHeaders()

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

        fetch(`${REST_API}passes/`, { headers }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw Error(response)
            }
        }).then(json => {
            this.setState({
                passes: json
            });
        }).catch(error => {
            this.setState({
                passes: [],
                token: null,
            })
        })
    }

    onLogin = (token) => {
        this.setState({ token })
        this.loadData()
    }

    onAddPasses = (accessIds) => {
        console.debug("Adding passes: ", accessIds)
        // Generate a UUID for the pass
        for (const access_id of accessIds) {
            const body = {
                access_id,
            }

            const uuid = uuidv4()
            fetch(`${REST_API}passes/${uuid}/`, {
                headers: this.getHeaders(),
                method: 'PUT',
                body: JSON.stringify(body),
            }).then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw Error(response)
                }
            }).then(json => {
                this.setState(prevState => {
                    const passes = [
                        ...prevState.passes,
                        json,
                    ]
                    return { passes }
                })
            })
        }
    }

    onCancelPasses = (accessIds) => {
        console.log("Cancelling passes", accessIds)
        const passesByAccess = new Map()
        for (const pass of this.state.passes) {
            if (passesByAccess.has(pass.access_id)) {
                passesByAccess.get(pass.access_id).push(pass)
            } else {
                passesByAccess.set(pass.access_id, [pass])
            }
        }

        for (const accessId of accessIds) {
            // Find the relevant passes
            for (const pass of passesByAccess.get(accessId)) {
                const body = {is_desired: false}
                fetch(`${REST_API}passes/${pass.uuid}/`, {
                    headers: this.getHeaders(),
                    method: 'PATCH',
                    body: JSON.stringify(body),
                }).then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw Error(response)
                    }
                }).then(json => {
                    this.setState(prevState => {
                        const passes = prevState.passes.filter(x => x.uuid !== pass.uuid)
                        return { passes }
                    })
                })
            }
        }
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
                {this.state.token ? <AccessTable
                    accesses={this.state.accesses}
                    passes={this.state.passes}
                    onCancelPasses={this.onCancelPasses}
                    onAddPasses={this.onAddPasses}
                /> : <Auth onLogin={this.onLogin} />}
            </div>
        )

    }

}


export default AccessListContainer