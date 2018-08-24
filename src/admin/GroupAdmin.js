import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
    Input,
    Button,
    InputGroup,
    InputGroupText,
    InputGroupAddon,
} from 'reactstrap';

import { Icon } from 'react-fa';

const Container = styled.div`
    margin-bottom: 10px;
    background-color: #eaeaea;
    padding: 10px;
`;

const AddQuestionButton = styled(Button)`
    margin-top: 5px;
`;

const QuestionInputGroup = styled(InputGroup)`
    margin-bottom: 5px;
`;

const GroupTopBar = styled.div`
    text-align: right;
    background-color: #6c6c6c;
    width: 100%;
`;

const GroupAdmin = props => {
    const {
        id,
        // name,
        questions,
        onChangeHandler,
    } = props;

    return (
        <Fragment>
            <GroupTopBar>
                <Button
                    color="danger"
                    onClick={() => onChangeHandler(id, 'removeGroup')}
                >
                    <Icon name="trash" /> Remove Group
                </Button>
            </GroupTopBar>
            <Container>
                {questions.map(question => (
                    <QuestionInputGroup key={`${id}_${question.id}`}>
                        <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                                <Icon name="bars" />
                            </InputGroupText>
                        </InputGroupAddon>
                        <Input
                            name={`${id}_${question.id}_question_input`}
                            placeholder="Please Write Your Question Here..."
                            onChange={event =>
                                onChangeHandler(id, 'updateQuestion', {
                                    id: question.id,
                                    event,
                                })
                            }
                            value={question.question}
                        />{' '}
                        <InputGroupAddon addonType="append">
                            <Button
                                color="danger"
                                onClick={() =>
                                    onChangeHandler(id, 'removeQuestion', {
                                        id: question.id,
                                    })
                                }
                            >
                                <Icon name="trash" />
                            </Button>
                        </InputGroupAddon>
                    </QuestionInputGroup>
                ))}
                <AddQuestionButton
                    color="info"
                    size="sm"
                    onClick={() => onChangeHandler(id, 'addQuestion')}
                >
                    Add Question
                </AddQuestionButton>
            </Container>
        </Fragment>
    );
};

export default GroupAdmin;

GroupAdmin.propTypes = {
    id: PropTypes.string.isRequired,
    // name: PropTypes.string.isRequired,
    questions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    onChangeHandler: PropTypes.func.isRequired,
};
