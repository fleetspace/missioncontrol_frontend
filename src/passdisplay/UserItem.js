import React from 'react'

var UserItem = function UserItem(access, index) {
    return (
        React.createElement('li', {
            key: index
        },
            React.createElement('div', {
                className: 'header'
            },

                React.createElement('div', {
                    className: 'name'
                }, ' ', access.groundstation),

                React.createElement('div', {
                    className: 'name'
                }, ' ', access.satellite),

                React.createElement('div', {
                    className: 'name'
                }, ' ', access.start_time),

                React.createElement('div', {
                    className: 'name'
                }, ' ', access.end_time),

                React.createElement('span', null, access.max_alt),
            )
        )
    );
};

export default UserItem