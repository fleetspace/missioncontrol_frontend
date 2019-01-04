import React, { Component } from 'react'

import PropTypes from 'prop-types'
import Select from 'react-select'
import IconButton from '@material-ui/core/IconButton'
import { Button } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import ErrorIcon from '@material-ui/icons/Error'

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
        const {scripts} = this.props

        const scriptOptions = scripts.map(script => {
            return {
                label: script,
                value: script,
            }
        })

        const errors = this.errors()
        const disabled = errors !== null
        return (
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {errors || <span>
                    Add pass:
                    <div style={{flex: 1, position: 'relative'}}>
                    <Select
                        options={scriptOptions}
                        value={this.state.script}
                        onChange={this.handleScriptChange}
                        placeholder="Script to run during passes"
                        isClearable
                        isSearchable
                    />
                    </div>
                    </span>}
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
        )
    }
}

SelectedRowToolbar.propTypes = {
    columnIndexes: PropTypes.object.isRequired,
    onAddPasses: PropTypes.func.isRequired,
    onCancelPasses: PropTypes.func.isRequired,
    scripts: PropTypes.arrayOf(PropTypes.string).isRequired,
}


export default (SelectedRowToolbar)