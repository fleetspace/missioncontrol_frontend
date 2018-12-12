import React, { Component } from 'react'
import moment from 'moment'

class AccessTable extends Component {

    render() {
        const rows = this.props.accesses.map(access => {
            const start_time = moment(access.start_time)
            const end_time = moment(access.end_time)

            return (
                <tr key={access.id}>
                    <td>{access.id}</td>
                    <td>{access.groundstation}</td>
                    <td>{access.satellite}</td>
                    <td>{start_time.toISOString()}</td>
                    <td>{end_time.toISOString()}</td>
                    <td>{start_time.toISOString(true)}</td>
                    <td>{end_time.toISOString(true)}</td>
                    <td>{access.max_alt}</td>
                </tr>
            )
        })
        console.log(this.props.accesses)
        return (
            <table>
                <tr>
                    <th>ID</th>
                    <th>Ground Station</th>
                    <th>Satellite</th>
                    <th>UTC start</th>
                    <th>UTC end</th>
                    <th>Local start</th>
                    <th>Local end</th>
                    <th>Max altitude</th>
                </tr>
                {rows}
            </table>
        )
    }
}

export default AccessTable