import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import { v4 as uuidv4 } from 'uuid';
import TextField from '@material-ui/core/TextField';
import moment from 'moment'


import AccessChart from './AccessChart'
import AccessTable from './AccessTable'
import Auth, { getToken } from '../Auth'
import { REST_API, TOKEN_KEY } from '../settings'



const defaultDuration = moment.duration(5, "days")
const textDateFormat = "YYYY-MM-DDTHH:mm"

// Container
class AccessListContainer extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()

        this.state = {
            pristine: true,
            start: moment.utc(),
            end: moment.utc().add(defaultDuration),
            accesses: [],
            passes: [],
            taskStacks: [],
            groundstations: [],
            satellites: [],
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

    loadAccesses = () => {
        const headers = this.getHeaders()
        fetch(`${REST_API}accesses/?range_start=${this.state.start.toISOString()}&range_end=${this.state.end.toISOString()}&limit=500`, { headers }).then(response => {
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
    }

    loadData = () => {
        if (!this.state.token) {
            return
        }

        const headers = this.getHeaders()

        this.loadAccesses()

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

        fetch(`${REST_API}task-stacks/`, { headers }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw Error(response)
            }
        }).then(json => {
            this.setState({
                taskStacks: json
            });
        }).catch(error => {
            this.setState({
                taskStacks: [],
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

        fetch(`${REST_API}satellites/`, {headers}).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw Error(response)
            }
        }).then(satellites => {
            this.setState({
                satellites,
            })
        }).catch(error => {
            this.setState({
                satellites: [],
                token: null,
            })
        })
    }

    onLogin = (token) => {
        this.setState({ token })
        this.loadData()
    }

    onAddPasses = (accessIds, taskStack) => {
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
                    task_stack: taskStack,
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
            if (this.state.pristine) {
                this.setState({
                    start: moment.utc(),
                    end: moment.utc().add(defaultDuration)
                })
                this.loadData();
            }
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

    handleChangeStart = (event) => {
        this.setState({
            start: moment.utc(event.target.value),
            pristine: false,
        }, this.loadAccesses)
    }

    handleChangeEnd = (event) => {
        this.setState({
            end: moment.utc(event.target.value),
            pristine: false,
        }, this.loadAccesses)
    }

    render() {
        return (
            <div>
                <div>
                    <TextField label="Start" type="datetime-local" defaultValue={this.state.start.format(textDateFormat)} onChange={this.handleChangeStart} />
                    <TextField label="End" type="datetime-local" defaultValue={this.state.end.format(textDateFormat)} onChange={this.handleChangeEnd} />
                </div>
                {<AccessChart accesses={this.state.accesses} />}
                {this.state.token ? <AccessTable
                    accesses={this.state.accesses}
                    passes={this.state.passes}
                    taskStacks={this.state.taskStacks}
                    groundstations={this.state.groundstations}
                    satellites={this.state.satellites}
                    onCancelPasses={this.onCancelPasses}
                    onAddPasses={this.onAddPasses}
                /> : <Auth onLogin={this.onLogin} />}
            </div>
        )

    }

}


export default AccessListContainer
