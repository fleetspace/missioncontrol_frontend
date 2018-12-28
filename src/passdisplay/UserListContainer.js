import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'

import AccessChart from './AccessChart'
import AccessTable from './AccessTable'
import Auth, {getToken} from '../Auth'
import { REST_API, TOKEN_KEY } from '../settings'


// Container
class UserListContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            accesses: [],
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
                    const sleepSeconds = decoded.exp - now - 60 // At least 60 seconds before it expires
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
                <AccessChart accesses={this.state.accesses} />
                {this.state.token ? <AccessTable accesses={this.state.accesses} /> : <Auth onLogin={this.onLogin} />}
            </div>
        )

    }

}


export default UserListContainer