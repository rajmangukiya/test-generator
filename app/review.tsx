import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function ReviewTest() {
  const { quizId } = useLocalSearchParams();
  const [quizResult, setQuizResult] = useState<SavedQuizResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadQuizResult();
  }, []);

  const loadQuizResult = async () => {
    try {
      const existingQuizzes = await AsyncStorage.getItem('quiz_results');
      if (existingQuizzes) {
        const quizzes: SavedQuizResult[] = JSON.parse(existingQuizzes);
        const quiz = quizzes.find(q => q.id === quizId);
        if (quiz) {
          setQuizResult(quiz);
          // Check if quiz has stored questions, otherwise use static questions
          if (quiz.questions && quiz.questions.length > 0) {
            setQuestions(quiz.questions);
          } else {
            setQuestions([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading quiz result:', error);
    }
  };

  const renderAnswer = (question: Question, questionIndex: number) => {
    if (!quizResult) return null;

    const userAnswer = quizResult.userAnswers[questionIndex];
    const correctAnswer = question.correctAnswer;
    const isUnanswered = userAnswer === -1;
    const isCorrect = !isUnanswered && userAnswer === correctAnswer;

    return (
      <View style={styles.answersContainer}>
        {question.options.map((option, optionIndex) => {
          const isUserAnswer = !isUnanswered && userAnswer === optionIndex;
          const isCorrectAnswer = correctAnswer === optionIndex;

          let optionStyle = styles.optionDefault;
          let textStyle = styles.optionTextDefault;
          let indicator = '';

          if (isUserAnswer && isCorrect) {
            // User selected correct answer
            optionStyle = styles.optionCorrect;
            textStyle = styles.optionTextCorrect;
            indicator = '✓';
          } else if (isUserAnswer && !isCorrect) {
            // User selected wrong answer
            optionStyle = styles.optionWrong;
            textStyle = styles.optionTextWrong;
            indicator = '✗';
          } else if (isCorrectAnswer && (!isCorrect || isUnanswered)) {
            // Show correct answer when user was wrong or didn't answer
            optionStyle = styles.optionCorrectAnswer;
            textStyle = styles.optionTextCorrect;
            indicator = '✓';
          }

          return (
            <View key={optionIndex} style={[styles.optionContainer, optionStyle]}>
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, textStyle]}>{option}</Text>
                {indicator && (
                  <Text style={[styles.indicator,
                    indicator === '✓' ? styles.correctIndicator : styles.wrongIndicator
                  ]}>
                    {indicator}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (!quizResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz review...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backButtonContent}>
            <Text style={styles.backButtonIcon}>←</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Review</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Quiz Info Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Topic:</Text>
          <Text style={styles.summaryValue}>{quizResult.topic}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Score:</Text>
          <Text style={[styles.summaryValue, styles.scoreText]}>
            {quizResult.score}/{quizResult.totalQuestions} ({Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%)
          </Text>
        </View>
        {quizResult.isPartial && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <Text style={[styles.summaryValue, styles.partialText]}>
              Partial - {quizResult.answeredQuestions || 0}/{quizResult.totalQuestions} questions answered
            </Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{quizResult.dateTaken}</Text>
        </View>
      </View>

      {/* Questions and Answers */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {questions.map((question, index) => {
          const userAnswer = quizResult.userAnswers[index];
          const isUnanswered = userAnswer === -1;
          const isCorrect = !isUnanswered && userAnswer === question.correctAnswer;

          let badgeStyle = styles.wrongBadge;
          let badgeText = '✗ Wrong';

          if (isUnanswered) {
            badgeStyle = styles.unansweredBadge;
            badgeText = '? Unanswered';
          } else if (isCorrect) {
            badgeStyle = styles.correctBadge;
            badgeText = '✓ Correct';
          }

          return (
            <View key={question.id} style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                <View style={[styles.resultBadge, badgeStyle]}>
                  <Text style={styles.resultBadgeText}>
                    {badgeText}
                  </Text>
                </View>
              </View>

              <Text style={styles.questionText}>{question.question}</Text>

              {renderAnswer(question, index)}
            </View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  backButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonIcon: {
    fontSize: 18,
    color: "#666",
    marginRight: 6,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 70,
  },
  summaryContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  scoreText: {
    color: "#573E6A",
  },
  partialText: {
    color: "#FF9800",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
  questionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#573E6A",
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  correctBadge: {
    backgroundColor: "#d4edda",
  },
  wrongBadge: {
    backgroundColor: "#f8d7da",
  },
  unansweredBadge: {
    backgroundColor: "#fff3cd",
  },
  resultBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 18,
    color: "#333",
    lineHeight: 26,
    marginBottom: 16,
    fontWeight: "500",
  },
  answersContainer: {
    gap: 12,
  },
  optionContainer: {
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
  },
  optionDefault: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e0e0e0",
  },
  optionCorrect: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
  },
  optionWrong: {
    backgroundColor: "#f8d7da",
    borderColor: "#dc3545",
  },
  optionCorrectAnswer: {
    backgroundColor: "#d1ecf1",
    borderColor: "#17a2b8",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  optionTextDefault: {
    color: "#666",
  },
  optionTextCorrect: {
    color: "#155724",
    fontWeight: "500",
  },
  optionTextWrong: {
    color: "#721c24",
    fontWeight: "500",
  },
  indicator: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  correctIndicator: {
    color: "#28a745",
  },
  wrongIndicator: {
    color: "#dc3545",
  },
  bottomSpacer: {
    height: 40,
  },
});