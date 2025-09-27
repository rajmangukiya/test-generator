import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { grokService, Question } from '../../services/grokService';

const softwareEngineeringTopics = [
  "JavaScript", "Python", "Java", "React", "Node.js", "TypeScript", "C++", "C#", "PHP", "Ruby",
  "Go", "Rust", "Swift", "Kotlin", "Flutter", "React Native", "Vue.js", "Angular", "Express.js", "Django",
  "Flask", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails", "Next.js", "Nuxt.js", "Svelte", "HTML/CSS", "SASS/SCSS",
  "Bootstrap", "Tailwind CSS", "Material-UI", "Styled Components", "Redux", "MobX", "Vuex", "Context API", "GraphQL", "REST API",
  "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Firebase", "AWS", "Azure", "Google Cloud", "Docker",
  "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab", "Jest", "Cypress", "Selenium", "JUnit", "Mocha",
  "Webpack", "Vite", "Rollup", "Babel", "ESLint", "Prettier", "NPM", "Yarn", "PNPM", "Microservices",
  "Serverless", "API Design", "Database Design", "System Design", "Data Structures", "Algorithms", "Design Patterns", "SOLID Principles", "Clean Code", "Agile/Scrum",
  "Testing", "TDD", "BDD", "Security", "Authentication", "Authorization", "OAuth", "JWT", "Encryption", "Performance Optimization",
  "Caching", "Load Balancing", "Monitoring", "Logging", "Debugging", "Code Review", "Version Control", "DevOps", "Linux", "Shell Scripting",
  "Regular Expressions", "JSON", "XML", "YAML", "Web Sockets", "Progressive Web Apps", "Mobile Development", "Cross-platform Development", "Machine Learning", "AI Integration"
];

const difficultyLevels = [
  { id: 'beginner', title: 'Beginner', subtitle: 'Basic concepts and syntax', color: '#4CAF50' },
  { id: 'intermediate', title: 'Intermediate', subtitle: 'Practical applications', color: '#FF9800' },
  { id: 'advanced', title: 'Advanced', subtitle: 'Complex scenarios', color: '#F44336' },
  { id: 'expert', title: 'Expert', subtitle: 'Industry best practices', color: '#9C27B0' }
];

const SLIDER_WIDTH = Dimensions.get('window').width - 80; // Account for padding

export default function GenerateQuiz() {
  const [selectedTopic, setSelectedTopic] = useState(softwareEngineeringTopics[0]);
  const [experience, setExperience] = useState(2);
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const sliderRef = useRef(null);

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return softwareEngineeringTopics;
    return softwareEngineeringTopics.filter(topic =>
      topic.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX } = event.nativeEvent;
      updateExperience(locationX);
    },
    onPanResponderMove: (event) => {
      const { locationX } = event.nativeEvent;
      updateExperience(locationX);
    },
    onPanResponderRelease: () => {
      // Optional: Add haptic feedback here if needed
    },
  });

  const updateExperience = (locationX: number) => {
    const percentage = Math.max(0, Math.min(1, locationX / SLIDER_WIDTH));
    const newExperience = Math.round(percentage * 30);
    setExperience(newExperience);
  };

  const getExperienceLevel = (years: number): string => {
    if (years === 0) return 'Beginner';
    if (years <= 2) return 'Junior';
    if (years <= 5) return 'Mid-level';
    if (years <= 10) return 'Senior';
    return 'Expert';
  };

  const handleGenerate = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsGenerating(true);
    setQuizGenerated(false);

    try {
      const questions = await grokService.generateQuiz({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        experienceLevel: getExperienceLevel(experience),
        questionCount: 5
      });

      setGeneratedQuestions(questions);
      setQuizGenerated(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate quiz. Please try again.');
      console.error('Quiz generation error:', error);
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = () => {
    // Close the modal
    setIsGenerating(false);
    setQuizGenerated(false);

    // Navigate to quiz screen with generated questions
    router.push({
      pathname: '/quiz',
      params: {
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        experience: experience.toString(),
        questions: JSON.stringify(generatedQuestions)
      }
    });
  };


  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Text style={styles.title}>Generate New Quiz</Text>

        {/* Topic Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Topic</Text>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowTopicPicker(true)}
          >
            <Text style={styles.pickerText}>{selectedTopic}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Experience Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Experience</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.experienceValue}>{experience} years</Text>
            <View style={styles.customSlider}>
              <View
                ref={sliderRef}
                style={[styles.sliderTouchArea, { width: SLIDER_WIDTH }]}
                {...panResponder.panHandlers}
              >
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderProgress, { width: `${(experience / 30) * 100}%` }]} />
                  <View style={[styles.sliderThumb, { left: `${(experience / 30) * 100}%` }]} />
                </View>
              </View>
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0 years</Text>
              <Text style={styles.sliderLabel}>30 years</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {difficultyLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.difficultyCard,
                  selectedDifficulty === level.id && styles.selectedDifficultyCard,
                  { borderColor: level.color }
                ]}
                onPress={() => setSelectedDifficulty(level.id)}
              >
                <View style={[styles.difficultyIndicator, { backgroundColor: level.color }]} />
                <Text style={[
                  styles.difficultyTitle,
                  selectedDifficulty === level.id && styles.selectedDifficultyTitle
                ]}>
                  {level.title}
                </Text>
                <Text style={[
                  styles.difficultySubtitle,
                  selectedDifficulty === level.id && styles.selectedDifficultySubtitle
                ]}>
                  {level.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Text style={styles.generateButtonText}>Generate Quiz</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Topic Picker Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showTopicPicker}
        onRequestClose={() => {
          setShowTopicPicker(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowTopicPicker(false);
              setSearchQuery('');
            }}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Select Topic</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search topics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          <FlatList
            data={filteredTopics}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.topicItem,
                  selectedTopic === item && styles.selectedTopicItem
                ]}
                onPress={() => {
                  setSelectedTopic(item);
                  setShowTopicPicker(false);
                  setSearchQuery('');
                }}
              >
                <Text style={[
                  styles.topicItemText,
                  selectedTopic === item && styles.selectedTopicItemText
                ]}>
                  {item}
                </Text>
                {selectedTopic === item && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No topics found</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Quiz Generation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isGenerating}
        onRequestClose={() => {
          if (quizGenerated) {
            setIsGenerating(false);
            setQuizGenerated(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {quizGenerated ? "Quiz Ready!" : "Generating Quiz..."}
            </Text>
            <Text style={styles.modalSubtitle}>
              {quizGenerated
                ? "Your personalized quiz is ready to start!"
                : "Please wait while we create your personalized quiz"
              }
            </Text>

            <View style={styles.quizInfoContainer}>
              <Text style={styles.quizInfoItem}>- Topic: {selectedTopic}</Text>
              <Text style={styles.quizInfoItem}>- Difficulty: {selectedDifficulty}</Text>
              <Text style={styles.quizInfoItem}>- Experience: {experience} years</Text>
              <Text style={styles.quizInfoItem}>- Questions: 5</Text>
            </View>

            {!quizGenerated && (
              <View style={styles.loadingSpinner}>
                <Text style={styles.loadingText}>🎯</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.startQuizButton,
                !quizGenerated && styles.startQuizButtonDisabled
              ]}
              onPress={handleStartQuiz}
              disabled={!quizGenerated}
            >
              <Text style={[
                styles.startQuizButtonText,
                !quizGenerated && styles.startQuizButtonTextDisabled
              ]}>
                Start Quiz
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#573E6A",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: "#573E6A",
  },
  sliderContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  experienceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#573E6A",
    textAlign: "center",
    marginBottom: 15,
  },
  customSlider: {
    marginBottom: 15,
    position: "relative",
  },
  sliderTouchArea: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    position: "relative",
    width: "100%",
  },
  sliderProgress: {
    height: "100%",
    backgroundColor: "#573E6A",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    top: -8,
    width: 22,
    height: 22,
    backgroundColor: "#573E6A",
    borderRadius: 11,
    marginLeft: -11,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#666",
  },
  difficultyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  difficultyCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  selectedDifficultyCard: {
    backgroundColor: "#f8f9ff",
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
    shadowColor: "#573E6A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  difficultyIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  difficultyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectedDifficultyTitle: {
    color: "#573E6A",
  },
  difficultySubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  selectedDifficultySubtitle: {
    color: "#573E6A",
  },
  generateButton: {
    backgroundColor: "#573E6A",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  generateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#573E6A",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingSpinner: {
    marginTop: 10,
  },
  loadingText: {
    fontSize: 30,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginTop: 40,
  },
  modalCloseButton: {
    fontSize: 18,
    color: "#573E6A",
    fontWeight: "bold",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  topicItem: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedTopicItem: {
    backgroundColor: "#f8f9ff",
  },
  topicItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedTopicItemText: {
    color: "#573E6A",
    fontWeight: "500",
  },
  checkMark: {
    fontSize: 16,
    color: "#573E6A",
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  quizInfoContainer: {
    marginVertical: 20,
    alignItems: "flex-start",
    width: "100%",
  },
  quizInfoItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  startQuizButton: {
    backgroundColor: "#573E6A",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    minWidth: 150,
  },
  startQuizButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  startQuizButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  startQuizButtonTextDisabled: {
    color: "#999",
  },
});