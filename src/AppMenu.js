import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { setSaveTrue } from './actions';

const Container = styled.div`
    text-align: right;
    border-bottom: 1px solid ${props => (props.admin ? 'lightblue' : 'black')};
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

const CancelButton = styled(Button)`
    color: red !important;
`;
const SaveButton = styled(Button)`
    margin-left: 5px;
`;

const AdminPageOptions = props => {
    const { setSaveTrue, history } = props;

    return (
        <AdminPageOptionsContainer>
            <CancelButton
                color="link danger"
                type="button"
                onClick={() => {
                    history.push('/');
                }}
            >
                Cancel
            </CancelButton>
            <SaveButton
                color="link"
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
    const admin = location.pathname === '/edit';
    return (
        <Container admin={admin}>
            {admin ? (
                <AdminPageOptions {...props} />
            ) : (
                <StyledLink to="/edit">
                    <Button color="link" type="button">
                        Admin
                    </Button>
                </StyledLink>
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
