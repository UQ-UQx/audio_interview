import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import store from './store';
import App from './components/App';
import Admin from './admin';
import AppMenu from './AppMenu';

const theme = createMuiTheme();

const renderApp = () => (
    <Provider store={store}>
        <Router>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />

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
            </MuiThemeProvider>
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
