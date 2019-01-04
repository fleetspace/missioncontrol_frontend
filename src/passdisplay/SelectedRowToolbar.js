import React, { Component } from 'react'

import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import ErrorIcon from '@material-ui/icons/Error'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';




const getMuiTheme = () => createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    overrides: {
        MuiButtonBase: {
            root: {
                top: "50%",
                display: "inline-block",
                position: "relative",
                transform: "translateY(-50%)",
            }
        },
    }
})


class SelectedRowToolbar extends Component {
    handleCancelPasses = () => {
        const { onCancelPasses, columnIndexes, selectedRows, displayData } = this.props
        const idIndex = columnIndexes.get('id')
        const selectedIndexes = selectedRows.data.map(x => x.index)
        const accessIds = displayData.map(x => x.data[idIndex]).filter(
            (_, index) => selectedIndexes.indexOf(index) >= 0)
        onCancelPasses(accessIds)

    }

    handleAddPasses = (...args) => {
        const { onAddPasses, columnIndexes, selectedRows, displayData } = this.props
        const idIndex = columnIndexes.get('id')
        const selectedIndexes = selectedRows.data.map(x => x.index)
        const accessIds = displayData.map(x => x.data[idIndex]).filter(
            (_, index) => selectedIndexes.indexOf(index) >= 0)
        onAddPasses(accessIds)
    }

    getValidRows = () => {
        const { selectedRows, displayData, columnIndexes } = this.props

        console.log(this.props)
        const newSelectedRows = []
        for (const row of selectedRows.data) {
            const data = displayData[row.index].data
            const readOnly = data[columnIndexes.get('_passes_read_only')]
            const scheduled = data[columnIndexes.get('scheduled')] !== ''
            if (readOnly === 'false' || scheduled) {
                newSelectedRows.push(row.index)
            }
        }
        return newSelectedRows
    }

    handleRemoveInvalid = () => {
        const { setSelectedRows } = this.props
        setSelectedRows(this.getValidRows())
    }

    errors = () => {
        const { selectedRows } = this.props
        if (this.getValidRows().length < selectedRows.data.length) {
            return (
                <Tooltip title={"Some selected accesses are managed externally and cannot be scheduled here"}>
                    <Button onClick={this.handleRemoveInvalid}>
                        <ErrorIcon />
                        Deselect read only accesses
                </Button>
                </Tooltip>
            )
        }
        return null
    }

    render() {
        const errors = this.errors()
        const disabled = errors !== null
        return (
            <MuiThemeProvider theme={getMuiTheme()}>
                <div>
                    {errors}
                    <Tooltip title={"Add passes from access"}>
                        <IconButton onClick={this.handleAddPasses} aria-label="Add passes from accesses" disabled={disabled}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={"Delete passes from accesses"}>
                        <IconButton onClick={this.handleCancelPasses} aria-label="Delete passes" disabled={disabled}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </MuiThemeProvider>
        )
    }
}

SelectedRowToolbar.propTypes = {
    columnIndexes: PropTypes.object.isRequired,
    onAddPasses: PropTypes.func.isRequired,
    onCancelPasses: PropTypes.func.isRequired,
}


export default (SelectedRowToolbar)