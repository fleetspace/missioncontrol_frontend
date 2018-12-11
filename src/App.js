import React from 'react'
import TimelinesChart from 'timelines-chart'

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var REST_API = 'http://192.168.88.234:8877/api/v0/accesses/';

// The root component
var App = function App(props) {
  return (
    React.createElement('div', {
      className: 'app'
    },
      React.createElement(ClockContainer, null),
      React.createElement(UserListContainer, null)
    )
  )
};

// Clock
var ClockContainer = function (_React$Component) {
  _inherits(ClockContainer, _React$Component);

  function ClockContainer(props) {
    _classCallCheck(this, ClockContainer);
    var _this = _possibleConstructorReturn(this, (ClockContainer.__proto__ || Object.getPrototypeOf(ClockContainer)).call(this,
      props));
    _this.state = {
      utc: new Date().toISOString()
    };
    return _this;

  }

  _createClass(ClockContainer, [{
    key: 'loadData',
    value: function loadData() { }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() { }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {

      // Data is loaded async, therefore will be inserted after first DOM rendering
      setInterval(() => {
        this.setState({
          curTime: new Date().toISOString()
        })
      }, 1000)
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(
      nextProps) { }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(
      nextProps, nextState) {
      return true;
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(
      nextProps, nextState) { }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(
      prevProps, prevState) { }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() { }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(ClockView, {
        utc: this.state.curTime
      });
    }
  }]);
  return ClockContainer;
}(React.Component);


// Container
var UserListContainer = function (_React$Component) {
  _inherits(UserListContainer, _React$Component);

  function UserListContainer(props) {
    _classCallCheck(this, UserListContainer);
    var _this = _possibleConstructorReturn(this, (UserListContainer.__proto__ || Object.getPrototypeOf(UserListContainer)).call(this,
      props));
    _this.state = {
      accesses: [],
    };
    return _this;


  }
  _createClass(UserListContainer, [{
    key: 'loadData',
    value: function loadData() {
      var _this2 = this;
      fetch(REST_API, { mode: "no-cors" }).then(response => {
        console.log(response.body)
        return response.json()
      }).then(json => {
        console.log(json);
        _this2.setState({
          accesses: json.data
        });
      });
    }

    // Life cycles hooks
    // facebook.github.io/react/docs/component-specs.html
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var tchart = TimelinesChart()(document.body)
        .zScaleLabel('My Scale Units')
        .zQualitative(true)
        .timeFormat("%Y-%m-%dT%H:%M:%S.%LZ")
        .useUtc(true)

      this.setState({ chart: tchart })
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Data is loaded async, therefore will be inserted after first DOM rendering
      setInterval(() => {
        this.loadData();
      }, 300000)
      this.loadData();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(
      nextProps) { }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(
      nextProps, nextState) {
      return true;
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(
      nextProps, nextState) { }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(
      prevProps, prevState) { }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() { }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(UserList, {
        accesses: this.state.accesses,
        chart: this.state.chart
      });
    }
  }]);
  return UserListContainer;
}(React.Component);


// Presentation
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


var ClockView = function ClockView(props) {
  return (
    React.createElement('h1', null, ' ', props.utc)
  );
};

var UserList = function UserList(props) {
  console.log(props)
  var data = []
  var satellites = []
  if (props.accesses) {
    satellites = props.accesses.map(p => p.satellite)
  }
  var by_satellites = new Map(Array.prototype.map.call(satellites, function (s) { return [s, []] }))
  for (const p of props.accesses) {
    by_satellites.get(p.satellite).push(p)
  }

  var res = []
  for (var [sat, sat_accesses] of by_satellites) {
    var labels = []
    var by_gs = new Map(Array.prototype.map.call(sat_accesses, function (s) { return [s.groundstation, []] }))
    console.log(by_gs)
    for (const p of sat_accesses) {
      console.log(p)
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
  return (
    React.createElement('div', {
      className: 'access-list'
    })
  );
};

export default App