import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

export default function Index() {
  const [savedTests, setSavedTests] = useState<SavedQuizResult[]>([]);

  const loadSavedTests = async () => {
    try {
      const existingQuizzes = await AsyncStorage.getItem('quiz_results');
      if (existingQuizzes) {
        const quizzes: SavedQuizResult[] = JSON.parse(existingQuizzes);
        setSavedTests(quizzes);
      }
    } catch (error) {
      console.error('Error loading saved tests:', error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadSavedTests();
  }, []);

  // Reload data when screen comes into focus (when user returns from quiz)
  useFocusEffect(
    useCallback(() => {
      loadSavedTests();
    }, [])
  );

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "#4CAF50";
    if (percentage >= 60) return "#FF9800";
    return "#F44336";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Previously Taken Tests</Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {savedTests.length === 0 ? (
          <View style={styles.emptyState}>
            <TouchableOpacity
              style={styles.createQuizButton}
              onPress={() => router.push('/(tabs)/generate')}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.bigIcon}>🧠</Text>
              </View>
              <Text style={styles.createButtonTitle}>Generate Your First Quiz</Text>
              <Text style={styles.createButtonSubtitle}>
                Tap to create a personalized quiz with AI-powered questions
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedTests.map((test) => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.topicText}>{test.topic}</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{test.difficulty}</Text>
                </View>
                {test.isPartial && (
                  <View style={styles.partialBadge}>
                    <Text style={styles.partialBadgeText}>Partial</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Experience Level:</Text>
                <Text style={styles.infoValue}>{test.experienceLevel}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Questions:</Text>
                <Text style={styles.infoValue}>
                  {test.isPartial
                    ? `${test.answeredQuestions || 0}/${test.questionsCount} answered`
                    : test.questionsCount
                  }
                </Text>
              </View>

              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(test.score, test.totalQuestions) }]}>
                  {test.score}/{test.totalQuestions} ({Math.round((test.score / test.totalQuestions) * 100)}%)
                </Text>
              </View>

              <Text style={styles.dateText}>Taken on {test.dateTaken}</Text>
            </View>

            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => router.push(`/review?quizId=${test.id}`)}
            >
              <Text style={styles.reviewButtonText}>Review Test</Text>
            </TouchableOpacity>
          </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#573E6A",
    textAlign: "center",
    marginBottom: 20,
},
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  testCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  topicText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: "#573E6A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  partialBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  partialBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  cardBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  partialNote: {
    fontSize: 14,
    color: "#FF9800",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  reviewButton: {
    backgroundColor: "#573E6A",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#573E6A",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  createQuizButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#573E6A",
    minWidth: 280,
  },
  iconContainer: {
    backgroundColor: "#f8f9ff",
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#573E6A",
  },
  bigIcon: {
    fontSize: 60,
    textAlign: "center",
  },
  createButtonTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#573E6A",
    marginBottom: 12,
    textAlign: "center",
  },
  createButtonSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 240,
  },
});
