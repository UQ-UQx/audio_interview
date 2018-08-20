import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';

import store from './store';
import App from './components/App';
import Admin from './admin';
import AppMenu from './AppMenu';

import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const renderApp = () => (
    <Provider store={store}>
        <Router>
            <Fragment>
                {$LTI.user_role === 'Instructor' ||
                $LTI.user_role === 'Administrator' ? (
                    <AppMenu />
                ) : (
                    ''
                )}
                <Switch>
                    <Route
                        path="/edit"
                        render={props => <Admin {...props} />}
                    />
                    <Route path="/" render={props => <App {...props} />} />
                </Switch>
            </Fragment>
        </Router>
    </Provider>
);

/* Disable Activity when in studio view 
(edX studio view sets userID as 'student') 
as course ID is different in edX Live View */
if ($LTI.userID === 'student') {
    const divStyle = {
        textAlign: 'center',
        paddingTop: '100px',
    };
    ReactDOM.render(
        <div style={divStyle}>
            <h2>Please Author This Activity In Live View</h2>
        </div>,
        document.getElementById('app')
    );
} else {
    ReactDOM.render(renderApp(), document.getElementById('app'));
}
