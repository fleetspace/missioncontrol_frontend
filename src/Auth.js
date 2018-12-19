import React, { Component } from 'react'

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { REST_API, TOKEN_KEY } from './settings'

class Auth extends Component {
    state = {
        username: '',
        password: '',
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    handleSubmit = () => {
        const { username, password } = this.state
        const headers = {
            Authorization: 'Basic ' + btoa(username + ":" + password),
        }

        fetch(`${REST_API}auth/jwt`, { headers }).then(response => {
            return response.text()
        }).then(text => {
            localStorage[TOKEN_KEY] = text
            this.props.onLogin(text)
        })
    }

    render() {
        return (
            <form noValidate onSubmit={this.handleSubmit}>
                <TextField id="username" label="Username" value={this.state.username}
                    onChange={this.handleChange('username')}
                    autoComplete="username" />
                <TextField id="password" label="Password" value={this.state.password}
                    onChange={this.handleChange('password')} type="password"
                    autoComplete="current-password" />
                <Button onClick={this.handleSubmit} color="primary" variant="contained">Log In</Button>
            </form>
        )
    }
}

export default Auth