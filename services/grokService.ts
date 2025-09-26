import Groq from "groq-sdk";
import Constants from 'expo-constants';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizGenerationParams {
  topic: string;
  difficulty: string;
  experienceLevel: string;
  questionCount: number;
}

class GrokService {
  private apiKey: string = Constants.expoConfig?.extra?.grokApiKey || '';

  private groq = new Groq({ apiKey: this.apiKey })

  async generateQuiz(params: QuizGenerationParams): Promise<Question[]> {
    // For now, return random questions until API key is provided

    try {
      const prompt = this.createPrompt(params);

      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert quiz generator. Generate quiz questions in valid JSON format only. Do not include any explanations or additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        stream: false,
        model: "openai/gpt-oss-20b",
        // model: "grok-beta",
      });

      const content = response.choices[0].message.content;

      // Parse the JSON response
      const parsedQuestions = JSON.parse(content || "{}");

      // Validate and format questions
      const formatedQuestions = this.formatQuestions(parsedQuestions.questions || parsedQuestions);

      return formatedQuestions
    } catch (error) {
      console.error('Error generating quiz with Grok:', error);
      // Fallback to random questions
      return this.generateRandomQuestions(params);
    }
  }

  private createPrompt(params: QuizGenerationParams): string {
    return `Generate ${params.questionCount} multiple choice questions about ${params.topic} for someone with ${params.experienceLevel} experience level at ${params.difficulty} difficulty.

Requirements:
- Each question should have exactly 4 options
- Only one option should be correct
- Questions should be relevant to software engineering
- Difficulty should match the specified level
- Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}

The correctAnswer field should be the index (0-3) of the correct option in the options array.`;
  }

  private formatQuestions(questions: any[]): Question[] {
    return questions.map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
  }

  private generateRandomQuestions(params: QuizGenerationParams): Question[] {
    const questionPools = {
      JavaScript: [
        {
          question: "What is the purpose of the useState hook in React?",
          options: ["To manage component state", "To handle side effects", "To optimize performance", "To create components"],
          correctAnswer: 0
        },
        {
          question: "Which of the following is a valid way to declare a variable in JavaScript?",
          options: ["variable x = 5;", "var x = 5;", "declare x = 5;", "x := 5;"],
          correctAnswer: 1
        },
        {
          question: "What does the '===' operator do in JavaScript?",
          options: ["Assigns a value", "Compares values only", "Compares values and types", "Creates a function"],
          correctAnswer: 2
        },
        {
          question: "Which method is used to add an element to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correctAnswer: 0
        },
        {
          question: "What is the difference between 'let' and 'var' in JavaScript?",
          options: ["No difference", "let has block scope, var has function scope", "var is newer than let", "let is faster than var"],
          correctAnswer: 1
        }
      ],
      Python: [
        {
          question: "Which of the following is used to create a virtual environment in Python?",
          options: ["pip install venv", "python -m venv", "create venv", "virtual env"],
          correctAnswer: 1
        },
        {
          question: "What does the 'self' parameter represent in Python class methods?",
          options: ["The class itself", "The instance of the class", "A static variable", "The parent class"],
          correctAnswer: 1
        },
        {
          question: "Which Python data structure is ordered and mutable?",
          options: ["tuple", "set", "list", "frozenset"],
          correctAnswer: 2
        },
        {
          question: "What is the correct way to handle exceptions in Python?",
          options: ["try-catch", "try-except", "catch-throw", "handle-error"],
          correctAnswer: 1
        },
        {
          question: "Which of the following is NOT a valid Python data type?",
          options: ["int", "float", "char", "str"],
          correctAnswer: 2
        }
      ],
      React: [
        {
          question: "What is JSX in React?",
          options: ["A JavaScript library", "A syntax extension for JavaScript", "A CSS framework", "A database"],
          correctAnswer: 1
        },
        {
          question: "Which hook is used for side effects in functional components?",
          options: ["useState", "useEffect", "useContext", "useReducer"],
          correctAnswer: 1
        },
        {
          question: "What is the virtual DOM?",
          options: ["A real DOM element", "A JavaScript representation of the DOM", "A CSS selector", "An HTML template"],
          correctAnswer: 1
        },
        {
          question: "How do you pass data from parent to child component?",
          options: ["Using state", "Using props", "Using context", "Using refs"],
          correctAnswer: 1
        },
        {
          question: "What is the purpose of React.Fragment?",
          options: ["To create components", "To group elements without extra DOM nodes", "To handle state", "To make API calls"],
          correctAnswer: 1
        }
      ]
    };

    // Get questions for the specific topic or use JavaScript as default
    const topicQuestions = questionPools[params.topic as keyof typeof questionPools] || questionPools.JavaScript;

    // Shuffle and select the requested number of questions
    const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, params.questionCount);

    // Add unique IDs
    return selectedQuestions.map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
  }
}

export const grokService = new GrokService();
export type { Question, QuizGenerationParams };
