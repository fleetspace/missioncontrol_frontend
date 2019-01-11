import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import uuidv4 from 'uuid/v4'

import AccessChart from './AccessChart'
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
            scripts: [],
            groundstations: [],
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

        // Go at least 5 days forward
        const end_date = new Date()
        end_date.setDate(end_date.getDate() + 5)

        const headers = this.getHeaders()

        fetch(`${REST_API}accesses/?range_end=${end_date.toISOString()}&limit=500`, { headers }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw Error(response)
            }
        }).then(json => {
            this.setState({
                accesses: json
            })
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

        fetch(`${REST_API}passscripts/`, { headers }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw Error(response)
            }
        }).then(json => {
            this.setState({
                scripts: json
            });
        }).catch(error => {
            this.setState({
                scripts: [],
                token: null,
            })
        })

        fetch(`${REST_API}groundstations/`, { headers }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw Error(response)
            }
        }).then(json => {
            this.setState({
                groundstations: json
            });
        }).catch(error => {
            this.setState({
                groundstations: [],
                token: null,
            })
        })
    }

    onLogin = (token) => {
        this.setState({ token })
        this.loadData()
    }

    onAddPasses = (accessIds, script) => {
        const passesByAccess = new Map()
        for (const pass of this.state.passes) {
            if (passesByAccess.has(pass.access_id)) {
                passesByAccess.get(pass.access_id).push(pass)
            } else {
                passesByAccess.set(pass.access_id, [pass])
            }
        }

        // Generate a UUID for the pass
        for (const access_id of accessIds) {
            let uuids = []

            // Check if we have a pass for this access already,
            // update it if so
            if (passesByAccess.has(access_id)) {
                const passes = passesByAccess.get(access_id)
                uuids = passes.map(pass => pass.uuid)

            } else {
                uuids = [uuidv4()]
            }

            for (const uuid of uuids) {
                const body = {
                    access_id,
                    script,
                }

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
                        // Remove the old pass
                        const passes = []
                        for (const pass of prevState.passes) {
                            if (pass.uuid === uuid) {
                                continue
                            }
                            passes.push(pass)
                        }
                        passes.push(json)
                        return { passes }
                    })
                })
            }

        }
    }

    onCancelPasses = (accessIds) => {
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

        this.setState({ token })

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
                {<AccessChart accesses={this.state.accesses} />}
                {this.state.token ? <AccessTable
                    accesses={this.state.accesses}
                    passes={this.state.passes}
                    scripts={this.state.scripts}
                    groundstations={this.state.groundstations}
                    onCancelPasses={this.onCancelPasses}
                    onAddPasses={this.onAddPasses}
                /> : <Auth onLogin={this.onLogin} />}
            </div>
        )

    }

}


export default AccessListContainer