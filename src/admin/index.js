import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, ButtonGroup } from 'reactstrap';
import { setSaveFalse } from '../actions';

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

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: 'pool',
            groups: [],
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
        const { history } = this.props;

        history.push('/');
    }

    stateHandler(val) {
        this.setState({
            ...val,
        });
    }

    render() {
        const { tab, groups } = this.state;
        let tabToLoad = '';
        switch (tab) {
            case 'structure':
                tabToLoad = <InterviewStructure />;
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
        }),
        { setSaveFalse }
    )(Admin)
);

Admin.propTypes = {
    save: PropTypes.bool.isRequired,
    setSaveFalse: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
};
