import React, { Component } from 'react'

import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';




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
        onAddPasses(accessIds)
    }

    render() {
        return (
            <MuiThemeProvider theme={getMuiTheme()}>
                <div>
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
            </MuiThemeProvider>
        )
    }
}

SelectedRowToolbar.propTypes = {
    idIndex: PropTypes.number.isRequired,
    onAddPasses: PropTypes.func.isRequired,
    onCancelPasses: PropTypes.func.isRequired,
}


export default (SelectedRowToolbar)