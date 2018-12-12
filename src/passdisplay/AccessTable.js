import React, { Component } from 'react'
import moment from 'moment'
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

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

const AccessTable = (props) => {
    const { classes } = props

    const rows = props.accesses.map(access => {
        const start_time = moment(access.start_time)
        const end_time = moment(access.end_time)

        return (
            <TableRow key={access.id}>
                <TableCell>{access.id}</TableCell>
                <TableCell>{access.groundstation}</TableCell>
                <TableCell>{access.satellite}</TableCell>
                <TableCell>{start_time.toISOString()}</TableCell>
                <TableCell>{end_time.toISOString()}</TableCell>
                <TableCell>{start_time.toISOString(true)}</TableCell>
                <TableCell>{end_time.toISOString(true)}</TableCell>
                <TableCell>{access.max_alt}</TableCell>
            </TableRow>
        )
    })
    return (
        <Paper className={classes.root}>
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

export default withStyles(styles)(AccessTable)