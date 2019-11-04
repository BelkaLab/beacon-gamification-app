import isEqual from 'lodash.isequal';
import sortBy from 'lodash.sortby';
import React, { forwardRef, FunctionComponent, RefObject, useEffect, useState } from 'react';
import { Dimensions, Keyboard, ScrollView, StatusBar, StyleSheet, Text, TextInput as TextInputStatic, View } from 'react-native';
import { useKeyboard } from 'react-native-hooks';
import { Button } from 'react-native-paper';
import { material } from 'react-native-typography';
import { useNavigationEvents } from 'react-navigation-hooks';
import { translate } from '../../localization/locale';
import { QuestionMetadata, QuestStep } from '../../models/quest';
import { Colors } from '../../styles/colors';
import { addOrRemove, isQuestionWithTextInput } from '../../utils/uiobjects';
import QuestionRenderer from '../step/QuestionRenderer/QuestionRenderer';

interface IQuestionContainerProps {
  step: QuestStep;
  question: QuestionMetadata;
  questEnumeration: string;
  onCorrectAnswer: (step: QuestStep) => void;
  onWrongAnswer: (step: QuestStep) => void;
  onSkipQuestionPressed: (step: QuestStep) => void;
  ref?: RefObject<TextInputStatic>;
}

type QuestionContext = {
  answer: string;
  multipleAnswer: string[];
  orderedAnswer: string[];
  setAnswer?: (answer: string) => void;
  toggleAnswer?: (answer: string) => void;
  setOrderedAnswer?: (orderedAnswers: string[]) => void;
};

export const QuestContext = React.createContext<QuestionContext>({
  answer: '',
  multipleAnswer: [],
  orderedAnswer: []
});

const QuestionContainer: FunctionComponent<IQuestionContainerProps> = forwardRef(
  (
    { step, question, questEnumeration, onCorrectAnswer, onWrongAnswer, onSkipQuestionPressed },
    ref: RefObject<TextInputStatic>
  ) => {
    const { isKeyboardShow } = useKeyboard();

    const [data, setData] = useState({
      text: '',
      multipleAnswer: [],
      orderedAnswer: []
    });

    const [isCorrect, setCorrect] = useState(false);
    const [isFormSubmitted, setFormSubmitted] = useState(false);

    useNavigationEvents(evt => {
      if (evt.type === 'didBlur') {
        clearState();
      }
    });

    useEffect(() => {
      if (!isKeyboardShow && isFormSubmitted) {
        if (isCorrect) {
          onCorrectAnswer(step);
        } else {
          onWrongAnswer(step);
        }
      }
    }, [isKeyboardShow]);

    const onAnswerPressed = () => {
      const isValid =
        question.kind === 'multiple'
          ? isEqual(sortBy(data.multipleAnswer), sortBy(question.answer))
          : question.kind === 'order'
          ? isEqual(data.orderedAnswer, question.answer)
          : data.text.toLowerCase() === (question.answer as string).toLowerCase();

      if (isKeyboardShow) {
        setFormSubmitted(true);
        setCorrect(isValid);
        Keyboard.dismiss();
      } else if (isValid) {
        onCorrectAnswer(step);
      } else {
        onWrongAnswer(step);
      }
    };

    const onSkipPressed = () => {
      onSkipQuestionPressed(step);
    };

    const clearState = () => {
      setData({
        text: '',
        multipleAnswer: [],
        orderedAnswer: []
      });
    };

    const renderContent = () => {
      return (
        <>
          <View style={{ flex: 1, width: Dimensions.get('window').width - 32, justifyContent: 'space-between' }}>
            <QuestContext.Provider
              value={{
                answer: data.text,
                multipleAnswer: data.multipleAnswer,
                orderedAnswer: data.orderedAnswer,
                setAnswer: (text: string) => {
                  setCorrect(false);
                  setFormSubmitted(false);
                  setData({
                    ...data,
                    text
                  });
                },
                toggleAnswer: (text: string) => {
                  setData({
                    ...data,
                    multipleAnswer: addOrRemove(data.multipleAnswer, text)
                  });
                },
                setOrderedAnswer: (orderedAnswer: string[]) => {
                  setData({
                    ...data,
                    orderedAnswer
                  });
                }
              }}
            >
              <View style={{ flexGrow: 1 }}>
                <Text style={styles.question}>{`${questEnumeration}. ${question.question}`}</Text>
                <QuestionRenderer ref={ref} question={question} />
              </View>
            </QuestContext.Provider>
            <View>
              <Button onPress={onAnswerPressed} mode="contained" dark={true}>
                {translate('answer')}
              </Button>
              <Button
                onPress={onSkipPressed}
                mode="text"
                dark={true}
                theme={{
                  colors: {
                    primary: Colors.WHITE
                  }
                }}
                style={{ marginTop: 12 }}
              >
                {translate('skip_question')}
              </Button>
            </View>
          </View>
        </>
      );
    };

    return isQuestionWithTextInput(question) ? (
      <ScrollView contentContainerStyle={styles.questionContainer} keyboardShouldPersistTaps="handled">
        {renderContent()}
      </ScrollView>
    ) : (
      <View style={styles.questionContainer}>{renderContent()}</View>
    );
  }
);

const styles = StyleSheet.create({
  question: {
    ...material.titleObject,
    color: Colors.WHITE
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 120 + StatusBar.currentHeight,
    marginBottom: 16
  },
  answerInput: {
    width: '100%',
    marginVertical: 12
  }
});

export default QuestionContainer;
