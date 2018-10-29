import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Alert } from 'reactstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faStroopwafel,
    faTrash,
    faCog,
    faBars,
    faSyncAlt,
    faSpinner,
    faPlay,
    faPause,
    faStop,
    faCloudUploadAlt,
    faTimesCircle,
    faVideo,
} from '@fortawesome/free-solid-svg-icons';

import {
    getSavedGroups,
    getSavedQuestionsList,
    Actions,
    Tables,
} from './actions';

import store from './store';
import App from './components/App';
import Admin from './admin';
import AppMenu from './AppMenu';

import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';

library.add(
    faStroopwafel,
    faTrash,
    faCog,
    faBars,
    faSyncAlt,
    faSpinner,
    faPlay,
    faPause,
    faStop,
    faCloudUploadAlt,
    faTimesCircle,
    faVideo
);

const error = (
    err = 'Something went wrong... Please contact UQx',
    color = 'danger'
) => (
    <Alert color={color} style={{ textAlign: 'center', fontWeight: 'bold' }}>
        {err}
    </Alert>
);

const renderApp = (loadApp = true) => (
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
                    <Route
                        path="/"
                        render={props =>
                            !loadApp ? (
                                error(
                                    'Our records indicate your interview was interrupted before submission, please contact the course team to reset this activity',
                                    'warning'
                                )
                            ) : (
                                <App {...props} />
                            )
                        }
                    />
                </Switch>
            </Fragment>
        </Router>
    </Provider>
);

const render = el => {
    ReactDOM.render(el, document.getElementById('app'));
};

const getSavedData = () => {
    const data = Promise.all([
        store.dispatch(getSavedGroups()),
        store.dispatch(getSavedQuestionsList()),
    ]);

    data.then(response => {
        if (
            response[0].type === Actions.GET_SAVED_GROUPS_SUCCESS &&
            response[1].type === Actions.GET_SAVED_QUESTIONS_LIST_SUCCESS
        ) {
            // const savedGroups = response[0].payload.data[Tables.GROUPS];
            const savedQuestionsList =
                response[1].payload.data[Tables.QUESTIONS];

            console.log(savedQuestionsList);

            if (savedQuestionsList.length > 0) {
                if (savedQuestionsList[0].completed) {
                    render(renderApp());
                } else {
                    render(renderApp(false));
                }
            } else {
                render(renderApp());
            }
        } else {
            render(error());
        }
    });
};

/* Disable Activity when in studio view 
(edX studio view sets userID as 'student') 
course ID is different in edX Live View */
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
    getSavedData();
}
