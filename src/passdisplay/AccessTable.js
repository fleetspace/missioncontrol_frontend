import React, { Component } from 'react'
import moment from 'moment'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MUIDataTable from 'mui-datatables'
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare'

import PassRow from './PassRow';
import SelectedRowToolbar from './SelectedRowToolbar'


class AccessTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isoformat: false,
            timezoneOffset: new Date().getTimezoneOffset(),
        }
    }

    toggleIsoFormat = () => {
        this.setState(({isoformat}) => {
            return { isoformat: !isoformat }
        })
    }

    getMuiTheme = () => createMuiTheme({
        typography: {
            useNextVariants: true,
        },
        overrides: {
            MuiTableCell: {
                root: {
                    paddingRight: 10,
                    paddingLeft: 10,
                }
            },
            MUIDataTable: {
                responsiveScroll: {
                    maxHeight: 'inherit',
                },
            },
        },
    })

    shouldComponentUpdate(nextProps, nextState) {
        // Do a deep compare for this.
        // Not the best, but works for now - will need to migrate to
        // redux or similar if it becomes an issue.
        return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState)
    }

    render() {
        const { accesses, passes, scripts, groundstations } = this.props
        const { isoformat } = this.state

        if (accesses.length < 1) {
            return null
        }

        const access_columns = new Set(Object.keys(accesses[0]))

        // Remove start_time end_time as we calculate the UTC and local separately
        for (const col of ["start_time", "end_time"]) {
            access_columns.delete(col)
        }

        const columns_set = new Set([
            "scheduled",
            "script",
            ...access_columns,
            "start_time_utc",
            "end_time_utc",
            "start_time_local",
            "end_time_local",
            "_passes_read_only",
        ])

        const columns = []
        for (const column of columns_set) {
            let filter = false
            let display = 'true'
            let hint = undefined
            let customBodyRender = undefined

            if (column.startsWith("_")) {
                display = 'excluded'
            }

            if (['id', 'source_tle', 'access_id', 'external_id', 'uuid', 'is_valid', 'scheduled_on_sat'].indexOf(column) >= 0) {
                display = 'false'
            }

            if (['groundstation', 'satellite', 'scheduled'].indexOf(column) >= 0) {
                filter = true
            }

            if (['is_desired', 'is_valid', 'scheduled_on_gs', 'scheduled_on_sat'].indexOf(column) >= 0) {
                customBodyRender = (value) => {
                    return value ? 'Y' : ""
                }
            }

            // If current itmezone is UTC, no need to show local times
            if (this.state.timezoneOffset === 0) {
                if (['start_time_local', 'end_time_local'].indexOf(column) >= 0) {
                    display = 'false'
                }
            }


            columns.push({
                name: column,
                options: {
                    filter,
                    display,
                    hint,
                    customBodyRender,
                }
            })

        }

        const columnIndexes = new Map()
        for (const [index, { name }] of columns.entries()) {
            columnIndexes.set(name, index)
        }


        const passesByAccess = new Map()
        for (const pass of passes) {
            if (!passesByAccess.has(pass.access_id)) {
                passesByAccess.set(pass.access_id, [pass])
            } else {
                passesByAccess.get(pass.access_id).push(pass)
            }
        }

        const groundstationsByName = new Map()
        for (const groundstation of groundstations) {
            groundstationsByName.set(groundstation.hwid, groundstation)
        }

        const rows = []
        for (const access_initial of accesses) {
            // So we don't modify the props themselves!
            const access = {...access_initial}
            access._passes_read_only = `${groundstationsByName.get(access.groundstation).passes_read_only}`
            const start_time = moment(access.start_time)
            const end_time = moment(access.end_time)

            if (isoformat) {
                access.start_time_utc = start_time.toISOString()
                access.end_time_utc = end_time.toISOString()
                access.start_time_local = start_time.toISOString(true)
                access.end_time_local = end_time.toISOString(true)
            } else {
                const dateFormat = "Y-MM-DD HH:mm:ss ZZ"
                access.start_time_utc = start_time.clone().utc().format(dateFormat)
                access.end_time_utc = end_time.clone().utc().format(dateFormat)
                access.start_time_local = start_time.format(dateFormat)
                access.end_time_local = end_time.format(dateFormat)
            }

            if (passesByAccess.has(access.id)) {
                access.scheduled = "Y"

                const passes = passesByAccess.get(access.id)
                if (passes.length === 1 ) {
                    access.script = passes[0].script
                }
            } else {
                access.scheduled = ""
            }


            const row = []
            for (const col of columns) {
                if (access.hasOwnProperty(col.name)) {
                    row.push(access[col.name])
                } else {
                    row.push("")
                }
            }
            rows.push(row)
        }

        // Add a row for passes with no access ID
        if (passesByAccess.has("")) {
            const row = []
            for (const col of columns) {
                if (col.name === 'scheduled') {
                    row.push("Y")
                } else if (col.name === 'groundstation') {
                    row.push("Passes with no access:")
                } else {
                    row.push("")
                }
            }
            rows.push(row)
        }


        return (
            <Paper>
                <FormControlLabel
                    control={
                        <Switch checked={this.state.isoformat} onChange={this.toggleIsoFormat} />
                    }
                    label="Use ISO8601 time formats"
                />
                <a href="/api/v0/ui/">Access API</a>
                <MuiThemeProvider theme={this.getMuiTheme()}>
                    <MUIDataTable title="Accesses and Passes" data={rows} columns={columns}
                        options={{
                            rowsPerPage: 100,
                            expandableRows: true,
                            padding: 'dense',
                            responsive: 'scroll',
                            renderExpandableRow: (rowData, rowMeta) => <PassRow
                                rowMeta={rowMeta} rowData={rowData} passesByAccess={passesByAccess}
                                accessColumnIndexes={columnIndexes} isoformat={isoformat} />,
                            customToolbarSelect: (selectedRows, displayData, setSelectedRows) => <SelectedRowToolbar
                                selectedRows={selectedRows} displayData={displayData}
                                setSelectedRows={setSelectedRows}
                                onAddPasses={this.props.onAddPasses}
                                onCancelPasses={this.props.onCancelPasses}
                                columnIndexes={columnIndexes}
                                scripts={scripts}
                                />,
                            customSort: (data, index, order) => {
                                const field = columns[index]
                                if (['start_time_utc', 'end_time_utc', 'start_time_local', 'end_time_local'].indexOf(field) >= 0) {
                                    data.sort((left, right) => {
                                        return (moment(left.data[index]).isAfter(right.data[index]) ? 1 : -1) * (order === 'asc' ? 1 : -1)
                                    })
                                } else {
                                    data.sort((left, right) => {
                                        try {
                                            return left.data[index].localeCompare(right.data[index]) * (order === 'asc' ? -1 : 1)
                                        } catch {
                                            return (left.data[index] - right.data[index]) * (order === 'asc' ? -1 : 1)
                                        }

                                    })
                                }
                                return data
                            }
                        }}
                    />
                </MuiThemeProvider>

            </Paper>
        )
    }
}

AccessTable.propTypes = {
    onAddPasses: PropTypes.func.isRequired,
    onCancelPasses: PropTypes.func.isRequired,
    accesses: PropTypes.array.isRequired,
    passes: PropTypes.array.isRequired,
    scripts: PropTypes.array.isRequired,
    groundstations: PropTypes.array.isRequired,
}

export default AccessTable
