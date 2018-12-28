import React from 'react'

const UserList = (props) => {
    var satellites = []
    if (!props.accesses || !props.chart) {
        return null
    }
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
                label.data.push(_window)
            }
            labels.push(label)
        }
        const group = { "group": sat, "data": labels }
        res.push(group)
    }
    props.chart.data(res);
    return <div className="access-list"></div>
}


export default UserList