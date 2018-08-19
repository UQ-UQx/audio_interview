import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './components/App';

const renderApp = () => (
    <Provider store={store}>
        <App />
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
