import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { setSaveTrue } from './actions';

const Container = styled.div`
    padding: 20px;
    text-align: right;
`;

const AdminPageOptionsContainer = styled.div``;

const AdminPageOptions = props => {
    const { setSaveTrue, history } = props;

    return (
        <AdminPageOptionsContainer>
            <button
                type="button"
                onClick={() => {
                    history.push('/');
                }}
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={() => {
                    setSaveTrue();
                }}
            >
                Save
            </button>
        </AdminPageOptionsContainer>
    );
};

const AppMenu = props => {
    const { location } = props;
    return (
        <Container>
            {location.pathname === '/edit' ? (
                <AdminPageOptions {...props} />
            ) : (
                <Link to="/edit">
                    <button type="button">Edit LTI App</button>
                </Link>
            )}
        </Container>
    );
};

export default withRouter(
    connect(
        () => ({
            // mapStateToProps
        }),
        { setSaveTrue }
    )(AppMenu)
);

AdminPageOptions.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
    setSaveTrue: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
};
