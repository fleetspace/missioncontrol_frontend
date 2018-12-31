import React from 'react'
import moment from 'moment'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


const PassRow = (props) => {
    const { passesByAccess, accessColumnIndexes, isoformat, rowData } = props
    // Now add any passes for this access
    const accessId = rowData[accessColumnIndexes.get('id')]

    const passes = passesByAccess.get(accessId) || []

    const headers = []
    if (passes.length > 0) {
        headers.push(...Object.keys(passes[0]))
    }
    const rows = []
    for (const pass of passes) {
        const row = []

        const start_time = moment(pass.start_time)
        const end_time = moment(pass.end_time)
        if (isoformat) {
            pass.start_time_utc = start_time.toISOString()
            pass.end_time_utc = end_time.toISOString()
            pass.start_time_local = start_time.toISOString(true)
            pass.end_time_local = end_time.toISOString(true)
        } else {
            const dateFormat = "L LTS ZZ"
            pass.start_time_utc = start_time.clone().utc().format(dateFormat)
            pass.end_time_utc = end_time.clone().utc().format(dateFormat)
            pass.start_time_local = start_time.format(dateFormat)
            pass.end_time_local = end_time.format(dateFormat)
        }

        for (const name of headers) {
            row.push(pass[name])
        }

        rows.push(row)
    }
    return (
        <TableRow>
            <TableCell colSpan={rowData.length}>
                <h2>Passes for this access:</h2>
                <Table>
                    <TableHead>
                        <TableRow>
                            {headers.map(header => {
                                return (
                                    <TableCell key={header}>
                                        {header}
                                    </TableCell>
                                )
                            })}

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                {row.map((data, index) => <TableCell key={index}>
                                    {`${data}`}
                                </TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableCell>
        </TableRow>

    )
}

export default PassRow