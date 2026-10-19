export type GradeLevel = 'Class 8' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';

export type StudentStream = 'PCM' | 'PCB' | 'COMMERCE' | 'ARTS';

export interface DailyHistoryRecord {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  grade: GradeLevel;
  stream?: StudentStream; // Applicable only for Class 11 and Class 12
  target_percentage: number; // e.g. 95
  current_xp: number;
  streak_days: number;
  last_active_date?: string;
  onboarding_completed: boolean;
  created_at: string;
  is_premium?: boolean;
}

export interface TodoTask {
  id: string;
  user_id: string;
  text: string;
  subject: string;
  completed: boolean;
  xp_reward: number;
  day_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface StudyKitResponse {
  summary: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface StudyMaterial {
  id: string;
  user_id: string;
  title: string;
  raw_content: string;
  summary: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  created_at: string;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface ChatAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  base64Data: string; // Base64 string without data url prefix
  previewUrl: string; // Complete data URL for display
}

export interface ChatStudyKitArtifact {
  title: string;
  summary: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  attachments?: ChatAttachment[];
  studyKit?: ChatStudyKitArtifact;
  timestamp: string;
}

export interface NextDayStatus {
  todayDate: string;
  tomorrowDate: string;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  isCheckInEligible: boolean;
  nextDayTasksReady: boolean;
  nextDayTasks: TodoTask[];
}
