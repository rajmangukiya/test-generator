import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  topic: string;
  difficulty: string;
  experience: number;
  questions: Question[];
}

interface SavedQuizResult {
  id: string;
  topic: string;
  difficulty: string;
  experienceLevel: string;
  questionsCount: number;
  score: number;
  totalQuestions: number;
  dateTaken: string;
  userAnswers: number[];
  correctAnswers: number[];
  questions?: Question[];
  isPartial?: boolean;
  answeredQuestions?: number;
}

export default function Quiz() {
  const params = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  useEffect(() => {
    // Parse quiz data from navigation params
    if (params.questions && params.topic && params.difficulty && params.experience) {
      try {
        const questions: Question[] = JSON.parse(params.questions as string);
        setQuizData({
          topic: params.topic as string,
          difficulty: params.difficulty as string,
          experience: parseInt(params.experience as string),
          questions
        });
      } catch (error) {
        console.error('Error parsing quiz data:', error);
        Alert.alert('Error', 'Failed to load quiz data');
        router.replace('/(tabs)/(home)');
      }
    } else {
      // Fallback to static questions if no params
      navigate('/(tabs)/(home)');
    }
  }, []);

  if (!quizData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  const saveQuizResult = async (finalAnswers: number[], score: number, isPartial = false) => {
    if (!quizData) return;

    try {
      const existingQuizzes = await AsyncStorage.getItem('quiz_results');
      const quizzes: SavedQuizResult[] = existingQuizzes ? JSON.parse(existingQuizzes) : [];

      const answeredQuestions = finalAnswers.filter(answer => answer !== -1).length;

      const newQuizResult: SavedQuizResult = {
        id: Date.now().toString(),
        topic: quizData.topic,
        difficulty: quizData.difficulty,
        experienceLevel: getExperienceLevel(quizData.experience),
        questionsCount: quizData.questions.length,
        score: score,
        totalQuestions: quizData.questions.length,
        dateTaken: new Date().toISOString().split('T')[0],
        userAnswers: finalAnswers,
        correctAnswers: quizData.questions.map(q => q.correctAnswer),
        questions: quizData.questions,
        isPartial: isPartial,
        answeredQuestions: answeredQuestions
      };

      quizzes.unshift(newQuizResult); // Add to beginning of array
      await AsyncStorage.setItem('quiz_results', JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const getExperienceLevel = (years: number): string => {
    if (years === 0) return 'Beginner';
    if (years <= 2) return 'Junior';
    if (years <= 5) return 'Mid-level';
    if (years <= 10) return 'Senior';
    return 'Expert';
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) {
      Alert.alert('Answer Required', 'Please select an answer before proceeding.');
      return;
    }

    const newUserAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newUserAnswers);

    if (isLastQuestion) {
      // Quiz completed - calculate results and save
      const score = newUserAnswers.reduce((acc, answer, index) => {
        return acc + (answer === quizData.questions[index].correctAnswer ? 1 : 0);
      }, 0);

      // Save quiz result to AsyncStorage
      await saveQuizResult(newUserAnswers, score);

      // Navigate directly to review screen with quiz data
      router.replace({
        pathname: '/review',
        params: {
          quizId: Date.now().toString(),
          fromSubmission: 'true'
        }
      });
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleExitQuiz = () => {
    Alert.alert(
      'Exit Quiz',
      'Do you want to save your progress before exiting?',
      [
        {
          text: 'Exit Without Saving',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)/(home)')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Save & Exit',
          onPress: async () => {
            await savePartialQuizResult();
            router.replace('/(tabs)/(home)');
          }
        }
      ]
    );
  };

  const savePartialQuizResult = async () => {
    if (!quizData) return;

    try {
      // Fill remaining answers with -1 to indicate unanswered
      const allAnswers = [...userAnswers];
      const totalQuestions = quizData.questions.length;

      // Add current question answer if one is selected
      if (selectedAnswer !== null) {
        allAnswers.push(selectedAnswer);
      }

      // Fill remaining questions with -1 (unanswered)
      while (allAnswers.length < totalQuestions) {
        allAnswers.push(-1);
      }

      // Calculate score only for answered questions
      const answeredQuestions = allAnswers.filter(answer => answer !== -1);
      const score = allAnswers.reduce((acc, answer, index) => {
        if (answer === -1) return acc; // Skip unanswered questions
        return acc + (answer === quizData.questions[index].correctAnswer ? 1 : 0);
      }, 0);

      await saveQuizResult(allAnswers, score, true); // true indicates partial quiz
    } catch (error) {
      console.error('Error saving partial quiz result:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitQuiz}>
          <View style={styles.exitButtonContent}>
            <Text style={styles.exitButtonIcon}>←</Text>
            <Text style={styles.exitButtonText}>Exit</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {quizData.questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }
              ]}
            />
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Question Content */}
      {
        currentQuestion && (
          <View style={styles.content}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIndicator,
                      selectedAnswer === index && styles.selectedIndicator
                    ]} />
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === index && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )
      }

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswer === null && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={selectedAnswer === null}
        >
          <Text style={[
            styles.nextButtonText,
            selectedAnswer === null && styles.nextButtonTextDisabled
          ]}>
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  exitButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  exitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  exitButtonIcon: {
    fontSize: 18,
    color: "#666",
    marginRight: 6,
  },
  exitButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#573E6A",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#573E6A",
    borderRadius: 3,
  },
  headerSpacer: {
    width: 70,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  questionContainer: {
    marginBottom: 40,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    lineHeight: 32,
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  selectedOption: {
    borderColor: "#573E6A",
    backgroundColor: "#f8f9ff",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 15,
  },
  selectedIndicator: {
    borderColor: "#573E6A",
    backgroundColor: "#573E6A",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    lineHeight: 24,
  },
  selectedOptionText: {
    color: "#573E6A",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  nextButton: {
    backgroundColor: "#573E6A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  nextButtonTextDisabled: {
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});