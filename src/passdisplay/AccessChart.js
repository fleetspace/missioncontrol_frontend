import React, { Component } from 'react'

import TimelinesChart from 'timelines-chart'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import moment from 'moment'

class AccessChart extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()
        this.chart = null
        this.state = {
            utc: true,
        }
    }

    componentDidMount() {
        this.renderTimeline()

    }

    componentDidUpdate(prevProps, prevState) {
        this.renderTimeline()
    }

    toggleUTC = () => {
        this.setState(({ utc }) => {
            return { utc: !utc }
        })
    }

    renderTimeline() {
        const props = this.props
        var satellites = []
        let min = new Date()
        let max = new Date()

        satellites = props.accesses.map(p => p.satellite)
        var by_satellites = new Map(Array.prototype.map.call(satellites, function (s) { return [s, []] }))
        for (const p of props.accesses) {
            by_satellites.get(p.satellite).push(p)
        }

        var res = []
        for (var [sat, sat_accesses] of by_satellites) {
            var labels = []
            var by_gs = new Map(Array.prototype.map.call(sat_accesses, function (s) { return [s.groundstation, []] }))
            for (const p of sat_accesses) {
                by_gs.get(p.groundstation).push(p)
            }
            for (var [gs, gs_accesses] of by_gs) {
                var label = { "label": gs, "data": [] }
                for (const acc of gs_accesses) {
                    var _window = {
                        "timeRange": [acc.start_time, acc.end_time],
                        "val": gs
                    }
                    max = Math.max(max, new Date(acc.end_time))
                    min = Math.min(min, new Date(acc.start_time))
                    label.data.push(_window)
                }
                labels.push(label)
            }
            const group = { "group": sat, "data": labels }
            res.push(group)
        }

        if (res.length < 1) {
            return
        }

        min = new Date(min)
        max = new Date(max)

        if (!this.chart) {
            const chart = TimelinesChart()

            chart.zScaleLabel('My Scale Units')
                .zQualitative(true)
                .timeFormat("%Y-%m-%dT%H:%M:%S.%LZ")
                .useUtc(this.state.utc)
                .data(res)(this.myRef.current)
                .overviewDomain([min, max])
                .zoomX([min, max])
            this.chart = chart
        } else {
            this.chart.data(res)
                .overviewDomain([min, max])
                .useUtc(this.state.utc)
                .zoomX([min, max])
        }
        this.chart.dateMarker(moment())
    }

    render() {
        return (
            <div>
                <FormControlLabel
                    control={
                        <Switch checked={this.state.utc} onChange={this.toggleUTC} />
                    }
                    label="Display Timeline in UTC"
                />
                <div ref={this.myRef}></div>
            </div>
        )
    }
}


export default AccessChart
