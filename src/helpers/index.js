import { sampleSize } from 'lodash';

const convertGroupsToQuestionsList = groups => {
    // go through the groups 1by one, read the group settings first, and then grab the questions,

    const list = groups.map(group => {
        const { settings, questions } = group;
        const { randomise, numberOfQuestionsToAsk } = settings;

        let questionsToAsk = [];

        if (randomise) {
            // get all questions that are able to be asked
            questionsToAsk = questions.filter(
                question => question.settings.ask
            );

            // get number of questions that are required
            questionsToAsk = [
                ...sampleSize(questionsToAsk, numberOfQuestionsToAsk),
            ];
        } else {
            questionsToAsk = questions.filter(
                question => question.settings.ask
            );
        }
        return [...questionsToAsk];
    });

    return [].concat(...list);
};

const doSomething = () => 'done something';

export { convertGroupsToQuestionsList, doSomething };
