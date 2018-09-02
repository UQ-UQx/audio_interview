import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, ButtonGroup, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';

import { setSaveFalse, saveGroups, updateGroups, Actions } from '../actions';

import InterviewStructure from './InterviewStructure';
import QuestionPool from './QuestionPool';

const Container = styled.div`
    padding: 20px;
`;

const TabButtonsContainer = styled.div`
    margin-bottom: 20px;
    width: 100%;
    text-align: center;
`;

const TabContentContainer = styled.div`
    margin: 10px;
    padding: 10px;
`;

const TabButtons = styled(Button)``;

const SaveError = styled(Alert)`
    text-align: center;
`;

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: 'structure',
            saveError: '',
            groups: props.groups,
        };

        this.save = this.save.bind(this);
        this.stateHandler = this.stateHandler.bind(this);
    }

    componentDidMount() {
        const { setSaveFalse } = this.props;
        setSaveFalse();
    }

    componentDidUpdate() {
        const { save } = this.props;
        if (save) this.save();
    }

    save() {
        const { history, saveGroups, setSaveFalse, updateGroups } = this.props;
        const { groups } = this.state;
        updateGroups(groups);

        saveGroups(groups)
            .then(response => {
                console.log(response);

                if (response.type === Actions.SAVE_GROUPS_SUCCESS) {
                    history.push('/');
                } else {
                    this.setState({
                        saveError: `Something went wrong...`,
                    });
                    setSaveFalse();
                }
            })
            .catch(error => {
                console.log(error);
                this.setState({
                    saveError: 'Something went wrong...',
                });
                setSaveFalse();
            });
        setSaveFalse();
    }

    stateHandler(val) {
        this.setState({
            ...val,
        });
    }

    render() {
        const { tab, groups, saveError } = this.state;
        let tabToLoad = '';
        switch (tab) {
            case 'structure':
                tabToLoad = <InterviewStructure groups={groups} />;
                break;
            case 'pool':
                tabToLoad = (
                    <QuestionPool
                        stateHandler={this.stateHandler}
                        groups={groups}
                    />
                );
                break;
            default:
                break;
        }
        return (
            <Container>
                {saveError !== '' ? (
                    <Fragment>
                        <SaveError color="danger">
                            <FontAwesomeIcon icon={faExclamation} /> {saveError}
                        </SaveError>
                    </Fragment>
                ) : (
                    ''
                )}
                <TabButtonsContainer>
                    <ButtonGroup>
                        <TabButtons
                            active={tab === 'structure'}
                            color={
                                tab === 'structure' ? 'primary' : 'secondary'
                            }
                            onClick={() => {
                                this.setState({ tab: 'structure' });
                            }}
                        >
                            Interview Structure
                        </TabButtons>
                        <TabButtons
                            active={tab === 'pool'}
                            color={tab === 'pool' ? 'primary' : 'secondary'}
                            onClick={() => {
                                this.setState({ tab: 'pool' });
                            }}
                        >
                            Question Pool
                        </TabButtons>
                    </ButtonGroup>
                </TabButtonsContainer>
                <TabContentContainer>{tabToLoad}</TabContentContainer>
            </Container>
        );
    }
}

export default withRouter(
    connect(
        state => ({
            save: state.save,
            groups: state.groups,
        }),
        { setSaveFalse, saveGroups, updateGroups }
    )(Admin)
);

Admin.propTypes = {
    save: PropTypes.bool.isRequired,
    setSaveFalse: PropTypes.func.isRequired,
    saveGroups: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    updateGroups: PropTypes.func.isRequired,
};
