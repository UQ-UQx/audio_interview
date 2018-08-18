import React from 'react';
import styled from 'styled-components';

import axios from 'axios';

const AppContainer = styled.div`
    border: 1px solid lightgrey;
    padding: 50px;
    height: 100px;
`;

const App = () => (
    <AppContainer>
        <h3>Hello React App!</h3>
        <button
            type="button"
            onClick={() => {
                axios({
                    method: 'get',
                    url: '../public/api/api.php',
                    params: {
                        action: 'hello',
                        jwt_token: $JWT_TOKEN,
                        data: {
                            name: $LTI.userID,
                        },
                    },
                })
                    .then(response => {
                        console.log(response);
                    })
                    .catch(error => {
                        console.log(error);
                    });

                axios({
                    method: 'get',
                    url: '../public/api/crud.php/posts', // test with posts table
                    params: {
                        jwt_token: $JWT_TOKEN,
                        filter: 'posts.title,eq,A post by Will',
                        transform: 1,
                    },
                })
                    .then(response => {
                        console.log(response);
                    })
                    .catch(error => {
                        console.log(error);
                    });

                console.log('wow');
            }}
        >
            Test API
        </button>
    </AppContainer>
);

export default App;
