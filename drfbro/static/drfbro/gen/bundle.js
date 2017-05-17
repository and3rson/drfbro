(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var API = function () {
    function API() {
        _classCallCheck(this, API);

        this.authToken = window.localStorage.DRFBroAuthToken || '';
    }

    _createClass(API, [{
        key: 'getSchema',
        value: function getSchema() {
            var _this = this;

            this.i = 0;
            this.schema = null;
            var headers = {};
            if (this.authToken) {
                headers['Authorization'] = 'Token ' + api.authToken;
            }
            return fetch(window.DRFBroConfig.schema, {
                credentials: 'same-origin',
                headers: headers
            }).then(function (response) {
                return response.json();
            }).then(function (json) {
                return _this.schema = json;
            }).then(function () {
                return console.log(_this.schema);
            });
        }
    }, {
        key: 'getGroups',
        value: function getGroups() {
            return Object.keys(this.schema).filter(function (key) {
                return !key.startsWith('_');
            });
        }
    }, {
        key: 'getChildren',
        value: function getChildren(path) {
            var _this2 = this;

            var children = this.schema;
            console.log('Resolving path', path);
            if (path.split('/').length > 50) return;
            path.split('/').forEach(function (part) {
                return children = children[part];
            });
            return Object.keys(children).map(function (key) {
                var child = children[key];
                if (child._type == 'link') {
                    child.id = 'endpoint' + _this2.i++;
                    return { type: 'endpoint', endpoint: child, id: child.id };
                } else {
                    return { type: 'group', name: path + '/' + key, id: 'group' + _this2.i++ };
                }
            });
        }
    }, {
        key: 'getLoginState',
        value: function getLoginState(username, password) {
            var headers = {};
            if (this.authToken) {
                headers['Authorization'] = 'Token ' + api.authToken;
            }
            return fetch(window.DRFBroConfig.state, {
                method: 'GET',
                credentials: "same-origin",
                headers: headers
            }).then(function (response) {
                return response.json();
            });
        }
    }, {
        key: 'logIn',
        value: function logIn(username, password) {
            var _this3 = this;

            return fetch(window.DRFBroConfig.log_in, {
                method: 'POST',
                credentials: "same-origin",
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                body: 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
            }).then(function (response) {
                return response.json();
            }).then(function (json) {
                if (json.token) {
                    _this3.authToken = json.token;
                    window.localStorage.DRFBroAuthToken = json.token;
                    return true;
                }
                // this.csrfToken = document.cookie.match(/csrftoken=([a-zA-Z0-9]+)/)[1];
                return false;
            });
        }
    }, {
        key: 'logOut',
        value: function logOut(username, password) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.authToken = '';
                window.localStorage.DRFBroAuthToken = '';
                resolve();
            });
        }
    }]);

    return API;
}();

var api = new API();

var app = null;

var SessionBox = function (_React$Component) {
    _inherits(SessionBox, _React$Component);

    function SessionBox(props) {
        _classCallCheck(this, SessionBox);

        var _this5 = _possibleConstructorReturn(this, (SessionBox.__proto__ || Object.getPrototypeOf(SessionBox)).call(this, props));

        _this5.state = {
            authenticated: true,
            username: 'foo',
            isModalOpen: false,
            inputUsername: '',
            inputPassword: ''
        };

        ReactModal.setAppElement('#root');

        _this5.refreshUserState();
        return _this5;
    }

    _createClass(SessionBox, [{
        key: 'refreshUserState',
        value: function refreshUserState() {
            var _this6 = this;

            api.getLoginState().then(function (json) {
                return _this6.setState({
                    authenticated: json.authenticated,
                    username: json.username
                });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    null,
                    'User: ',
                    this.state.authenticated ? React.createElement(
                        'span',
                        null,
                        React.createElement(
                            'b',
                            null,
                            this.state.username
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn green darken-2', style: { marginLeft: '20px' }, onClick: this.logOut.bind(this) },
                            'Log out'
                        )
                    ) : React.createElement(
                        'span',
                        null,
                        React.createElement(
                            'i',
                            null,
                            'Not authorized'
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn green darken-2', style: { marginLeft: '20px' }, onClick: function onClick(e) {
                                    return _this7.setState({ isModalOpen: true });
                                } },
                            'Log in'
                        )
                    )
                ),
                React.createElement(
                    ReactModal,
                    {
                        isOpen: this.state.isModalOpen,
                        contentLabel: 'Log in',
                        style: {
                            content: {
                                top: '50%',
                                left: '50%',
                                right: 'auto',
                                bottom: 'auto',
                                marginRight: '-50%',
                                transform: 'translate(-50%, -50%)'
                            }
                        }
                    },
                    React.createElement(
                        'h4',
                        null,
                        'Log in'
                    ),
                    React.createElement(
                        'form',
                        { onSubmit: this.attemptToLogIn.bind(this) },
                        React.createElement('input', { type: 'text', placeholder: 'Username', onChange: function onChange(e) {
                                return _this7.setState({ inputUsername: e.target.value });
                            }, value: this.state.inputUsername }),
                        React.createElement('input', { type: 'text', placeholder: 'Password', onChange: function onChange(e) {
                                return _this7.setState({ inputPassword: e.target.value });
                            }, value: this.state.inputPassword }),
                        React.createElement(
                            'button',
                            { className: 'btn green darken-2 right', type: 'submit' },
                            'Log in'
                        )
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn grey darken-2 left', onClick: function onClick(e) {
                                return _this7.setState({ isModalOpen: false });
                            } },
                        'Close'
                    )
                )
            );
        }
    }, {
        key: 'attemptToLogIn',
        value: function attemptToLogIn(e) {
            var _this8 = this;

            api.logIn(this.state.inputUsername, this.state.inputPassword).then(function (success) {
                if (success) {
                    _this8.setState({ isModalOpen: false });
                    _this8.refreshUserState();
                    api.getSchema().then(function (schema) {
                        return app.setState({ groups: api.getGroups() });
                    });
                } else {
                    alert('Bad username or password.');
                }
            });
            e.preventDefault();
        }
    }, {
        key: 'logOut',
        value: function logOut() {
            var _this9 = this;

            api.logOut().then(function () {
                _this9.setState({ isModalOpen: false });
                _this9.refreshUserState();
                api.getSchema().then(function (schema) {
                    return app.setState({ groups: api.getGroups() });
                });
            });
        }
    }]);

    return SessionBox;
}(React.Component);

var Application = function (_React$Component2) {
    _inherits(Application, _React$Component2);

    function Application(props) {
        _classCallCheck(this, Application);

        var _this10 = _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this, props));

        window.localStorage.DRFBroHeaders = window.localStorage.DRFBroHeaders || '[]';

        _this10.state = {
            headers: JSON.parse(window.localStorage.DRFBroHeaders),
            groups: api.getGroups()
        };

        app = _this10;
        return _this10;
    }

    _createClass(Application, [{
        key: 'render',
        value: function render() {
            var _this11 = this;

            return React.createElement(
                'div',
                { className: 'container' },
                React.createElement(
                    'div',
                    { className: 'right' },
                    React.createElement(SessionBox, null)
                ),
                React.createElement(
                    'h4',
                    null,
                    'DRFBro'
                ),
                React.createElement(
                    'ul',
                    { className: 'collapsible groups', 'data-collapsible': 'accordion' },
                    this.state.groups.map(function (group) {
                        return React.createElement(Group, { name: group, key: group });
                    }),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'div',
                            { className: 'collapsible-header green-text text-darken-2' },
                            React.createElement(
                                'i',
                                { className: 'material-icons' },
                                'settings'
                            ),
                            'Settings'
                        ),
                        React.createElement(
                            'div',
                            { className: 'collapsible-body' },
                            React.createElement(
                                'a',
                                { href: '#', onClick: this.addHeader.bind(this) },
                                React.createElement(
                                    'i',
                                    { style: { display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }, className: 'material-icons' },
                                    'add'
                                ),
                                React.createElement(
                                    'span',
                                    { style: { display: 'inline-block', verticalAlign: 'middle' } },
                                    'Add header'
                                )
                            ),
                            this.state.headers.map(function (header, i) {
                                return React.createElement(
                                    'div',
                                    { className: 'flex-row full-width', key: i },
                                    React.createElement(
                                        'div',
                                        null,
                                        React.createElement(
                                            'a',
                                            { href: '#', onClick: _this11.removeHeader.bind(_this11, i) },
                                            React.createElement(
                                                'i',
                                                { className: 'material-icons', style: { marginRight: '10px' } },
                                                'delete'
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'flex-expand' },
                                        React.createElement('input', { placeholder: 'Header name', type: 'text', value: header.name, onChange: function onChange(e) {
                                                header.name = e.target.value;
                                                _this11.updateHeader(header);
                                            } })
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'flex-expand' },
                                        React.createElement('input', { placeholder: 'Header value', type: 'text', value: header.value, onChange: function onChange(e) {
                                                header.value = e.target.value;
                                                _this11.updateHeader(header);
                                            } })
                                    )
                                );
                            })
                        )
                    )
                )
            );
        }
    }, {
        key: 'addHeader',
        value: function addHeader() {
            this.setHeaders(this.state.headers.concat({
                name: '',
                value: ''
            }));
        }
    }, {
        key: 'removeHeader',
        value: function removeHeader(index) {
            var headers = this.state.headers.slice();
            headers.splice(index, 1);
            this.setHeaders(headers);
        }
    }, {
        key: 'updateHeader',
        value: function updateHeader(header) {
            this.setHeaders(this.state.headers);
        }
    }, {
        key: 'setHeaders',
        value: function setHeaders(headers) {
            this.setState({
                headers: headers
            });
            window.localStorage.DRFBroHeaders = JSON.stringify(headers);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var $this = $(ReactDOM.findDOMNode(this));
            $this.find('.collapsible.groups').collapsible();
        }
    }]);

    return Application;
}(React.Component);

var Group = function (_React$Component3) {
    _inherits(Group, _React$Component3);

    function Group(opts) {
        _classCallCheck(this, Group);

        return _possibleConstructorReturn(this, (Group.__proto__ || Object.getPrototypeOf(Group)).call(this, opts));
    }

    _createClass(Group, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'li',
                null,
                React.createElement(
                    'div',
                    { className: 'collapsible-header grey lighten-3' },
                    React.createElement(
                        'i',
                        { className: 'material-icons' },
                        'link'
                    ),
                    this.props.name
                ),
                React.createElement(
                    'div',
                    { className: 'collapsible-body' },
                    React.createElement(
                        'ul',
                        { className: 'collapsible endpoints', 'data-collapsible': 'accordion' },
                        api.getChildren(this.props.name).map(function (child) {
                            if (child.type == 'endpoint') {
                                return React.createElement(Endpoint, { endpoint: child.endpoint, key: child.id });
                            } else {
                                return React.createElement(Group, { name: child.name, key: child.id });
                            }
                        })
                    )
                )
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var $this = $(ReactDOM.findDOMNode(this));
            $this.find('.collapsible.endpoints').collapsible();
        }
    }]);

    return Group;
}(React.Component);

var Endpoint = function (_React$Component4) {
    _inherits(Endpoint, _React$Component4);

    function Endpoint(opts) {
        _classCallCheck(this, Endpoint);

        return _possibleConstructorReturn(this, (Endpoint.__proto__ || Object.getPrototypeOf(Endpoint)).call(this, opts));
    }

    _createClass(Endpoint, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'li',
                null,
                React.createElement(
                    'div',
                    { className: 'collapsible-header grey lighten-3 -white-text' },
                    React.createElement(
                        'span',
                        { className: 'method-badge method-' + this.props.endpoint.action },
                        this.props.endpoint.action.toUpperCase()
                    ),
                    React.createElement(
                        'span',
                        { className: 'method-url' },
                        this.props.endpoint.url
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'collapsible-body' },
                    React.createElement(RequestForm, { endpoint: this.props.endpoint })
                )
            );
        }
    }]);

    return Endpoint;
}(React.Component);

var RequestForm = function (_React$Component5) {
    _inherits(RequestForm, _React$Component5);

    function RequestForm(opts) {
        _classCallCheck(this, RequestForm);

        var _this14 = _possibleConstructorReturn(this, (RequestForm.__proto__ || Object.getPrototypeOf(RequestForm)).call(this, opts));

        _this14.state = {
            fields: [],
            mode: 'form',
            raw: '{}',
            result: '',
            status: 0,
            statusText: ''
        };
        _this14.props.endpoint.fields && _this14.props.endpoint.fields.forEach(function (field) {
            return _this14.state.fields.push({
                name: field.name,
                type: field.schema._type,
                enabled: true,
                value: '',
                id: 'endpoint_' + _this14.props.endpoint.id + '_' + field.name,
                togglable: field.location != 'path'
            });
        });
        _this14.state.raw = JSON.stringify(_this14.getFormData(), null, 4);
        return _this14;
    }

    _createClass(RequestForm, [{
        key: 'render',
        value: function render() {
            var _this15 = this;

            return React.createElement(
                'div',
                null,
                this.props.endpoint.description ? React.createElement(
                    'p',
                    null,
                    this.props.endpoint.description
                ) : '',
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col m4' },
                        React.createElement(
                            'form',
                            { onSubmit: this.performRequest.bind(this) },
                            React.createElement(
                                'ul',
                                { className: 'tabs' },
                                React.createElement(
                                    'li',
                                    { className: 'tab' },
                                    React.createElement(
                                        'a',
                                        {
                                            className: 'active green-text text-darken-2',
                                            href: '#' + this.props.endpoint.id + '-form',
                                            onClick: this.setMode.bind(this, 'form'),
                                            style: { padding: '4px' }
                                        },
                                        'Form'
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    { className: 'tab' },
                                    React.createElement(
                                        'a',
                                        {
                                            className: 'green-text',
                                            href: '#' + this.props.endpoint.id + '-raw',
                                            onClick: this.setMode.bind(this, 'raw'),
                                            style: { padding: '4px' }
                                        },
                                        'Raw data'
                                    )
                                ),
                                React.createElement('div', { className: 'indicator green darken-2' })
                            ),
                            React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'div',
                                    { id: this.props.endpoint.id + '-form' },
                                    this.state.fields.map(function (field) {
                                        return React.createElement(
                                            'div',
                                            { className: 'flex-row full-width', key: field.name },
                                            React.createElement(
                                                'div',
                                                { className: 'flex-expand' },
                                                React.createElement(
                                                    'div',
                                                    { className: 'input-field', style: { marginTop: 0 } },
                                                    React.createElement('input', { type: 'text', name: field.name, value: field.value, onChange: _this15.onChange.bind(_this15, field), id: field.id, style: { marginBottom: 0 } }),
                                                    React.createElement(
                                                        'label',
                                                        { className: 'green-text text-darken-4', htmlFor: field.id },
                                                        field.name
                                                    )
                                                )
                                            ),
                                            field.togglable ? React.createElement(
                                                'div',
                                                null,
                                                React.createElement('input', { id: field.id + '_enabled', className: 'with-gap filled-in', type: 'checkbox', defaultChecked: field.enabled, onChange: _this15.onToggle.bind(_this15, field) }),
                                                React.createElement('label', { htmlFor: field.id + '_enabled', style: { marginTop: '12px', marginLeft: '12px' } })
                                            ) : ''
                                        );
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { id: this.props.endpoint.id + '-raw' },
                                    React.createElement('textarea', { onChange: function onChange(e) {
                                            _this15.setState({ raw: e.target.value });
                                        }, value: this.state.raw, style: {
                                            width: '100%',
                                            height: '30vh',
                                            fontFamily: 'Monospace, Courier New'
                                        } })
                                )
                            ),
                            React.createElement(
                                'button',
                                { className: 'btn orange darken-4 right', type: 'submit', style: { marginTop: '10px' } },
                                this.props.endpoint.action.toUpperCase()
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col m8' },
                        this.state.status ? React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'div',
                                { style: { fontFamily: 'Monospace, Courier New' } },
                                this.state.status
                            ),
                            this.state.result ? React.createElement(
                                'pre',
                                null,
                                React.createElement(
                                    'code',
                                    null,
                                    this.state.result
                                )
                            ) : ''
                        ) : ''
                    )
                )
            );
        }
    }, {
        key: 'onChange',
        value: function onChange(field, event) {
            field.value = event.target.value;
            this.setState({
                fields: this.state.fields
            });
        }
    }, {
        key: 'onToggle',
        value: function onToggle(field, event) {
            field.enabled = event.target.checked;
            this.setState({
                fields: this.state.fields
            });
        }
    }, {
        key: 'setMode',
        value: function setMode(mode) {
            this.setState({
                mode: mode
            });
        }
    }, {
        key: 'getFormData',
        value: function getFormData() {
            var body = {};
            this.state.fields.filter(function (field) {
                return field.enabled;
            }).forEach(function (field) {
                return body[field.name] = field.value;
            });
            return body;
        }
    }, {
        key: 'performRequest',
        value: function performRequest(e) {
            var _this16 = this;

            e.preventDefault();
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            if (api.authToken) {
                headers['Authorization'] = 'Token ' + api.authToken;
            }
            app.state.headers.forEach(function (header) {
                return headers[header.name] = header.value;
            });
            var body = void 0;
            // = this.state.__mode == 'form' ? JSON.stringify(this.state) : this.state.__raw;
            if (this.state.mode == 'form') {
                body = this.getFormData();
            } else {
                body = JSON.parse(this.state.raw);
            }
            var _response = null;
            var method = this.props.endpoint.action.toUpperCase();
            var args = {
                method: method,
                headers: headers,
                // body: body,
                credentials: "same-origin"
            };
            var url = this.props.endpoint.url;
            if (!method.match(/^(GET|HEAD|OPTIONS)$/)) {
                this.state.fields.forEach(function (field) {
                    if (!field.togglable) {
                        url = url.replace(new RegExp('{' + field.name + '}'), body[field.name]);
                        if (field.name in body) {
                            delete body[field.name];
                        }
                    }
                });
                body = JSON.stringify(body);
                args.body = body;
            }
            console.log('URL:', url);
            console.log('Headers:', headers);
            console.log('Body:', body);
            fetch(url, args).then(function (response) {
                _response = response;
                return response.text();
            }).then(function (text) {
                try {
                    text = JSON.stringify(JSON.parse(text), null, '    ');
                } catch (e) {
                    console.error(e);
                }
                _this16.setState({
                    result: text,
                    status: _response.status + ' ' + _response.statusText
                });
            }).catch(function (error) {
                console.error(error);
                _this16.setState({
                    result: 'error',
                    status: 'Error'
                });
            });
            this.setState({
                result: '',
                status: 'Loading...'
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var $this = $(ReactDOM.findDOMNode(this));
            $this.find('.tabs').tabs();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var $this = $(ReactDOM.findDOMNode(this));
            var el = $this.find('pre code').get(0);
            if (el) {
                hljs.highlightBlock(el);
            }
        }
    }]);

    return RequestForm;
}(React.Component);

api.getSchema().then(function () {
    ReactDOM.render(React.createElement(Application, null), document.getElementById('root'));
});
},{}]},{},[1]);
