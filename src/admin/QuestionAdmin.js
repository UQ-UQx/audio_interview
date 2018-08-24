import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Input } from 'reactstrap';

const Container = styled.div``;

const QuestionAdmin = props => {
    const { id, question, onChangeHandler } = props;

    return (
        <Container>
            <Input
                name="question_input"
                placeholder="Please Write Your Question Here..."
                onChange={event => onChangeHandler(id, 'question', event)}
                value={question}
            />
        </Container>
    );
};

export default QuestionAdmin;

QuestionAdmin.propTypes = {
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    onChangeHandler: PropTypes.func.isRequired,
};
