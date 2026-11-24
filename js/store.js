/**
 * Unified Storage Adapter
 * Stores data locally in localStorage with Task Editing, Parent Approval Workflow, and History.
 */

const ENV_PREFIX = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? 'kst_demo_' : 'kst_prod_';

const STORAGE_KEYS = {
  FAMILIES: ENV_PREFIX + 'families',
  USERS: ENV_PREFIX + 'users',
  TASKS: ENV_PREFIX + 'tasks',
  REWARDS: ENV_PREFIX + 'rewards',
  CURRENT_USER_ID: ENV_PREFIX + 'current_user_id',
  SYLLABUS: ENV_PREFIX + 'syllabus',
  CATEGORIES: ENV_PREFIX + 'categories'
};

const SESSION_KEYS = {
  ACTIVE_USER_ID: ENV_PREFIX + 'session_user_id'
};

// Default seed families
const SEED_FAMILIES = [
  {
    id: 'fam_101',
    name: "Rajeev's Family",
    code: 'KIDS101',
    parentEmail: 'kidsstudytracker@gmail.com',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fam_202',
    name: "Anand's Family",
    code: 'KIDS202',
    parentEmail: 'anand.parent@gmail.com',
    createdAt: new Date().toISOString()
  }
];

// Default seed users with Family ID isolation
const SEED_USERS = [
  // Family 1 (Code: KIDS101)
  {
    id: 'user_parent',
    familyId: 'fam_101',
    name: 'Rajeev (Parent)',
    email: 'kidsstudytracker@gmail.com',
    role: 'parent',
    pin: '9999',
    avatar: '👨‍👩‍👧‍👦'
  },
  {
    id: 'user_child_1',
    familyId: 'fam_101',
    name: 'Arjun',
    role: 'child',
    pin: '1234',
    grade: 7,
    syllabus: 'Kerala State Syllabus',
    avatar: '👦',
    weeklyPoints: 65,
    totalPoints: 240
  },
  {
    id: 'user_child_2',
    familyId: 'fam_101',
    name: 'Meera',
    role: 'child',
    pin: '1111',
    grade: 4,
    syllabus: 'Kerala State Syllabus',
    avatar: '👧',
    weeklyPoints: 50,
    totalPoints: 190
  },
  // Family 2 (Code: KIDS202)
  {
    id: 'user_parent_2',
    familyId: 'fam_202',
    name: 'Anand (Parent)',
    email: 'anand.parent@gmail.com',
    role: 'parent',
    pin: '8888',
    avatar: '👨‍🏫'
  },
  {
    id: 'user_child_3',
    familyId: 'fam_202',
    name: 'Appu',
    role: 'child',
    pin: '5555',
    grade: 5,
    syllabus: 'CBSE',
    avatar: '🧒',
    weeklyPoints: 40,
    totalPoints: 120
  }
];

function getFormattedDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const TODAY_STR = getFormattedDate();
const YESTERDAY_DATE = new Date(Date.now() - 86400000);
const YESTERDAY_STR = getFormattedDate(YESTERDAY_DATE);

const SEED_TASKS = [
  // Family 1 Tasks (KIDS101)
  {
    id: 't_1',
    familyId: 'fam_101',
    childId: 'user_child_1',
    subjectName: 'Mathematics',
    subjectIcon: '📐',
    taskType: 'homework',
    taskTypeName: 'Homework / Writing Exercise',
    title: 'Chapter 3: Complete Exercise 3.2 (Problems 1 to 5)',
    points: 10,
    date: TODAY_STR,
    status: 'completed',
    submittedAt: new Date(Date.now() - 4000000).toISOString(),
    completedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 't_2',
    familyId: 'fam_101',
    childId: 'user_child_1',
    subjectName: 'Malayalam I (Adisthana Padavali)',
    subjectIcon: '📖',
    taskType: 'reading',
    taskTypeName: 'Reading & Understanding',
    title: 'Read Lesson 4 aloud & note difficult words',
    points: 5,
    date: TODAY_STR,
    status: 'submitted', // Awaiting Parent Approval!
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: null
  },
  {
    id: 't_3',
    familyId: 'fam_101',
    childId: 'user_child_1',
    subjectName: 'Basic Science',
    subjectIcon: '🔬',
    taskType: 'examprep',
    taskTypeName: 'Exam / Test Preparation',
    title: 'Prepare Chapter 2 for class quiz (Pending from yesterday)',
    points: 15,
    date: YESTERDAY_STR,
    status: 'pending',
    submittedAt: null,
    completedAt: null
  },
  {
    id: 't_4',
    familyId: 'fam_101',
    childId: 'user_child_2',
    subjectName: 'English',
    subjectIcon: '📘',
    taskType: 'homework',
    taskTypeName: 'Homework / Writing Exercise',
    title: 'Complete English handwriting practice (Page 14)',
    points: 10,
    date: TODAY_STR,
    status: 'completed',
    sticker: '⭐',
    stickerText: 'Neat Handwriting!',
    parentRemark: 'Very neat and clean handwriting! Proud of you! 🌟',
    submittedAt: new Date(Date.now() - 7500000).toISOString(),
    completedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 't_5',
    familyId: 'fam_101',
    childId: 'user_child_2',
    subjectName: 'Environmental Studies',
    subjectIcon: '🌱',
    taskType: 'reading',
    taskTypeName: 'Reading & Understanding',
    title: 'Read Lesson 2 on Plants and answer questions',
    points: 5,
    date: TODAY_STR,
    status: 'pending',
    submittedAt: null,
    completedAt: null
  },
  // Family 2 Tasks (KIDS202)
  {
    id: 't_6',
    familyId: 'fam_202',
    childId: 'user_child_3',
    subjectName: 'Environmental Studies',
    subjectIcon: '🌍',
    taskType: 'homework',
    taskTypeName: 'Homework / Writing Exercise',
    title: 'Draw the water cycle diagram in science record book',
    points: 10,
    date: TODAY_STR,
    status: 'pending',
    submittedAt: null,
    completedAt: null
  }
];

const SEED_REWARDS = [
  {
    id: 'r_1',
    familyId: 'fam_101',
    childId: 'user_child_1',
    prizeName: 'Weekend Ice Cream & Park Outing 🍦',
    targetPoints: 100,
    status: 'active'
  },
  {
    id: 'r_hist_1',
    familyId: 'fam_101',
    childId: 'user_child_1',
    prizeName: 'Lego Creator Mini Kit 🧱',
    targetPoints: 100,
    pointsAchieved: 110,
    status: 'rewarded',
    weekLabel: 'Week ending 15 Nov 2026',
    rewardedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'r_2',
    familyId: 'fam_101',
    childId: 'user_child_2',
    prizeName: 'Favorite Storybook & Art Kit 🎨',
    targetPoints: 80,
    status: 'active'
  },
  {
    id: 'r_hist_2',
    familyId: 'fam_101',
    childId: 'user_child_2',
    prizeName: 'Color Pencil Set & Sketchpad 🖍️',
    targetPoints: 80,
    pointsAchieved: 85,
    status: 'rewarded',
    weekLabel: 'Week ending 15 Nov 2026',
    rewardedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'r_3',
    familyId: 'fam_202',
    childId: 'user_child_3',
    prizeName: 'Sunday Pizza & Movie Night 🍕',
    targetPoints: 80,
    status: 'active'
  }
];

// ==========================================
// FIREBASE CLOUD FIRESTORE SYNC HELPER (Phase 2)
// ==========================================
const CloudSync = {
  isReady() {
    return typeof firestoreDb !== 'undefined' && firestoreDb !== null && isFirebaseActive;
  },

  setDoc(collectionName, id, data) {
    if (!this.isReady() || !id) return;
    try {
      firestoreDb.collection(collectionName).doc(String(id)).set(data, { merge: true })
        .catch(err => console.warn(`[CloudSync] setDoc error [${collectionName}/${id}]:`, err));
    } catch (e) {
      console.warn(`[CloudSync] setDoc exception [${collectionName}/${id}]:`, e);
    }
  },

  deleteDoc(collectionName, id) {
    if (!this.isReady() || !id) return;
    try {
      firestoreDb.collection(collectionName).doc(String(id)).delete()
        .catch(err => console.warn(`[CloudSync] deleteDoc error [${collectionName}/${id}]:`, err));
    } catch (e) {
      console.warn(`[CloudSync] deleteDoc exception [${collectionName}/${id}]:`, e);
    }
  }
};

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    // Clear legacy persistent session key so fresh browser restarts start on PIN login page
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (e) {}

    // Initialize storage arrays cleanly without auto-injecting dummy data
    if (!localStorage.getItem(STORAGE_KEYS.FAMILIES)) {
      this.save(STORAGE_KEYS.FAMILIES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.save(STORAGE_KEYS.USERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      this.save(STORAGE_KEYS.TASKS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REWARDS)) {
      this.save(STORAGE_KEYS.REWARDS, []);
    }

    // Initialize or migrate Syllabus (Kerala & CBSE support)
    const existingSyllabus = this.get(STORAGE_KEYS.SYLLABUS);
    if (!existingSyllabus) {
      this.save(STORAGE_KEYS.SYLLABUS, {
        kerala: DEFAULT_KERALA_SYLLABUS,
        cbse: DEFAULT_CBSE_SYLLABUS
      });
    } else if (!existingSyllabus.kerala && !existingSyllabus.cbse) {
      this.save(STORAGE_KEYS.SYLLABUS, {
        kerala: existingSyllabus,
        cbse: DEFAULT_CBSE_SYLLABUS
      });
    } else if (!existingSyllabus.cbse) {
      existingSyllabus.cbse = DEFAULT_CBSE_SYLLABUS;
      this.save(STORAGE_KEYS.SYLLABUS, existingSyllabus);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.save(STORAGE_KEYS.CATEGORIES, DEFAULT_TASK_CATEGORIES);
    }

    // Initialize Real-time Cloud Listeners (Firebase Firestore Phase 2)
    this.initCloudSync();
  }

  initCloudSync() {
    if (!CloudSync.isReady()) {
      console.info('ℹ️ Running in Local Storage Mode (Cloud connection not active)');
      return;
    }

    console.log('🚀 Connecting to Firebase Cloud Firestore collections...');

    // Auto-seed Demo environment when first connected if empty
    if (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') {
      try {
        firestoreDb.collection('families').get().then(snap => {
          if (snap.empty) {
            console.info('🧪 Demo environment is empty. Seeding initial demo families & tasks...');
            this.seedDemoData();
          }
        }).catch(err => console.warn('Demo init check note:', err));
      } catch (e) {}
    }

    // 1. Families Cloud Listener
    try {
      firestoreDb.collection('families').onSnapshot(snapshot => {
        const cloudFamilies = [];
        snapshot.forEach(doc => cloudFamilies.push({ ...doc.data(), id: doc.id }));
        this.save(STORAGE_KEYS.FAMILIES, cloudFamilies);
        this.debouncedRender();
      }, err => console.warn('Families listener warning:', err));
    } catch (e) {}

    // 2. Users Cloud Listener
    try {
      firestoreDb.collection('users').onSnapshot(snapshot => {
        const cloudUsers = [];
        snapshot.forEach(doc => cloudUsers.push({ ...doc.data(), id: doc.id }));
        this.save(STORAGE_KEYS.USERS, cloudUsers);
        this.debouncedRender();
      }, err => console.warn('Users listener warning:', err));
    } catch (e) {}

    // 3. Tasks Cloud Listener
    try {
      firestoreDb.collection('tasks').onSnapshot(snapshot => {
        const cloudTasks = [];
        snapshot.forEach(doc => cloudTasks.push({ ...doc.data(), id: doc.id }));
        this.save(STORAGE_KEYS.TASKS, cloudTasks);
        this.debouncedRender();
      }, err => console.warn('Tasks listener warning:', err));
    } catch (e) {}

    // 4. Rewards Cloud Listener
    try {
      firestoreDb.collection('rewards').onSnapshot(snapshot => {
        const cloudRewards = [];
        snapshot.forEach(doc => cloudRewards.push({ ...doc.data(), id: doc.id }));
        this.save(STORAGE_KEYS.REWARDS, cloudRewards);
        this.debouncedRender();
      }, err => console.warn('Rewards listener warning:', err));
    } catch (e) {}
  }

  debouncedRender() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      if (typeof renderApp === 'function') {
        renderApp();
      }
    }, 120);
  }

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage read error', e);
      return null;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  // Families (Multi-Family Engine)
  getFamilies() {
    return this.get(STORAGE_KEYS.FAMILIES) || [];
  }

  getFamilyById(id) {
    if (!id) return null;
    return this.getFamilies().find(f => f.id === id) || null;
  }

  getFamilyByCode(code) {
    if (!code) return null;
    const normalize = str => (str || '').toString().replace(/[-\s_]/g, '').trim().toUpperCase();
    const clean = normalize(code);
    return this.getFamilies().find(f => normalize(f.code) === clean) || null;
  }

  createFamily({ name, parentName, parentEmail, pin, avatar }) {
    const families = this.getFamilies();
    const id = 'fam_' + Date.now();
    const codeNum = Math.floor(100 + Math.random() * 900);
    const code = `KIDS${codeNum}`;

    const newFamily = {
      id,
      name: name || `${parentName}'s Family`,
      code,
      parentEmail: parentEmail || null,
      createdAt: new Date().toISOString()
    };
    families.push(newFamily);
    this.save(STORAGE_KEYS.FAMILIES, families);
    CloudSync.setDoc('families', newFamily.id, newFamily);

    const parentUser = {
      id: 'user_' + Date.now(),
      familyId: id,
      name: parentName,
      email: parentEmail || null,
      role: 'parent',
      pin: pin || '1234',
      avatar: avatar || '👨‍👩‍👧‍👦'
    };
    this.addUser(parentUser);

    return { family: newFamily, parentUser };
  }

  updateFamily(id, updates) {
    let updatedFamily = null;
    const families = this.getFamilies().map(f => {
      if (f.id === id) {
        updatedFamily = { ...f, ...updates };
        return updatedFamily;
      }
      return f;
    });
    this.save(STORAGE_KEYS.FAMILIES, families);
    if (updatedFamily) {
      CloudSync.setDoc('families', id, updatedFamily);
    }
  }

  deleteFamily(id) {
    const family = this.getFamilyById(id);
    if (family) {
      try {
        const devKey = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? 'kst_device_family_code_demo' : 'kst_device_family_code_prod';
        const savedCode = localStorage.getItem(devKey) || localStorage.getItem('kst_device_family_code');
        if (savedCode && savedCode.toUpperCase() === family.code.toUpperCase()) {
          localStorage.removeItem(devKey);
          localStorage.removeItem('kst_device_family_code');
        }
      } catch (e) {}
    }

    const families = this.getFamilies().filter(f => f.id !== id);
    this.save(STORAGE_KEYS.FAMILIES, families);
    CloudSync.deleteDoc('families', id);

    const familyUsers = this.getUsersForFamily(id);
    const userIds = new Set(familyUsers.map(u => u.id));
    const remainingUsers = this.getUsers().filter(u => u.familyId !== id);
    this.save(STORAGE_KEYS.USERS, remainingUsers);
    familyUsers.forEach(u => CloudSync.deleteDoc('users', u.id));

    const familyTasks = this.getTasks().filter(t => t.familyId === id || userIds.has(t.childId));
    const remainingTasks = this.getTasks().filter(t => t.familyId !== id && !userIds.has(t.childId));
    this.save(STORAGE_KEYS.TASKS, remainingTasks);
    familyTasks.forEach(t => CloudSync.deleteDoc('tasks', t.id));

    const familyRewards = this.getRewards().filter(r => r.familyId === id || userIds.has(r.childId));
    const remainingRewards = this.getRewards().filter(r => r.familyId !== id && !userIds.has(r.childId));
    this.save(STORAGE_KEYS.REWARDS, remainingRewards);
    familyRewards.forEach(r => CloudSync.deleteDoc('rewards', r.id));
  }

  // Super Admin Platform Security
  getSuperAdminPassword() {
    return localStorage.getItem('kst_super_admin_pass') || 'admin123';
  }

  setSuperAdminPassword(newPass) {
    localStorage.setItem('kst_super_admin_pass', newPass);
  }

  verifySuperAdminPassword(input) {
    return input === this.getSuperAdminPassword();
  }

  isSuperAdminSession() {
    return sessionStorage.getItem('kst_super_admin_active') === 'true';
  }

  setSuperAdminSession(active) {
    if (active) {
      sessionStorage.setItem('kst_super_admin_active', 'true');
    } else {
      sessionStorage.removeItem('kst_super_admin_active');
    }
  }

  getCurrentFamily() {
    const cur = this.getCurrentUser();
    if (!cur || !cur.familyId) return null;
    return this.getFamilyById(cur.familyId);
  }

  // Users
  getUsers() {
    return this.get(STORAGE_KEYS.USERS) || [];
  }

  getChildren(familyId) {
    const users = this.getUsers();
    if (familyId) {
      return users.filter(u => u.role === 'child' && u.familyId === familyId);
    }
    const cur = this.getCurrentUser();
    if (cur && cur.familyId) {
      return users.filter(u => u.role === 'child' && u.familyId === cur.familyId);
    }
    return users.filter(u => u.role === 'child');
  }

  getUsersForFamily(familyId) {
    if (!familyId) return [];
    return this.getUsers().filter(u => u.familyId === familyId);
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  addUser(user) {
    const users = this.getUsers();
    if (!user.familyId) {
      const cur = this.getCurrentUser();
      if (cur && cur.familyId) {
        user.familyId = cur.familyId;
      } else {
        const families = this.getFamilies();
        user.familyId = families[0] ? families[0].id : 'fam_101';
      }
    }
    users.push(user);
    this.save(STORAGE_KEYS.USERS, users);
    CloudSync.setDoc('users', user.id, user);
    return user;
  }

  updateUser(id, updates) {
    let updatedUser = null;
    const users = this.getUsers().map(u => {
      if (u.id === id) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });
    this.save(STORAGE_KEYS.USERS, users);
    if (updatedUser) {
      CloudSync.setDoc('users', id, updatedUser);
    }
    const cur = this.getCurrentUser();
    if (cur && cur.id === id) {
      this.setCurrentUser({ ...cur, ...updates });
    }
  }

  deleteUser(id) {
    const users = this.getUsers().filter(u => u.id !== id);
    this.save(STORAGE_KEYS.USERS, users);
    CloudSync.deleteDoc('users', id);

    const userTasks = this.getTasks().filter(t => t.childId === id);
    const tasks = this.getTasks().filter(t => t.childId !== id);
    this.save(STORAGE_KEYS.TASKS, tasks);
    userTasks.forEach(t => CloudSync.deleteDoc('tasks', t.id));

    const userRewards = this.getRewards().filter(r => r.childId === id);
    const rewards = this.getRewards().filter(r => r.childId !== id);
    this.save(STORAGE_KEYS.REWARDS, rewards);
    userRewards.forEach(r => CloudSync.deleteDoc('rewards', r.id));
  }

  // Session (Uses sessionStorage so refreshes preserve active session, while fresh window/tab opens land cleanly on PIN login)
  getCurrentUser() {
    try {
      const userId = sessionStorage.getItem(SESSION_KEYS.ACTIVE_USER_ID);
      if (!userId) return null;
      return this.getUserById(userId) || null;
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    try {
      if (user && user.id) {
        sessionStorage.setItem(SESSION_KEYS.ACTIVE_USER_ID, user.id);
      } else {
        sessionStorage.removeItem(SESSION_KEYS.ACTIVE_USER_ID);
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (e) {
      console.error(e);
    }
  }

  logout() {
    try {
      sessionStorage.removeItem(SESSION_KEYS.ACTIVE_USER_ID);
      sessionStorage.removeItem('kst_super_admin_active');
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (e) {}
  }

  // Subjects Management (Kerala State & CBSE, Grades 1 to 10)
  getAllSyllabus(syllabusType = 'kerala') {
    const raw = this.get(STORAGE_KEYS.SYLLABUS);
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    if (!raw) return typeKey === 'cbse' ? DEFAULT_CBSE_SYLLABUS : DEFAULT_KERALA_SYLLABUS;
    if (raw.kerala || raw.cbse) {
      return raw[typeKey] || (typeKey === 'cbse' ? DEFAULT_CBSE_SYLLABUS : DEFAULT_KERALA_SYLLABUS);
    }
    return raw;
  }

  getSubjectsForGrade(grade, syllabusType = 'kerala') {
    const syllabus = this.getAllSyllabus(syllabusType);
    const g = parseInt(grade, 10);
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    const defaultFallback = typeKey === 'cbse' ? DEFAULT_CBSE_SYLLABUS[g] : DEFAULT_KERALA_SYLLABUS[g];
    return syllabus[g] || defaultFallback || [];
  }

  addSubject(grade, subject, syllabusType = 'kerala') {
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (!raw.kerala && !raw.cbse) {
      raw = { kerala: raw, cbse: DEFAULT_CBSE_SYLLABUS };
    }
    if (!raw[typeKey]) raw[typeKey] = typeKey === 'cbse' ? DEFAULT_CBSE_SYLLABUS : DEFAULT_KERALA_SYLLABUS;
    const g = parseInt(grade, 10);
    if (!raw[typeKey][g]) raw[typeKey][g] = [];
    raw[typeKey][g].push(subject);
    this.save(STORAGE_KEYS.SYLLABUS, raw);
    return subject;
  }

  updateSubject(grade, subjectId, updates, syllabusType = 'kerala') {
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (!raw.kerala && !raw.cbse) {
      raw = { kerala: raw, cbse: DEFAULT_CBSE_SYLLABUS };
    }
    const g = parseInt(grade, 10);
    if (raw[typeKey] && raw[typeKey][g]) {
      raw[typeKey][g] = raw[typeKey][g].map(s => s.id === subjectId ? { ...s, ...updates } : s);
      this.save(STORAGE_KEYS.SYLLABUS, raw);
    }
  }

  deleteSubject(grade, subjectId, syllabusType = 'kerala') {
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (!raw.kerala && !raw.cbse) {
      raw = { kerala: raw, cbse: DEFAULT_CBSE_SYLLABUS };
    }
    const g = parseInt(grade, 10);
    if (raw[typeKey] && raw[typeKey][g]) {
      raw[typeKey][g] = raw[typeKey][g].filter(s => s.id !== subjectId);
      this.save(STORAGE_KEYS.SYLLABUS, raw);
    }
  }

  resetSubjectsForGrade(grade, syllabusType = 'kerala') {
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (!raw.kerala && !raw.cbse) {
      raw = { kerala: raw, cbse: DEFAULT_CBSE_SYLLABUS };
    }
    const g = parseInt(grade, 10);
    const defaults = typeKey === 'cbse' ? DEFAULT_CBSE_SYLLABUS : DEFAULT_KERALA_SYLLABUS;
    if (!raw[typeKey]) raw[typeKey] = {};
    raw[typeKey][g] = defaults[g] || [];
    this.save(STORAGE_KEYS.SYLLABUS, raw);
  }

  // Task Categories Management
  getCategories() {
    return this.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_TASK_CATEGORIES;
  }

  addCategory(category) {
    const categories = this.getCategories();
    categories.push(category);
    this.save(STORAGE_KEYS.CATEGORIES, categories);
    return category;
  }

  updateCategory(id, updates) {
    const categories = this.getCategories().map(c => c.id === id ? { ...c, ...updates } : c);
    this.save(STORAGE_KEYS.CATEGORIES, categories);
  }

  deleteCategory(id) {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CATEGORIES, categories);
  }

  resetCategories() {
    this.save(STORAGE_KEYS.CATEGORIES, DEFAULT_TASK_CATEGORIES);
  }

  // Tasks
  getTasks() {
    return this.get(STORAGE_KEYS.TASKS) || [];
  }

  getTaskById(taskId) {
    return this.getTasks().find(t => t.id === taskId);
  }

  getTasksForChild(childId) {
    return this.getTasks().filter(t => t.childId === childId);
  }

  addTask(task) {
    const tasks = this.getTasks();
    if (!task.familyId && task.childId) {
      const child = this.getUserById(task.childId);
      if (child && child.familyId) {
        task.familyId = child.familyId;
      }
    }
    tasks.unshift(task);
    this.save(STORAGE_KEYS.TASKS, tasks);
    CloudSync.setDoc('tasks', task.id, task);
    return task;
  }

  updateTask(taskId, updates) {
    const tasks = this.getTasks();
    let updatedTask = null;
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        updatedTask = { ...t, ...updates };
        return updatedTask;
      }
      return t;
    });
    if (updatedTask) {
      this.save(STORAGE_KEYS.TASKS, newTasks);
      CloudSync.setDoc('tasks', taskId, updatedTask);
    }
    return updatedTask;
  }

  deleteTask(taskId) {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    this.save(STORAGE_KEYS.TASKS, tasks);
    CloudSync.deleteDoc('tasks', taskId);
  }

  submitTaskForApproval(taskId) {
    const tasks = this.getTasks();
    let updatedTask = null;
    const newTasks = tasks.map(t => {
      if (t.id === taskId && t.status !== 'completed') {
        updatedTask = {
          ...t,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        };
        return updatedTask;
      }
      return t;
    });

    if (updatedTask) {
      this.save(STORAGE_KEYS.TASKS, newTasks);
      CloudSync.setDoc('tasks', taskId, updatedTask);
    }
    return updatedTask;
  }

  approveTask(taskId, feedback = {}) {
    const tasks = this.getTasks();
    let updatedTask = null;
    const newTasks = tasks.map(t => {
      if (t.id === taskId && t.status !== 'completed') {
        updatedTask = {
          ...t,
          status: 'completed',
          completedAt: new Date().toISOString(),
          sticker: feedback.sticker || '⭐',
          stickerText: feedback.stickerText || 'Great Job!',
          parentRemark: (feedback.remark || '').trim()
        };
        return updatedTask;
      }
      return t;
    });

    if (updatedTask) {
      this.save(STORAGE_KEYS.TASKS, newTasks);
      CloudSync.setDoc('tasks', taskId, updatedTask);
      const child = this.getUserById(updatedTask.childId);
      if (child) {
        const addedPts = parseInt(updatedTask.points, 10) || 0;
        this.updateUser(child.id, {
          weeklyPoints: (child.weeklyPoints || 0) + addedPts,
          totalPoints: (child.totalPoints || 0) + addedPts
        });
      }
    }
    return updatedTask;
  }

  rejectTask(taskId) {
    const tasks = this.getTasks();
    let updatedTask = null;
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        updatedTask = {
          ...t,
          status: 'pending',
          submittedAt: null
        };
        return updatedTask;
      }
      return t;
    });

    if (updatedTask) {
      this.save(STORAGE_KEYS.TASKS, newTasks);
      CloudSync.setDoc('tasks', taskId, updatedTask);
    }
    return updatedTask;
  }

  // Rewards
  getRewards() {
    return this.get(STORAGE_KEYS.REWARDS) || [];
  }

  getRewardForChild(childId) {
    const active = this.getRewards().filter(r => r.childId === childId && r.status === 'active');
    if (active.length === 0) return null;
    return active.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0];
  }

  saveRewardGoal(childId, prizeName, targetPoints) {
    const child = this.getUserById(childId);
    const parsedTarget = parseInt(targetPoints, 10) || 100;
    const existingActive = this.getRewardForChild(childId);
    let targetReward = null;

    if (existingActive) {
      targetReward = {
        ...existingActive,
        prizeName: prizeName || existingActive.prizeName || 'Weekend Treat & Prize 🎬🍿',
        targetPoints: parsedTarget,
        updatedAt: new Date().toISOString()
      };
      const rewards = this.getRewards().map(r => r.id === existingActive.id ? targetReward : r);
      this.save(STORAGE_KEYS.REWARDS, rewards);
      CloudSync.setDoc('rewards', targetReward.id, targetReward);
    } else {
      targetReward = {
        id: 'r_' + Date.now(),
        familyId: child ? child.familyId : 'fam_101',
        childId,
        prizeName: prizeName || 'Weekend Treat & Prize 🎬🍿',
        targetPoints: parsedTarget,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const rewards = this.getRewards();
      rewards.push(targetReward);
      this.save(STORAGE_KEYS.REWARDS, rewards);
      CloudSync.setDoc('rewards', targetReward.id, targetReward);
    }

    // Clean up any stale duplicate active records for this child
    const staleDuplicates = this.getRewards().filter(r => r.childId === childId && r.status === 'active' && r.id !== targetReward.id);
    if (staleDuplicates.length > 0) {
      const cleaned = this.getRewards().filter(r => !staleDuplicates.some(s => s.id === r.id));
      this.save(STORAGE_KEYS.REWARDS, cleaned);
      staleDuplicates.forEach(s => CloudSync.deleteDoc('rewards', s.id));
    }

    return targetReward;
  }

  getRewardHistoryForChild(childId) {
    return this.getRewards()
      .filter(r => r.childId === childId && r.status === 'rewarded')
      .sort((a, b) => new Date(b.rewardedAt || 0) - new Date(a.rewardedAt || 0));
  }

  resetChildWeeklyPoints(childId) {
    return this.updateUser(childId, { weeklyPoints: 0 });
  }

  deleteRewardHistory(rewardId) {
    const rewards = this.getRewards().filter(r => r.id !== rewardId);
    this.save(STORAGE_KEYS.REWARDS, rewards);
    CloudSync.deleteDoc('rewards', rewardId);
  }

  markRewardGiven(childId) {
    const currentReward = this.getRewardForChild(childId);
    const child = this.getUserById(childId);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const weekLabel = `Week ending ${dateFormatted}`;

    let rewardedRecord = null;
    let freshRewardRecord = null;

    const rewards = this.getRewards().map(r => {
      if (r.childId === childId && r.status === 'active') {
        rewardedRecord = {
          ...r,
          status: 'rewarded',
          rewardedAt: now.toISOString(),
          weekLabel: weekLabel,
          pointsAchieved: child ? (child.weeklyPoints || 0) : (r.targetPoints || 100)
        };
        return rewardedRecord;
      }
      return r;
    });

    // Automatically re-seed fresh active goal for next week with same prize & target
    freshRewardRecord = {
      id: 'rew_' + Date.now(),
      familyId: child ? child.familyId : (currentReward ? currentReward.familyId : 'fam_101'),
      childId,
      prizeName: currentReward ? currentReward.prizeName : 'Weekend Treat & Prize 🎬🍿',
      targetPoints: currentReward ? currentReward.targetPoints : 100,
      status: 'active',
      createdAt: now.toISOString()
    };
    rewards.push(freshRewardRecord);

    this.save(STORAGE_KEYS.REWARDS, rewards);
    if (rewardedRecord) CloudSync.setDoc('rewards', rewardedRecord.id, rewardedRecord);
    if (freshRewardRecord) CloudSync.setDoc('rewards', freshRewardRecord.id, freshRewardRecord);

    this.updateUser(childId, { weeklyPoints: 0 });
  }

  // Phase 2: Wipe All Cloud Test Data for Fresh Production Launch
  async wipeAllCloudData() {
    if (CloudSync.isReady()) {
      const collections = ['tasks', 'rewards', 'users', 'families'];
      for (const col of collections) {
        try {
          const snap = await firestoreDb.collection(col).get();
          const batch = firestoreDb.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        } catch (e) {
          console.warn('Wipe collection error:', col, e);
        }
      }
    }
    const theme = localStorage.getItem('study_tracker_theme');
    const selectedEnv = localStorage.getItem('kst_selected_env');
    const devKey = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? 'kst_device_family_code_demo' : 'kst_device_family_code_prod';
    
    // Clear only current environment's localStorage cache
    Object.values(STORAGE_KEYS).forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    try {
      localStorage.removeItem(devKey);
      localStorage.removeItem('kst_device_family_code');
    } catch (e) {}
    if (theme) localStorage.setItem('study_tracker_theme', theme);
    if (selectedEnv) localStorage.setItem('kst_selected_env', selectedEnv);
    this.save(STORAGE_KEYS.FAMILIES, []);
    this.save(STORAGE_KEYS.USERS, []);
    this.save(STORAGE_KEYS.TASKS, []);
    this.save(STORAGE_KEYS.REWARDS, []);
    this.save(STORAGE_KEYS.SYLLABUS, {
      kerala: DEFAULT_KERALA_SYLLABUS,
      cbse: DEFAULT_CBSE_SYLLABUS
    });
    this.save(STORAGE_KEYS.CATEGORIES, DEFAULT_TASK_CATEGORIES);
    try {
      sessionStorage.clear();
    } catch (e) {}
    this.logout();
  }

  // Backup & Restore (Data Portability between Laptop, Mobile & Future Cloud)
  exportBackup() {
    const backup = {
      app: 'KidsStudyTracker',
      version: 2,
      exportedAt: new Date().toISOString(),
      families: this.getFamilies(),
      users: this.getUsers(),
      tasks: this.getTasks(),
      rewards: this.getRewards(),
      syllabus: this.get(STORAGE_KEYS.SYLLABUS),
      categories: this.getCategories()
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackup(backupData) {
    if (!backupData || !Array.isArray(backupData.users) || !Array.isArray(backupData.tasks)) {
      throw new Error('Invalid backup format: missing users or tasks array');
    }
    if (Array.isArray(backupData.families)) this.save(STORAGE_KEYS.FAMILIES, backupData.families);
    this.save(STORAGE_KEYS.USERS, backupData.users);
    this.save(STORAGE_KEYS.TASKS, backupData.tasks);
    if (Array.isArray(backupData.rewards)) this.save(STORAGE_KEYS.REWARDS, backupData.rewards);
    if (backupData.syllabus && typeof backupData.syllabus === 'object') this.save(STORAGE_KEYS.SYLLABUS, backupData.syllabus);
    if (Array.isArray(backupData.categories)) this.save(STORAGE_KEYS.CATEGORIES, backupData.categories);
    return true;
  }

  resetToDemo() {
    this.seedDemoData();
  }

  seedDemoData() {
    this.save(STORAGE_KEYS.FAMILIES, SEED_FAMILIES);
    this.save(STORAGE_KEYS.USERS, SEED_USERS);
    this.save(STORAGE_KEYS.TASKS, SEED_TASKS);
    this.save(STORAGE_KEYS.REWARDS, SEED_REWARDS);
    this.save(STORAGE_KEYS.SYLLABUS, {
      kerala: DEFAULT_KERALA_SYLLABUS,
      cbse: DEFAULT_CBSE_SYLLABUS
    });
    this.save(STORAGE_KEYS.CATEGORIES, DEFAULT_TASK_CATEGORIES);
    if (CloudSync.isReady()) {
      SEED_FAMILIES.forEach(f => CloudSync.setDoc('families', f.id, f));
      SEED_USERS.forEach(u => CloudSync.setDoc('users', u.id, u));
      SEED_TASKS.forEach(t => CloudSync.setDoc('tasks', t.id, t));
      SEED_REWARDS.forEach(r => CloudSync.setDoc('rewards', r.id, r));
    }
    this.logout();
    if (typeof renderApp === 'function') renderApp();
  }
}

const store = new DataStore();
