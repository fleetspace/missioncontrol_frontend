import React, { Component } from 'react'
import moment from 'moment'
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';


const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
});

class AccessTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isoformat: false
        }
    }

    toggleIsoFormat = () => {
        this.setState((prevState) => {
            return { isoformat: !prevState.isoformat }
        })
    }

    render() {
        const { classes, accesses } = this.props
        const { isoformat } = this.state

        const rows = accesses.map(access => {
            const start_time = moment(access.start_time)
            const end_time = moment(access.end_time)

            let start_time_utc, end_time_utc, start_time_local, end_time_local
            if (isoformat) {
                start_time_utc = start_time.toISOString()
                end_time_utc = end_time.toISOString()
                start_time_local = start_time.toISOString(true)
                end_time_local = end_time.toISOString(true)
            } else {
                const dateFormat = "L LTS ZZ"
                start_time_utc = start_time.format(dateFormat, { timeZone: 'UTC' })
                end_time_utc = end_time.format(dateFormat, { timeZone: 'UTC' })
                start_time_local = start_time.format(dateFormat)
                end_time_local = end_time.format(dateFormat)
            }

            return (
                <TableRow key={access.id}>
                    <TableCell>{access.id}</TableCell>
                    <TableCell>{access.groundstation}</TableCell>
                    <TableCell>{access.satellite}</TableCell>
                    <TableCell>{start_time_utc}</TableCell>
                    <TableCell>{end_time_utc}</TableCell>
                    <TableCell>{start_time_local}</TableCell>
                    <TableCell>{end_time_local}</TableCell>
                    <TableCell>{access.max_alt}</TableCell>
                </TableRow>
            )
        })
        return (
            <Paper className={classes.root}>
                <FormControlLabel
                    control={
                        <Switch checked={this.state.isoformat} onChange={this.toggleIsoFormat} />
                    }
                    label="Use ISO8601 time formats"
                />
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Ground Station</TableCell>
                            <TableCell>Satellite</TableCell>
                            <TableCell>UTC start</TableCell>
                            <TableCell>UTC end</TableCell>
                            <TableCell>Local start</TableCell>
                            <TableCell>Local end</TableCell>
                            <TableCell>Max altitude</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}

export default withStyles(styles)(AccessTable)