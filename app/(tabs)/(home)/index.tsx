import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const mockTests = [
  {
    id: 1,
    topic: "JavaScript Fundamentals",
    difficulty: "Beginner",
    questionsCount: 10,
    score: 8,
    totalQuestions: 10,
    dateTaken: "2024-01-15",
    experienceLevel: "Junior"
  },
  {
    id: 2,
    topic: "React Hooks",
    difficulty: "Intermediate",
    questionsCount: 15,
    score: 12,
    totalQuestions: 15,
    dateTaken: "2024-01-14",
    experienceLevel: "Mid-level"
  },
  {
    id: 3,
    topic: "Node.js Backend",
    difficulty: "Advanced",
    questionsCount: 20,
    score: 14,
    totalQuestions: 20,
    dateTaken: "2024-01-12",
    experienceLevel: "Senior"
  }
];

export default function Index() {
  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "#4CAF50";
    if (percentage >= 60) return "#FF9800";
    return "#F44336";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Previously Generated Tests</Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mockTests.map((test) => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.topicText}>{test.topic}</Text>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{test.difficulty}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Experience Level:</Text>
                <Text style={styles.infoValue}>{test.experienceLevel}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Questions:</Text>
                <Text style={styles.infoValue}>{test.questionsCount}</Text>
              </View>

              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(test.score, test.totalQuestions) }]}>
                  {test.score}/{test.totalQuestions} ({Math.round((test.score / test.totalQuestions) * 100)}%)
                </Text>
              </View>

              <Text style={styles.dateText}>Taken on {test.dateTaken}</Text>
            </View>

            <TouchableOpacity style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>Review Test</Text>
            </TouchableOpacity>
          </View>
        ))}
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
});
