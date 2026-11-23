/**
 * Curriculum & Subject Catalogs (Grades 1 to 10)
 * - Kerala State Syllabus
 * - CBSE (Central Board of Secondary Education)
 * Fully customizable and editable by Parent / Admin.
 */

const SYLLABUS_TYPES = {
  kerala: {
    id: 'kerala',
    name: 'Kerala State Syllabus',
    shortName: 'Kerala State',
    icon: '🌴'
  },
  cbse: {
    id: 'cbse',
    name: 'CBSE (Central Board)',
    shortName: 'CBSE',
    icon: '🏛️'
  }
};

const DEFAULT_KERALA_SYLLABUS = {
  1: [
    { id: 'mal',  name: 'Malayalam (കളിത്തോണി)', icon: '📖', color: '#10b981' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'mat',  name: 'Mathematics (ഗണിതം)', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (പരിസരപഠനം)', icon: '🌱', color: '#06b6d4' },
    { id: 'art',  name: 'Art & Physical Education', icon: '🎨', color: '#ec4899' }
  ],
  2: [
    { id: 'mal',  name: 'Malayalam', icon: '📖', color: '#10b981' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (EVS)', icon: '🌱', color: '#06b6d4' },
    { id: 'art',  name: 'Art & Physical Education', icon: '🎨', color: '#ec4899' }
  ],
  3: [
    { id: 'mal',  name: 'Malayalam', icon: '📖', color: '#10b981' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (EVS)', icon: '🌱', color: '#06b6d4' },
    { id: 'art',  name: 'Art, Craft & Health', icon: '🎨', color: '#ec4899' }
  ],
  4: [
    { id: 'mal',  name: 'Malayalam', icon: '📖', color: '#10b981' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (EVS)', icon: '🌱', color: '#06b6d4' },
    { id: 'art',  name: 'Art, Craft & Health', icon: '🎨', color: '#ec4899' }
  ],
  5: [
    { id: 'mal1', name: 'Malayalam I (Adisthana Padavali)', icon: '📖', color: '#10b981' },
    { id: 'mal2', name: 'Malayalam II (Kerala Padavali)', icon: '📚', color: '#059669' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',  name: 'Basic Science (അടിസ്ഥാന ശാസ്ത്രം)', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',  name: 'Social Science (സാമൂഹ്യശാസ്ത്രം)', icon: '🌍', color: '#d97706' },
    { id: 'art',  name: 'Art, Health & Physical Education', icon: '🏃', color: '#ec4899' }
  ],
  6: [
    { id: 'mal1', name: 'Malayalam I', icon: '📖', color: '#10b981' },
    { id: 'mal2', name: 'Malayalam II', icon: '📚', color: '#059669' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',  name: 'Basic Science', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',  name: 'Social Science', icon: '🌍', color: '#d97706' },
    { id: 'art',  name: 'Art & Physical Education', icon: '🏃', color: '#ec4899' }
  ],
  7: [
    { id: 'mal1', name: 'Malayalam I (Adisthana Padavali)', icon: '📖', color: '#10b981' },
    { id: 'mal2', name: 'Malayalam II (Kerala Padavali)', icon: '📚', color: '#059669' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',  name: 'Basic Science', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',  name: 'Social Science', icon: '🌍', color: '#d97706' },
    { id: 'ict',  name: 'Information Technology (IT)', icon: '💻', color: '#6366f1' },
    { id: 'pe',   name: 'Physical Education & Health', icon: '🏃', color: '#ec4899' }
  ],
  8: [
    { id: 'mal1', name: 'Malayalam I', icon: '📖', color: '#10b981' },
    { id: 'mal2', name: 'Malayalam II', icon: '📚', color: '#059669' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'phy',  name: 'Physics (ഭൗതികശാസ്ത്രം)', icon: '⚡', color: '#0284c7' },
    { id: 'che',  name: 'Chemistry (രസതന്ത്രം)', icon: '🧪', color: '#14b8a6' },
    { id: 'bio',  name: 'Biology (ജീവശാസ്ത്രം)', icon: '🌿', color: '#22c55e' },
    { id: 'soc1', name: 'Social Science I (History & Civics)', icon: '🏛️', color: '#d97706' },
    { id: 'soc2', name: 'Social Science II (Geography & Economics)', icon: '🌐', color: '#b45309' },
    { id: 'ict',  name: 'Information Technology (IT)', icon: '💻', color: '#6366f1' }
  ],
  9: [
    { id: 'mal1', name: 'Malayalam I', icon: '📖', color: '#10b981' },
    { id: 'mal2', name: 'Malayalam II', icon: '📚', color: '#059669' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'phy',  name: 'Physics', icon: '⚡', color: '#0284c7' },
    { id: 'che',  name: 'Chemistry', icon: '🧪', color: '#14b8a6' },
    { id: 'bio',  name: 'Biology', icon: '🌿', color: '#22c55e' },
    { id: 'soc1', name: 'Social Science I (History & Civics)', icon: '🏛️', color: '#d97706' },
    { id: 'soc2', name: 'Social Science II (Geography & Economics)', icon: '🌐', color: '#b45309' },
    { id: 'ict',  name: 'Information Technology (IT)', icon: '💻', color: '#6366f1' }
  ],
  10: [
    { id: 'mal1', name: 'Malayalam I (SSLC)', icon: '📖', color: '#10b981' },
    { id: 'mal2', name: 'Malayalam II (SSLC)', icon: '📚', color: '#059669' },
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'phy',  name: 'Physics', icon: '⚡', color: '#0284c7' },
    { id: 'che',  name: 'Chemistry', icon: '🧪', color: '#14b8a6' },
    { id: 'bio',  name: 'Biology', icon: '🌿', color: '#22c55e' },
    { id: 'soc1', name: 'Social Science I (History & Civics)', icon: '🏛️', color: '#d97706' },
    { id: 'soc2', name: 'Social Science II (Geography & Economics)', icon: '🌐', color: '#b45309' },
    { id: 'ict',  name: 'Information Technology (IT)', icon: '💻', color: '#6366f1' }
  ]
};

const DEFAULT_CBSE_SYLLABUS = {
  1: [
    { id: 'eng',  name: 'English (Mridang / Marigold)', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi (Sarangi / Rimjhim)', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics (Joyful Maths)', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (EVS)', icon: '🌱', color: '#06b6d4' },
    { id: 'art',  name: 'Art & Craft / Drawing', icon: '🎨', color: '#ec4899' },
    { id: 'gk',   name: 'General Knowledge & Values', icon: '💡', color: '#10b981' }
  ],
  2: [
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (EVS)', icon: '🌱', color: '#06b6d4' },
    { id: 'comp', name: 'Computer Basics', icon: '💻', color: '#6366f1' },
    { id: 'art',  name: 'Art & Physical Education', icon: '🎨', color: '#ec4899' }
  ],
  3: [
    { id: 'eng',  name: 'English (Santoor)', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi (Veena)', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics (Maths Mela)', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (Our Wondrous World)', icon: '🌱', color: '#06b6d4' },
    { id: 'comp', name: 'Computer Science', icon: '💻', color: '#6366f1' },
    { id: 'art',  name: 'Art & Craft', icon: '🎨', color: '#ec4899' }
  ],
  4: [
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies (EVS)', icon: '🌱', color: '#06b6d4' },
    { id: 'comp', name: 'Computer Science', icon: '💻', color: '#6366f1' },
    { id: 'gk',   name: 'General Knowledge & Moral Science', icon: '💡', color: '#10b981' }
  ],
  5: [
    { id: 'eng',  name: 'English', icon: '📝', color: '#3b82f6' },
    { id: 'hin',  name: 'Hindi', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'mat',  name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'evs',  name: 'Environmental Studies / Science', icon: '🌱', color: '#06b6d4' },
    { id: 'soc',  name: 'Social Studies', icon: '🌍', color: '#d97706' },
    { id: 'comp', name: 'Computer Science & Coding', icon: '💻', color: '#6366f1' }
  ],
  6: [
    { id: 'eng',   name: 'English (Honeyysuckle / Poorvi)', icon: '📝', color: '#3b82f6' },
    { id: 'hin',   name: 'Hindi (Vasant / Malhar)', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'lang3', name: 'Third Language (Malayalam / Sanskrit)', icon: '📖', color: '#10b981' },
    { id: 'mat',   name: 'Mathematics (Ganita Prakash)', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',   name: 'Science (Curiosity / NCERT)', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',   name: 'Social Science (Exploring Society)', icon: '🌍', color: '#d97706' },
    { id: 'comp',  name: 'Computer & AI', icon: '💻', color: '#6366f1' }
  ],
  7: [
    { id: 'eng',   name: 'English (Honeycomb / Alien Hand)', icon: '📝', color: '#3b82f6' },
    { id: 'hin',   name: 'Hindi (Vasant / Bal Mahabharat)', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'lang3', name: 'Third Language (Malayalam / Sanskrit)', icon: '📖', color: '#10b981' },
    { id: 'mat',   name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',   name: 'Science (Physics, Chemistry, Biology)', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',   name: 'Social Science (History, Civics, Geography)', icon: '🌍', color: '#d97706' },
    { id: 'comp',  name: 'Computer Science & Artificial Intelligence', icon: '💻', color: '#6366f1' }
  ],
  8: [
    { id: 'eng',   name: 'English (Honeydew / It So Happened)', icon: '📝', color: '#3b82f6' },
    { id: 'hin',   name: 'Hindi (Vasant / Bharat Ki Khoj)', icon: '🇮🇳', color: '#f59e0b' },
    { id: 'lang3', name: 'Third Language (Malayalam / Sanskrit)', icon: '📖', color: '#10b981' },
    { id: 'mat',   name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',   name: 'Science', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',   name: 'Social Science (Our Pasts, Resources, Law)', icon: '🌍', color: '#d97706' },
    { id: 'comp',  name: 'Computer Science & AI', icon: '💻', color: '#6366f1' }
  ],
  9: [
    { id: 'eng',   name: 'English Language & Literature (Beehive & Moments)', icon: '📝', color: '#3b82f6' },
    { id: 'lang2', name: 'Second Language (Malayalam / Hindi-A / Sanskrit)', icon: '📖', color: '#10b981' },
    { id: 'mat',   name: 'Mathematics (Standard / Basic)', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',   name: 'Science (Physics, Chemistry & Biology)', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',   name: 'Social Science (India & Contemporary World, Dem Politics)', icon: '🌍', color: '#d97706' },
    { id: 'it',    name: 'Information Technology (Skill Sub 402) / AI', icon: '💻', color: '#6366f1' }
  ],
  10: [
    { id: 'eng',   name: 'English Language & Literature (First Flight & Footprints)', icon: '📝', color: '#3b82f6' },
    { id: 'lang2', name: 'Second Language (Malayalam / Hindi Course A / Sanskrit)', icon: '📖', color: '#10b981' },
    { id: 'mat',   name: 'Mathematics (Standard / Basic)', icon: '📐', color: '#8b5cf6' },
    { id: 'sci',   name: 'Science (Theory & Lab Practical)', icon: '🔬', color: '#06b6d4' },
    { id: 'soc',   name: 'Social Science (History, Geography, Pol Science, Economics)', icon: '🌍', color: '#d97706' },
    { id: 'it',    name: 'Information Technology (IT 402) / AI', icon: '💻', color: '#6366f1' }
  ]
};

const DEFAULT_TASK_CATEGORIES = [
  { id: 'reading', label: 'Reading & Understanding', icon: '📖', defaultPoints: 5 },
  { id: 'homework', label: 'Homework / Writing Exercise', icon: '✍️', defaultPoints: 10 },
  { id: 'examprep', label: 'Exam / Test Preparation', icon: '🎯', defaultPoints: 15 },
  { id: 'revision', label: 'Revision & Memorization', icon: '🧠', defaultPoints: 5 },
  { id: 'project', label: 'Project / Activity', icon: '🎨', defaultPoints: 10 }
];
