import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { setSaveTrue } from './actions';

const Container = styled.div`
    margin-bottom: 10px;
    text-align: right;
`;

const StyledLink = styled(Link)`
    text-decoration: none;

    &:focus,
    &:hover,
    &:visited,
    &:link,
    &:active {
        text-decoration: none;
    }
`;

const AdminPageOptionsContainer = styled.div``;

const CancelButton = styled(Button)``;
const SaveButton = styled(Button)`
    margin-left: 5px;
`;

const AdminPageOptions = props => {
    const { setSaveTrue, history } = props;

    return (
        <AdminPageOptionsContainer>
            <CancelButton
                color="danger"
                type="button"
                onClick={() => {
                    history.push('/');
                }}
            >
                Cancel
            </CancelButton>
            <SaveButton
                color="primary"
                type="button"
                onClick={() => {
                    setSaveTrue();
                }}
            >
                Save Changes
            </SaveButton>
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
                <StyledLink to="/edit">
                    <Button color="primary" type="button">
                        Edit LTI App
                    </Button>
                </StyledLink>
            )}
            <hr />
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
