/**
 * Kids Study Tracker - Master Data Loader Service
 * Asynchronously loads and caches JSON master datasets (Syllabus, Categories, Seed Data).
 * Provides instantaneous access for offline and online environments.
 */

var MasterDataLoader = {
  isLoaded: false,
  syllabus: null,
  categories: null,
  seedData: null,
  loadPromise: null,

  async init() {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const basePath = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');

        const [syllabusRes, categoriesRes, seedRes] = await Promise.all([
          fetch(basePath + 'data/master_syllabus.json').catch(() => null),
          fetch(basePath + 'data/master_categories.json').catch(() => null),
          fetch(basePath + 'data/demo_seed_data.json').catch(() => null)
        ]);

        if (syllabusRes && syllabusRes.ok) {
          this.syllabus = await syllabusRes.json();
        } else if (typeof DEFAULT_KERALA_SYLLABUS !== 'undefined') {
          this.syllabus = { kerala: DEFAULT_KERALA_SYLLABUS, cbse: DEFAULT_CBSE_SYLLABUS };
        }

        if (categoriesRes && categoriesRes.ok) {
          this.categories = await categoriesRes.json();
        } else if (typeof DEFAULT_TASK_CATEGORIES !== 'undefined') {
          this.categories = DEFAULT_TASK_CATEGORIES;
        }

        if (seedRes && seedRes.ok) {
          this.seedData = await seedRes.json();
        }

        this.isLoaded = true;
      } catch (err) {
        console.warn('MasterDataLoader fallback to in-memory defaults:', err);
        if (typeof DEFAULT_KERALA_SYLLABUS !== 'undefined') {
          this.syllabus = { kerala: DEFAULT_KERALA_SYLLABUS, cbse: DEFAULT_CBSE_SYLLABUS };
        }
        if (typeof DEFAULT_TASK_CATEGORIES !== 'undefined') {
          this.categories = DEFAULT_TASK_CATEGORIES;
        }
        this.isLoaded = true;
      }
    })();

    return this.loadPromise;
  },

  getSyllabus() {
    if (!this.syllabus && typeof DEFAULT_KERALA_SYLLABUS !== 'undefined') {
      return { kerala: DEFAULT_KERALA_SYLLABUS, cbse: DEFAULT_CBSE_SYLLABUS };
    }
    return this.syllabus || { kerala: {}, cbse: {} };
  },

  getCategories() {
    if (!this.categories && typeof DEFAULT_TASK_CATEGORIES !== 'undefined') {
      return DEFAULT_TASK_CATEGORIES;
    }
    return this.categories || [];
  },

  getSeedData() {
    return this.seedData;
  }
};

// Auto-trigger initialization in background
MasterDataLoader.init();
