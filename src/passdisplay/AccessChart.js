import React from 'react'
import Timeline, {
    TimelineMarkers,
    CustomMarker,
} from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import randomColor from 'randomcolor'

const UserList = (props) => {

    if (props.accesses.size < 1) {
        return null
    }

    const items = []
    let groups = []

    const offset = new Date().getTimezoneOffset()
    const addedSatellites = new Set()
    const groundStationColors = new Map()

    for (const access of props.accesses) {
        const {satellite, groundstation} = access

        if (!addedSatellites.has(satellite)) {
            groups.push({
                id: satellite, title: satellite
            })
            addedSatellites.add(satellite)
        }
        if (!groundStationColors.has(groundstation)) {
            groundStationColors.set(groundstation, randomColor({format: "rgba", luminosity: "light"}))
        }

        items.push({
            id: access.id,
            group: satellite,
            title: `${access.start_time} -> ${access.end_time}`,
            start_time: moment(access.start_time).add(offset, 'minute').valueOf(),
            end_time: moment(access.end_time).add(offset, 'minute').valueOf(),
            itemProps: {
                style: {
                    background: groundStationColors.get(groundstation),
                },
            }


        })
    }

    if (addedSatellites.size < 1) {
        return null
    }

    return (
        <div>
            <Timeline
                sidebarContent={<div>Accesses</div>}
                groups={groups}
                items={items}
                defaultTimeStart={moment().add(-60 + offset, 'minute')}
                defaultTimeEnd={moment().add(12, 'hour')}
                canMove={false}
                canResize={false}
                canChangeGroup={false}
            >
                <TimelineMarkers>
                    <CustomMarker date={moment().add(offset, 'minute').valueOf()}>
                    {({styles, date}) => {
                        const customStyles = {
                            ...styles,
                            backgroundColor: 'red',
                        }
                        return <div style={customStyles}/>
                    }}
                    </CustomMarker>
                </TimelineMarkers>

            </Timeline>

            <div style={{backgroundColor: "green"}}>Testt</div>

        </div>
    )
}


export default UserList