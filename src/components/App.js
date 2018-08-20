import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Counter from './Counter';

const AppContainer = styled.div`
    border: 1px solid lightgrey;
    padding: 50px;
`;

const App = () => (
    <AppContainer>
        <Typography variant="display2" gutterBottom>
            Hello LTI React App!
        </Typography>
        <Typography variant="subheading" gutterBottom>
            Open Developer Tools to see log outputs on s tate change
        </Typography>

        <Button
            variant="contained"
            color="primary"
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
            }}
        >
            Test API
        </Button>
        <h4>Redux Example</h4>
        <Counter />
    </AppContainer>
);

export default withRouter(App);
