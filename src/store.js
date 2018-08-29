import axios from 'axios';
import { applyMiddleware, createStore } from 'redux';
import { multiClientMiddleware } from 'redux-axios-middleware';
import { createLogger } from 'redux-logger';
import promise from 'redux-promise-middleware';
import thunk from 'redux-thunk';

import reducer from './reducers';

const logger = createLogger({});

const clients = {
    default: {
        client: axios.create({
            baseURL: '../public/api/crud.php',
            responseType: 'json',
            params: {
                jwt_token: $JWT_TOKEN,
            },
        }),
    },
    activityAPI: {
        client: axios.create({
            baseURL: '../public/api/api.php',
            responseType: 'json',
        }),
    },
};

const middleware = applyMiddleware(
    promise(),
    thunk,
    logger,
    multiClientMiddleware(clients)
);

export default createStore(reducer, middleware);
