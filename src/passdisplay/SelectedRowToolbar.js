import React, { Component } from 'react'

import PropTypes from 'prop-types'
import Select from 'react-select'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'



class SelectedRowToolbar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            script: "",
        }
    }

    handleCancelPasses = () => {
        const { onCancelPasses, idIndex, selectedRows, displayData } = this.props
        const selectedIndexes = selectedRows.data.map(x => x.index)
        const accessIds = displayData.map(x => x.data[idIndex]).filter(
            (_, index) => selectedIndexes.indexOf(index) >= 0)
        onCancelPasses(accessIds)

    }

    handleAddPasses = (...args) => {
        console.log(this.props)
        const { onAddPasses, idIndex, selectedRows, displayData } = this.props
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

    render() {
        const {scripts} = this.props

        const scriptOptions = scripts.map(script => {
            return {
                label: script,
                value: script,
            }
        })

        return (
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                <Tooltip title={"Add passes from access"}>
                    <IconButton onClick={this.handleAddPasses} aria-label="Add passes from accesses">
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title={"Delete passes from accesses"}>
                    <IconButton onClick={this.handleCancelPasses} aria-label="Delete passes">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </div>
        )
    }
}

SelectedRowToolbar.propTypes = {
    idIndex: PropTypes.number.isRequired,
    onAddPasses: PropTypes.func.isRequired,
    onCancelPasses: PropTypes.func.isRequired,
    scripts: PropTypes.arrayOf(PropTypes.string).isRequired,
}


export default (SelectedRowToolbar)