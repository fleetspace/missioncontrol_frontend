import React, { Component } from 'react'

import PropTypes from 'prop-types'
import Select from 'react-select'
import IconButton from '@material-ui/core/IconButton'
import { Button, Typography } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import ErrorIcon from '@material-ui/icons/Error'
import Chip from '@material-ui/core/Chip'

class SelectedRowToolbar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            script: "",
        }
    }

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
        onAddPasses(accessIds, this.state.script.value)
    }

    handleScriptChange = (selected) => {
        this.setState({
            script: selected
        })
    }

    getEditableRows = () => {
        const { selectedRows, displayData, columnIndexes } = this.props

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

    getDeleteableRows = () => {
        const { selectedRows, displayData, columnIndexes } = this.props

        const newSelectedRows = []
        for (const row of selectedRows.data) {
            const data = displayData[row.index].data
            const readOnly = data[columnIndexes.get('_passes_read_only')]
            if (readOnly === 'false') {
                newSelectedRows.push(row.index)
            }
        }
        return newSelectedRows
    }

    handleRemoveInvalid = () => {
        const { setSelectedRows } = this.props
        setSelectedRows(this.getEditableRows())
    }

    errors = () => {
        const { selectedRows } = this.props
        if (this.getEditableRows().length < selectedRows.data.length) {
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

    deleteButton = (disabled) => {
        const { selectedRows } = this.props
        if (this.getDeleteableRows().length < selectedRows.data.length) {
            return (
                <Tooltip title={"Cannot delete readonly passes"}>
                    <div>
                        <IconButton aria-label="Delete passes" disabled={true}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </Tooltip>
            )
        } else {
            return (
                <Tooltip title={"Delete passes from accesses"}>
                    <div>
                        <IconButton onClick={this.handleCancelPasses} aria-label="Delete passes" disabled={disabled}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </Tooltip>
            )
        }
    }

    render() {
        const { taskStacks } = this.props

        const taskStackOptions = taskStacks.map(taskStack => {
            return {
                label: taskStack.name,
                value: taskStack.uuid,
            }
        })

        const errors = this.errors()
        const disabled = errors !== null

        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 20 }}>
                <Typography>Override task-stack:</Typography>
                {errors ||

                    <div style={{ flex: 1, position: 'relative' }}>
                        <Select
                            options={taskStackOptions}
                            value={this.state.script}
                            onChange={this.handleScriptChange}
                            placeholder="Script to run during passes"
                            isClearable
                            isSearchable
                        />
                    </div>
                }
                <Tooltip title={"Add / update passes from access"}>
                    <div>
                        <IconButton onClick={this.handleAddPasses} aria-label="Add / update passes from accesses" disabled={disabled}>
                            <AddIcon />
                        </IconButton>
                    </div>
                </Tooltip>


                {this.deleteButton(disabled)}
            </div>
        )
    }
}

SelectedRowToolbar.propTypes = {
    columnIndexes: PropTypes.object.isRequired,
    onAddPasses: PropTypes.func.isRequired,
    onCancelPasses: PropTypes.func.isRequired,
    taskStacks: PropTypes.arrayOf(PropTypes.shape({
        created: PropTypes.string.isRequired,
        environment: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        tasks: PropTypes.arrayOf(PropTypes.string).isRequired,
        uuid: PropTypes.string.isRequired,
    })).isRequired,
}


export default (SelectedRowToolbar)