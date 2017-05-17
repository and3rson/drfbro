class API {
    constructor() {
        this.authToken = window.localStorage.DRFBroAuthToken || '';
    }
    getSchema() {
        this.i = 0;
        this.schema = null;
        let headers = {};
        if (this.authToken) {
            headers['Authorization'] = `Token ${api.authToken}`;
        }
        return fetch(window.DRFBroConfig.schema, {
            credentials: 'same-origin',
            headers: headers
        })
            .then(response => response.json())
            .then(json => this.schema = json)
            .then(() => console.log(this.schema))
        ;
    }

    getGroups() {
        return Object.keys(this.schema).filter(
            key => !key.startsWith('_')
        );
    }

    getChildren(path) {
        let children = this.schema;
        console.log('Resolving path', path);
        if (path.split('/').length > 50) return;
        path.split('/').forEach(part => children = children[part]);
        return Object.keys(children).map(
            key => {
                let child = children[key];
                if (child._type == 'link') {
                    child.id = 'endpoint' + this.i++;
                    return {type: 'endpoint', endpoint: child, id: child.id};
                } else {
                    return {type: 'group', name: path + '/' + key, id: 'group' + this.i++};
                }
            }
        );
    }

    getLoginState(username, password) {
        let headers = {};
        if (this.authToken) {
            headers['Authorization'] = `Token ${api.authToken}`;
        }
        return fetch(window.DRFBroConfig.state, {
            method: 'GET',
            credentials: "same-origin",
            headers: headers
        })
            .then(response => response.json())
        ;
    }

    logIn(username, password) {
        return fetch(window.DRFBroConfig.log_in, {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        })
            .then(response => response.json())
            .then(json => {
                if (json.token) {
                    this.authToken = json.token;
                    window.localStorage.DRFBroAuthToken = json.token;
                    return true;
                }
                // this.csrfToken = document.cookie.match(/csrftoken=([a-zA-Z0-9]+)/)[1];
                return false;
            })
        ;
    }

    logOut(username, password) {
        return new Promise((resolve, reject) => {
            this.authToken = '';
            window.localStorage.DRFBroAuthToken = '';
            resolve();
        });
    }
}

const api = new API();

let app = null;

class SessionBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: true,
            username: 'foo',
            isModalOpen: false,
            inputUsername: '',
            inputPassword: ''
        };

        ReactModal.setAppElement('#root');

        this.refreshUserState();
    }

    refreshUserState() {
        api.getLoginState().then(json => this.setState({
            authenticated: json.authenticated,
            username: json.username
        }));
    }

    render() {
        return <div>
            <div>
                User: { this.state.authenticated ? (
                    <span>
                        <b>{this.state.username}</b>
                        <button className="btn green darken-2" style={{ marginLeft: '20px' }} onClick={ this.logOut.bind(this) }>Log out</button>
                    </span>
                ) : (
                    <span>
                        <i>Not authorized</i>
                        <button className="btn green darken-2" style={{ marginLeft: '20px' }} onClick={ (e) => this.setState({isModalOpen: true }) }>Log in</button>
                    </span>
                ) }
            </div>

            <ReactModal
                isOpen={this.state.isModalOpen}
                contentLabel="Log in"
                style={{
                    content: {
                        top                   : '50%',
                        left                  : '50%',
                        right                 : 'auto',
                        bottom                : 'auto',
                        marginRight           : '-50%',
                        transform             : 'translate(-50%, -50%)'
                    }
                }}
            >
                <h4>Log in</h4>
                <form onSubmit={ this.attemptToLogIn.bind(this) }>
                    <input type="text" placeholder="Username" onChange={ (e) => this.setState({inputUsername: e.target.value}) } value={ this.state.inputUsername }/>
                    <input type="text" placeholder="Password" onChange={ (e) => this.setState({inputPassword: e.target.value}) } value={ this.state.inputPassword }/>
                    <button className="btn green darken-2 right" type="submit">Log in</button>
                </form>
                <button className="btn grey darken-2 left" onClick={ (e) => this.setState({isModalOpen: false}) }>Close</button>
            </ReactModal>
        </div>;
    }

    attemptToLogIn(e) {
        api.logIn(this.state.inputUsername, this.state.inputPassword)
            .then(success => {
                if (success) {
                    this.setState({isModalOpen: false});
                    this.refreshUserState();
                    api.getSchema().then(schema => app.setState({groups: api.getGroups()}));
                } else {
                    alert('Bad username or password.');
                }
            })
        ;
        e.preventDefault();
    }

    logOut() {
        api.logOut().then(() => {
            this.setState({isModalOpen: false});
            this.refreshUserState();
            api.getSchema().then(schema => app.setState({groups: api.getGroups()}));
        });
    }
}

class Application extends React.Component {
    constructor(props) {
        super(props);

        window.localStorage.DRFBroHeaders = window.localStorage.DRFBroHeaders || '[]';

        this.state = {
            headers: JSON.parse(window.localStorage.DRFBroHeaders),
            groups: api.getGroups()
        };

        app = this;
    }

    render() {
        return <div className="container">
            <div className="right">
                <SessionBox />
            </div>

            <h4>DRFBro</h4>

            <ul className="collapsible groups" data-collapsible="accordion">
                {
                    this.state.groups.map(
                        group => <Group name={group} key={group}/>
                    )
                }
                <li>
                    <div className="collapsible-header green-text text-darken-2">
                        <i className="material-icons">settings</i>
                        Settings
                    </div>
                    <div className="collapsible-body">
                        <a href="#" onClick={ this.addHeader.bind(this) }>
                            <i style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }} className="material-icons">add</i>
                            <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Add header</span>
                        </a>
                        {
                            this.state.headers.map(
                                (header, i) => (
                                    <div className="flex-row full-width" key={ i }>
                                        <div>
                                            <a href="#" onClick={ this.removeHeader.bind(this, i) }>
                                                <i className="material-icons" style={{ marginRight: '10px' }}>delete</i>
                                            </a>
                                        </div>
                                        <div className="flex-expand">
                                            <input placeholder="Header name" type="text" value={ header.name } onChange={ e => {
                                                header.name = e.target.value;
                                                this.updateHeader(header);
                                            } } />
                                        </div>
                                        <div className="flex-expand">
                                            <input placeholder="Header value" type="text" value={ header.value } onChange={ e => {
                                                header.value = e.target.value;
                                                this.updateHeader(header);
                                            } } />
                                        </div>
                                    </div>
                                )
                            )
                        }
                    </div>
                </li>
            </ul>
        </div>;
    }

    addHeader() {
        this.setHeaders(this.state.headers.concat({
            name: '',
            value: ''
        }));
    }

    removeHeader(index) {
        const headers = this.state.headers.slice();
        headers.splice(index, 1);
        this.setHeaders(headers);
    }

    updateHeader(header) {
        this.setHeaders(this.state.headers);
    }

    setHeaders(headers) {
        this.setState({
            headers: headers
        });
        window.localStorage.DRFBroHeaders = JSON.stringify(headers);
    }

    componentDidMount() {
        const $this = $(ReactDOM.findDOMNode(this));
        $this.find('.collapsible.groups').collapsible();
    }
}

class Group extends React.Component {
    constructor(opts) {
        super(opts);
    }

    render() {
        return <li>
            <div className="collapsible-header grey lighten-3">
                <i className="material-icons">link</i>
                {this.props.name}
            </div>
            <div className="collapsible-body">
                <ul className="collapsible endpoints" data-collapsible="accordion">
                    {
                        api.getChildren(this.props.name).map(
                            child => {
                                if (child.type == 'endpoint') {
                                    return <Endpoint endpoint={child.endpoint} key={child.id}/>;
                                } else {
                                    return <Group name={child.name} key={child.id}/>;
                                }
                            }
                        )
                    }
                </ul>
            </div>
        </li>;
    }

    componentDidMount() {
        const $this = $(ReactDOM.findDOMNode(this));
        $this.find('.collapsible.endpoints').collapsible();
    }
}

class Endpoint extends React.Component {
    constructor(opts) {
        super(opts);
    }

    render() {
        return <li>
            <div className="collapsible-header grey lighten-3 -white-text">
                <span className={ 'method-badge method-' + this.props.endpoint.action }>
                    { this.props.endpoint.action.toUpperCase() }
                </span>
                <span className="method-url">
                    { this.props.endpoint.url }
                </span>
            </div>
            <div className="collapsible-body">
                <RequestForm endpoint={this.props.endpoint} />
            </div>
        </li>;
    }
}

class RequestForm extends React.Component {
    constructor(opts) {
        super(opts);
        this.state = {
            fields: [],
            mode: 'form',
            raw: '{}',
            result: '',
            status: 0,
            statusText: ''
        };
        this.props.endpoint.fields && this.props.endpoint.fields.forEach(
            field => this.state.fields.push({
                name: field.name,
                type: field.schema._type,
                enabled: true,
                value: '',
                id: 'endpoint_' + this.props.endpoint.id + '_' + field.name,
                togglable: field.location != 'path'
            })
        );
        this.state.raw = JSON.stringify(this.getFormData(), null, 4);
    }

    render() {
        return (
            <div>
                { this.props.endpoint.description ? <p>{ this.props.endpoint.description }</p> : '' }
                <div className="row">
                    <div className="col m4">
                        <form onSubmit={ this.performRequest.bind(this) }>
                            <ul className="tabs">
                                <li className="tab">
                                    <a
                                        className="active green-text text-darken-2"
                                        href={'#' + this.props.endpoint.id + '-form'}
                                        onClick={ this.setMode.bind(this, 'form') }
                                        style={{padding: '4px'}}
                                    >
                                        Form
                                    </a>
                                </li>
                                <li className="tab">
                                    <a
                                        className="green-text"
                                        href={'#' + this.props.endpoint.id + '-raw'}
                                        onClick={ this.setMode.bind(this, 'raw') }
                                        style={{padding: '4px'}}
                                    >
                                        Raw data
                                    </a>
                                </li>
                                <div className="indicator green darken-2"></div>
                            </ul>
                            <div>
                                <div id={this.props.endpoint.id + '-form'}>
                                    { this.state.fields.map(
                                        field => (
                                            <div className="flex-row full-width" key={field.name}>
                                                <div className="flex-expand">
                                                    <div className="input-field" style={{marginTop: 0}}>
                                                        <input type="text" name={field.name} value={field.value} onChange={this.onChange.bind(this, field)} id={field.id} style={{marginBottom: 0}} />
                                                        <label className="green-text text-darken-4" htmlFor={field.id}>{field.name}</label>
                                                    </div>
                                                </div>
                                                { field.togglable ? (
                                                    <div>
                                                        <input id={field.id + '_enabled'} className="with-gap filled-in" type="checkbox" defaultChecked={field.enabled} onChange={this.onToggle.bind(this, field)} />
                                                        <label htmlFor={field.id + '_enabled'} style={{ marginTop: '12px', marginLeft: '12px' }}></label>
                                                    </div>
                                                ) : '' }
                                            </div>
                                        )
                                    )}
                                </div>
                                <div id={this.props.endpoint.id + '-raw'}>
                                    <textarea onChange={ (e) => { this.setState({raw: e.target.value}); } } value={ this.state.raw } style={{
                                        width: '100%',
                                        height: '30vh',
                                        fontFamily: 'Monospace, Courier New'
                                    }}></textarea>
                                </div>
                            </div>
                            <button className="btn orange darken-4 right" type="submit" style={{ marginTop: '10px' }}>
                                { this.props.endpoint.action.toUpperCase() }
                            </button>
                        </form>
                    </div>
                    <div className="col m8">
                        { this.state.status ? (
                            <div>
                                <div style={{ fontFamily: 'Monospace, Courier New' }}>{ this.state.status }</div>
                                { this.state.result ? (
                                    <pre>
                                        <code>
                                            { this.state.result }
                                        </code>
                                    </pre>
                                ) : '' }
                            </div>
                        ) : '' }
                    </div>
                </div>
            </div>
        );
    }

    onChange(field, event) {
        field.value = event.target.value;
        this.setState({
            fields: this.state.fields
        });
    }

    onToggle(field, event) {
        field.enabled = event.target.checked;
        this.setState({
            fields: this.state.fields
        });
    }

    setMode(mode) {
        this.setState({
            mode: mode
        });
    }

    getFormData() {
        let body = {};
        this.state.fields.filter(
            field => field.enabled
        ).forEach(
            field => body[field.name] = field.value
        );
        return body;
    }

    performRequest(e) {
        e.preventDefault();
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // 'X-CSRFToken': api.csrfToken
        };
        if (api.authToken) {
            headers['Authorization'] = `Token ${api.authToken}`;
        }
        app.state.headers.forEach(
            header => headers[header.name] = header.value
        );
        let body;
        // = this.state.__mode == 'form' ? JSON.stringify(this.state) : this.state.__raw;
        if (this.state.mode == 'form') {
            body = this.getFormData();
        } else {
            body = JSON.parse(this.state.raw);
        }
        let _response = null;
        let method = this.props.endpoint.action.toUpperCase();
        let args = {
            method: method,
            headers: headers,
            // body: body,
            credentials: "same-origin"
        };
        let url = this.props.endpoint.url;
        if (!method.match(/^(GET|HEAD|OPTIONS)$/)) {
            this.state.fields.forEach(field => {
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
        fetch(url, args)
            .then(response => {
                _response = response;
                return response.text();
            })
            .then(text => {
                try {
                    text = JSON.stringify(JSON.parse(text), null, '    ');
                } catch (e) {
                    console.error(e);
                }
                this.setState({
                    result: text,
                    status: _response.status + ' ' + _response.statusText
                })
            })
            .catch(error => {
                console.error(error);
                this.setState({
                    result: 'error',
                    status: 'Error'
                })
            })
        ;
        this.setState({
            result: '',
            status: 'Loading...'
        });
    }

    componentDidMount() {
        const $this = $(ReactDOM.findDOMNode(this));
        $this.find('.tabs').tabs();
    }

    componentDidUpdate() {
        const $this = $(ReactDOM.findDOMNode(this));
        const el = $this.find('pre code').get(0);
        if (el) {
            hljs.highlightBlock(el);
        }
    }
}

api.getSchema().then(() => {
    ReactDOM.render(
        <Application/>,
        document.getElementById('root')
    );
});
