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
  CATEGORIES: ENV_PREFIX + 'categories',
  SUPPORT_TICKETS: ENV_PREFIX + 'support_tickets'
};

const SESSION_KEYS = {
  ACTIVE_USER_ID: ENV_PREFIX + 'session_user_id'
};

// Helper date formatter
function getFormattedDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

var TODAY_STR = getFormattedDate();
var YESTERDAY_DATE = new Date(Date.now() - 86400000);
var YESTERDAY_STR = getFormattedDate(YESTERDAY_DATE);

// Fallback seed loader from data/demo_seed_data.json
function getDemoSeedData() {
  if (typeof MasterDataLoader !== 'undefined' && MasterDataLoader.getSeedData()) {
    return MasterDataLoader.getSeedData();
  }
  return {
    families: [
      { id: 'fam_101', name: "Rajeev's Family", code: 'KIDS101', parentEmail: 'kidsstudytracker@gmail.com', createdAt: new Date().toISOString() },
      { id: 'fam_202', name: "Anand's Family", code: 'KIDS202', parentEmail: 'anand.parent@gmail.com', createdAt: new Date().toISOString() }
    ],
    users: [
      { id: 'user_parent', familyId: 'fam_101', name: 'Rajeev (Parent)', email: 'kidsstudytracker@gmail.com', role: 'parent', pin: '9999', avatar: '👨‍👩‍👧‍👦' },
      { id: 'user_child_1', familyId: 'fam_101', name: 'Arjun', role: 'child', pin: '1234', grade: 7, syllabus: 'Kerala State Syllabus', avatar: '👦', weeklyPoints: 65, totalPoints: 240 },
      { id: 'user_child_2', familyId: 'fam_101', name: 'Meera', role: 'child', pin: '1111', grade: 4, syllabus: 'Kerala State Syllabus', avatar: '👧', weeklyPoints: 50, totalPoints: 190 },
      { id: 'user_parent_2', familyId: 'fam_202', name: 'Anand (Parent)', email: 'anand.parent@gmail.com', role: 'parent', pin: '8888', avatar: '👨‍🏫' },
      { id: 'user_child_3', familyId: 'fam_202', name: 'Appu', role: 'child', pin: '5555', grade: 5, syllabus: 'CBSE', avatar: '🧒', weeklyPoints: 40, totalPoints: 120 }
    ],
    tasks: [],
    rewards: []
  };
}

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

    // Auto-migrate Higher Secondary Grades (Classes 11 & 12) if missing
    if (existingSyllabus) {
      let syllabusMigrated = false;
      if (existingSyllabus.kerala) {
        if (!existingSyllabus.kerala[11]) { existingSyllabus.kerala[11] = DEFAULT_KERALA_SYLLABUS[11]; syllabusMigrated = true; }
        if (!existingSyllabus.kerala[12]) { existingSyllabus.kerala[12] = DEFAULT_KERALA_SYLLABUS[12]; syllabusMigrated = true; }
      }
      if (existingSyllabus.cbse) {
        if (!existingSyllabus.cbse[11]) { existingSyllabus.cbse[11] = DEFAULT_CBSE_SYLLABUS[11]; syllabusMigrated = true; }
        if (!existingSyllabus.cbse[12]) { existingSyllabus.cbse[12] = DEFAULT_CBSE_SYLLABUS[12]; syllabusMigrated = true; }
      }

      // Sanitize stored subjects to ensure pure English names (strips legacy Malayalam brackets)
      ['kerala', 'cbse'].forEach(boardKey => {
        if (existingSyllabus[boardKey]) {
          Object.keys(existingSyllabus[boardKey]).forEach(gradeKey => {
            const list = existingSyllabus[boardKey][gradeKey];
            if (Array.isArray(list)) {
              list.forEach(sub => {
                if (sub && sub.name && /[\u0D00-\u0D7F]/.test(sub.name)) {
                  sub.name = sub.name.replace(/\s*\([\u0D00-\u0D7F\s\.\,\-\/\d]+\)/g, '').trim();
                  syllabusMigrated = true;
                }
              });
            }
          });
        }
      });

      if (syllabusMigrated) {
        this.save(STORAGE_KEYS.SYLLABUS, existingSyllabus);
      }
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

    // 5. Support Tickets Cloud Listener
    try {
      firestoreDb.collection('support_tickets').onSnapshot(snapshot => {
        const cloudTickets = [];
        snapshot.forEach(doc => cloudTickets.push({ ...doc.data(), id: doc.id }));
        cloudTickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        this.save(STORAGE_KEYS.SUPPORT_TICKETS, cloudTickets);
        this.debouncedRender();
      }, err => console.warn('Support tickets listener note:', err));
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

  // Super Admin Platform Security & Multi-Admin Access
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

  getSuperAdminProfile() {
    try {
      const p = sessionStorage.getItem('kst_super_admin_profile');
      return p ? JSON.parse(p) : { email: 'kidsstudytracker@gmail.com', role: 'Super Admin' };
    } catch (e) {
      return { email: 'kidsstudytracker@gmail.com', role: 'Super Admin' };
    }
  }

  setSuperAdminSession(active, profile = null) {
    if (active) {
      sessionStorage.setItem('kst_super_admin_active', 'true');
      if (profile) {
        sessionStorage.setItem('kst_super_admin_profile', JSON.stringify(profile));
      } else if (!sessionStorage.getItem('kst_super_admin_profile')) {
        sessionStorage.setItem('kst_super_admin_profile', JSON.stringify({ email: 'kidsstudytracker@gmail.com', role: 'Super Admin' }));
      }
    } else {
      sessionStorage.removeItem('kst_super_admin_active');
      sessionStorage.removeItem('kst_super_admin_profile');
    }
  }

  // Multi-Admin Management via Firestore `platform_admins`
  async getPlatformAdmins() {
    const defaultList = [
      {
        id: 'primary_owner',
        email: 'kidsstudytracker@gmail.com',
        role: 'Super Admin',
        name: 'Platform Owner',
        password: this.getSuperAdminPassword() || 'admin123',
        active: true,
        createdAt: new Date().toISOString()
      }
    ];

    if (CloudSync.isReady()) {
      try {
        const snap = await firestoreDb.collection('platform_admins').get();
        if (!snap.empty) {
          const admins = [];
          snap.forEach(doc => admins.push({ id: doc.id, ...doc.data() }));
          // Ensure primary owner exists in the list
          if (!admins.some(a => a.email === 'kidsstudytracker@gmail.com')) {
            await firestoreDb.collection('platform_admins').doc('primary_owner').set(defaultList[0]);
            admins.unshift(defaultList[0]);
          }
          return admins;
        } else {
          // Pre-seed primary admin with password if collection is empty
          await firestoreDb.collection('platform_admins').doc('primary_owner').set(defaultList[0]);
          return defaultList;
        }
      } catch (e) {
        console.warn('Could not fetch platform_admins from cloud:', e);
      }
    }
    // Fallback to localStorage if offline
    const local = localStorage.getItem('kst_platform_admins');
    return local ? JSON.parse(local) : defaultList;
  }

  async addPlatformAdmin({ email, name, role = 'Super Admin', password = 'admin' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) throw new Error('Valid email address is required.');

    const adminDoc = {
      email: cleanEmail,
      name: (name || '').trim() || cleanEmail.split('@')[0],
      role: role || 'Super Admin',
      password: (password || '').trim() || 'admin123',
      active: true,
      addedAt: new Date().toISOString()
    };

    if (CloudSync.isReady()) {
      const docRef = await firestoreDb.collection('platform_admins').add(adminDoc);
      adminDoc.id = docRef.id;
    } else {
      adminDoc.id = 'admin_' + Date.now();
    }

    const currentAdmins = await this.getPlatformAdmins();
    const updated = [...currentAdmins.filter(a => a.email !== cleanEmail), adminDoc];
    localStorage.setItem('kst_platform_admins', JSON.stringify(updated));
    return adminDoc;
  }

  async updateAdminPassword(adminId, newPassword) {
    if (!newPassword || newPassword.trim().length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }
    const cleanPass = newPassword.trim();
    if (CloudSync.isReady() && adminId) {
      await firestoreDb.collection('platform_admins').doc(adminId).set({ password: cleanPass }, { merge: true });
    }
    const currentAdmins = await this.getPlatformAdmins();
    const updated = currentAdmins.map(a => a.id === adminId ? { ...a, password: cleanPass } : a);
    localStorage.setItem('kst_platform_admins', JSON.stringify(updated));

    // Also update local master password if primary owner
    const matched = currentAdmins.find(a => a.id === adminId);
    if (matched && matched.email === 'kidsstudytracker@gmail.com') {
      this.setSuperAdminPassword(cleanPass);
    }
  }

  async updatePlatformAdmin(adminId, updates) {
    if (CloudSync.isReady() && adminId) {
      await firestoreDb.collection('platform_admins').doc(adminId).set(updates, { merge: true });
    }
    const currentAdmins = await this.getPlatformAdmins();
    const updated = currentAdmins.map(a => a.id === adminId ? { ...a, ...updates } : a);
    localStorage.setItem('kst_platform_admins', JSON.stringify(updated));
  }

  async deletePlatformAdmin(adminId) {
    if (CloudSync.isReady() && adminId) {
      await firestoreDb.collection('platform_admins').doc(adminId).delete();
    }
    const currentAdmins = await this.getPlatformAdmins();
    const updated = currentAdmins.filter(a => a.id !== adminId);
    localStorage.setItem('kst_platform_admins', JSON.stringify(updated));
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

  // Subjects Management (Integrated JSON Master + Family Cloud Overrides)
  getAllSyllabus(syllabusType = 'kerala') {
    const master = (typeof MasterDataLoader !== 'undefined') ? MasterDataLoader.getSyllabus() : null;
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    const fallback = typeKey === 'cbse' ? DEFAULT_CBSE_SYLLABUS : DEFAULT_KERALA_SYLLABUS;
    return (master && master[typeKey]) ? master[typeKey] : fallback;
  }

  getSubjectsForGrade(grade, syllabusType = 'kerala') {
    const g = parseInt(grade, 10);
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    const baseSyllabus = this.getAllSyllabus(typeKey);
    const baseSubjects = (baseSyllabus && baseSyllabus[g]) ? JSON.parse(JSON.stringify(baseSyllabus[g])) : [];

    // Check if current active family has custom overrides in cloud
    const curFamily = this.getCurrentFamily();
    if (curFamily && curFamily.customSyllabus && curFamily.customSyllabus[typeKey] && curFamily.customSyllabus[typeKey][g]) {
      const overrides = curFamily.customSyllabus[typeKey][g];
      return overrides;
    }

    // LocalStorage fallback for legacy offline mode
    const raw = this.get(STORAGE_KEYS.SYLLABUS);
    if (raw && raw[typeKey] && raw[typeKey][g]) {
      return raw[typeKey][g];
    }

    return baseSubjects;
  }

  addSubject(grade, subject, syllabusType = 'kerala') {
    const g = parseInt(grade, 10);
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    const currentList = this.getSubjectsForGrade(g, typeKey);
    const updatedList = [...currentList, subject];

    // Save to LocalStorage
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (!raw[typeKey]) raw[typeKey] = {};
    raw[typeKey][g] = updatedList;
    this.save(STORAGE_KEYS.SYLLABUS, raw);

    // Save to Family Cloud Document in Firestore
    const curFamily = this.getCurrentFamily();
    if (curFamily) {
      if (!curFamily.customSyllabus) curFamily.customSyllabus = {};
      if (!curFamily.customSyllabus[typeKey]) curFamily.customSyllabus[typeKey] = {};
      curFamily.customSyllabus[typeKey][g] = updatedList;
      this.updateFamily(curFamily.id, { customSyllabus: curFamily.customSyllabus });
    }

    return subject;
  }

  updateSubject(grade, subjectId, updates, syllabusType = 'kerala') {
    const g = parseInt(grade, 10);
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    const currentList = this.getSubjectsForGrade(g, typeKey);
    const updatedList = currentList.map(s => s.id === subjectId ? { ...s, ...updates } : s);

    // Save to LocalStorage
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (!raw[typeKey]) raw[typeKey] = {};
    raw[typeKey][g] = updatedList;
    this.save(STORAGE_KEYS.SYLLABUS, raw);

    // Save to Family Cloud Document in Firestore
    const curFamily = this.getCurrentFamily();
    if (curFamily) {
      if (!curFamily.customSyllabus) curFamily.customSyllabus = {};
      if (!curFamily.customSyllabus[typeKey]) curFamily.customSyllabus[typeKey] = {};
      curFamily.customSyllabus[typeKey][g] = updatedList;
      this.updateFamily(curFamily.id, { customSyllabus: curFamily.customSyllabus });
    }
  }

  deleteSubject(grade, subjectId, syllabusType = 'kerala') {
    const g = parseInt(grade, 10);
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    const currentList = this.getSubjectsForGrade(g, typeKey);
    const updatedList = currentList.filter(s => s.id !== subjectId);

    // Save to LocalStorage
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (!raw[typeKey]) raw[typeKey] = {};
    raw[typeKey][g] = updatedList;
    this.save(STORAGE_KEYS.SYLLABUS, raw);

    // Save to Family Cloud Document in Firestore
    const curFamily = this.getCurrentFamily();
    if (curFamily) {
      if (!curFamily.customSyllabus) curFamily.customSyllabus = {};
      if (!curFamily.customSyllabus[typeKey]) curFamily.customSyllabus[typeKey] = {};
      curFamily.customSyllabus[typeKey][g] = updatedList;
      this.updateFamily(curFamily.id, { customSyllabus: curFamily.customSyllabus });
    }
  }

  resetSubjectsForGrade(grade, syllabusType = 'kerala') {
    const g = parseInt(grade, 10);
    const typeKey = (syllabusType && String(syllabusType).toLowerCase().includes('cbse')) ? 'cbse' : 'kerala';
    const baseSyllabus = this.getAllSyllabus(typeKey);
    const defaultList = (baseSyllabus && baseSyllabus[g]) ? JSON.parse(JSON.stringify(baseSyllabus[g])) : [];

    // Reset in LocalStorage
    let raw = this.get(STORAGE_KEYS.SYLLABUS) || {};
    if (raw[typeKey]) {
      delete raw[typeKey][g];
      this.save(STORAGE_KEYS.SYLLABUS, raw);
    }

    // Reset in Family Cloud Document
    const curFamily = this.getCurrentFamily();
    if (curFamily && curFamily.customSyllabus && curFamily.customSyllabus[typeKey]) {
      delete curFamily.customSyllabus[typeKey][g];
      this.updateFamily(curFamily.id, { customSyllabus: curFamily.customSyllabus });
    }
  }

  // Task Categories Management (Integrated JSON Master + Family Cloud Overrides)
  getCategories() {
    const masterCats = (typeof MasterDataLoader !== 'undefined') ? MasterDataLoader.getCategories() : DEFAULT_TASK_CATEGORIES;
    const curFamily = this.getCurrentFamily();
    if (curFamily && curFamily.customCategories && curFamily.customCategories.length > 0) {
      return curFamily.customCategories;
    }
    return this.get(STORAGE_KEYS.CATEGORIES) || masterCats;
  }

  addCategory(category) {
    const categories = [...this.getCategories(), category];
    this.save(STORAGE_KEYS.CATEGORIES, categories);

    const curFamily = this.getCurrentFamily();
    if (curFamily) {
      curFamily.customCategories = categories;
      this.updateFamily(curFamily.id, { customCategories: categories });
    }
    return category;
  }

  updateCategory(id, updates) {
    const categories = this.getCategories().map(c => c.id === id ? { ...c, ...updates } : c);
    this.save(STORAGE_KEYS.CATEGORIES, categories);

    const curFamily = this.getCurrentFamily();
    if (curFamily) {
      curFamily.customCategories = categories;
      this.updateFamily(curFamily.id, { customCategories: categories });
    }
  }

  deleteCategory(id) {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CATEGORIES, categories);

    const curFamily = this.getCurrentFamily();
    if (curFamily) {
      curFamily.customCategories = categories;
      this.updateFamily(curFamily.id, { customCategories: categories });
    }
  }

  resetCategories() {
    const masterCats = (typeof MasterDataLoader !== 'undefined') ? MasterDataLoader.getCategories() : DEFAULT_TASK_CATEGORIES;
    this.save(STORAGE_KEYS.CATEGORIES, masterCats);

    const curFamily = this.getCurrentFamily();
    if (curFamily && curFamily.customCategories) {
      delete curFamily.customCategories;
      this.updateFamily(curFamily.id, { customCategories: null });
    }
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

  rejectTask(taskId, reason = '') {
    const tasks = this.getTasks();
    let updatedTask = null;
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        updatedTask = {
          ...t,
          status: 'pending',
          submittedAt: null,
          revisionReason: (reason || '').trim(),
          revisionRequestedAt: new Date().toISOString()
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

  // Support Tickets & Contact Requests
  getSupportTickets() {
    return this.get(STORAGE_KEYS.SUPPORT_TICKETS) || [];
  }

  getSupportTicketsForFamily(familyId) {
    if (!familyId) return [];
    return this.getSupportTickets().filter(t => t.familyId === familyId);
  }

  addSupportTicket(ticket) {
    const tickets = this.getSupportTickets();
    tickets.unshift(ticket);
    this.save(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    CloudSync.setDoc('support_tickets', ticket.id, ticket);
    return ticket;
  }

  updateSupportTicket(ticketId, updates) {
    const tickets = this.getSupportTickets();
    let updated = null;
    const newTickets = tickets.map(t => {
      if (t.id === ticketId) {
        updated = { ...t, ...updates };
        return updated;
      }
      return t;
    });
    if (updated) {
      this.save(STORAGE_KEYS.SUPPORT_TICKETS, newTickets);
      CloudSync.setDoc('support_tickets', ticketId, updated);
    }
    return updated;
  }

  deleteSupportTicket(ticketId) {
    const tickets = this.getSupportTickets().filter(t => t.id !== ticketId);
    this.save(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    CloudSync.deleteDoc('support_tickets', ticketId);
  }

  resetToDemo() {
    this.seedDemoData();
  }

  seedDemoData() {
    const seed = getDemoSeedData();
    const families = seed.families || [];
    const users = seed.users || [];
    const tasks = seed.tasks || [];
    const rewards = seed.rewards || [];

    this.save(STORAGE_KEYS.FAMILIES, families);
    this.save(STORAGE_KEYS.USERS, users);
    this.save(STORAGE_KEYS.TASKS, tasks);
    this.save(STORAGE_KEYS.REWARDS, rewards);

    const masterSyllabus = (typeof MasterDataLoader !== 'undefined') ? MasterDataLoader.getSyllabus() : {
      kerala: DEFAULT_KERALA_SYLLABUS,
      cbse: DEFAULT_CBSE_SYLLABUS
    };
    const masterCats = (typeof MasterDataLoader !== 'undefined') ? MasterDataLoader.getCategories() : DEFAULT_TASK_CATEGORIES;

    this.save(STORAGE_KEYS.SYLLABUS, masterSyllabus);
    this.save(STORAGE_KEYS.CATEGORIES, masterCats);

    if (CloudSync.isReady()) {
      families.forEach(f => CloudSync.setDoc('families', f.id, f));
      users.forEach(u => CloudSync.setDoc('users', u.id, u));
      tasks.forEach(t => CloudSync.setDoc('tasks', t.id, t));
      rewards.forEach(r => CloudSync.setDoc('rewards', r.id, r));
    }
    this.logout();
    if (typeof renderApp === 'function') renderApp();
  }
}

const store = new DataStore();
