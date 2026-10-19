import { GradeLevel, StudentStream } from '../types';

export interface NcertChapter {
  id: string;
  chapterNumber: number;
  name: string;
  subject: string;
}

export interface NcertSubjectGroup {
  subject: string;
  color: string;
  chapters: NcertChapter[];
}

export const NCERT_DATABASE: Record<string, NcertSubjectGroup[]> = {
  // ----------------------------------------------------
  // CLASS 9 (Updated New NCERT 2026-27 Syllabus)
  // Textbooks: "Exploration: Textbook of Science for Grade 9"
  //            "Ganita Manjari: Textbook of Mathematics for Grade 9"
  // ----------------------------------------------------
  'Class 9': [
    {
      subject: 'Science (Exploration)',
      color: 'cyan',
      chapters: [
        { id: 'c9_sci_1', chapterNumber: 1, name: 'Exploration: Entering the World of Secondary Science', subject: 'Science (Exploration)' },
        { id: 'c9_sci_2', chapterNumber: 2, name: 'Cell: The Building Block of Life', subject: 'Science (Exploration)' },
        { id: 'c9_sci_3', chapterNumber: 3, name: 'Tissues in Action', subject: 'Science (Exploration)' },
        { id: 'c9_sci_4', chapterNumber: 4, name: 'Describing Motion Around Us', subject: 'Science (Exploration)' },
        { id: 'c9_sci_5', chapterNumber: 5, name: 'Exploring Mixtures and their Separation', subject: 'Science (Exploration)' },
        { id: 'c9_sci_6', chapterNumber: 6, name: 'How Forces Affect Motion', subject: 'Science (Exploration)' },
        { id: 'c9_sci_7', chapterNumber: 7, name: 'Work, Energy and Simple Machines', subject: 'Science (Exploration)' },
        { id: 'c9_sci_8', chapterNumber: 8, name: 'Journey Inside the Atom', subject: 'Science (Exploration)' },
        { id: 'c9_sci_9', chapterNumber: 9, name: 'Atomic Foundations of Matter', subject: 'Science (Exploration)' },
        { id: 'c9_sci_10', chapterNumber: 10, name: 'Sound Waves: Characteristics and Applications', subject: 'Science (Exploration)' },
        { id: 'c9_sci_11', chapterNumber: 11, name: 'Reproduction: How Life Continues', subject: 'Science (Exploration)' },
        { id: 'c9_sci_12', chapterNumber: 12, name: 'Patterns in Life: Diversity and Classification', subject: 'Science (Exploration)' },
        { id: 'c9_sci_13', chapterNumber: 13, name: 'Earth as a System: Energy, Matter and Life', subject: 'Science (Exploration)' },
      ],
    },
    {
      subject: 'Mathematics (Ganita Manjari)',
      color: 'indigo',
      chapters: [
        { id: 'c9_math_1', chapterNumber: 1, name: 'Orienting Yourself: The Use of Coordinates', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_2', chapterNumber: 2, name: 'Introduction to Linear Polynomials', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_3', chapterNumber: 3, name: 'The World of Numbers', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_4', chapterNumber: 4, name: 'Exploring Algebraic Identities', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_5', chapterNumber: 5, name: "I'm Up and Down, and Round and Round (Circles)", subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_6', chapterNumber: 6, name: 'Measuring Space: Perimeter and Area', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_7', chapterNumber: 7, name: 'The Mathematics of Maybe: Introduction to Probability', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_8', chapterNumber: 8, name: 'Predicting What Comes Next: Exploring Sequences and Progressions', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_9', chapterNumber: 9, name: 'Propositions and their Converses', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_10', chapterNumber: 10, name: 'How Quantities Combine: Understanding Data', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_11', chapterNumber: 11, name: 'The World of Algorithms', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_12', chapterNumber: 12, name: 'Quadrilaterals', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_13', chapterNumber: 13, name: 'Two Variables, One Line', subject: 'Mathematics (Ganita Manjari)' },
        { id: 'c9_math_14', chapterNumber: 14, name: 'Math of Space: Surface Area and Volume', subject: 'Mathematics (Ganita Manjari)' },
      ],
    },
  ],

  // ----------------------------------------------------
  // CLASS 10 (Real Updated NCERT Rationalized Syllabus)
  // ----------------------------------------------------
  'Class 10': [
    {
      subject: 'Science',
      color: 'cyan',
      chapters: [
        { id: 'c10_sci_1', chapterNumber: 1, name: 'Chemical Reactions and Equations', subject: 'Science' },
        { id: 'c10_sci_2', chapterNumber: 2, name: 'Acids, Bases and Salts', subject: 'Science' },
        { id: 'c10_sci_3', chapterNumber: 3, name: 'Metals and Non-metals', subject: 'Science' },
        { id: 'c10_sci_4', chapterNumber: 4, name: 'Carbon and its Compounds', subject: 'Science' },
        { id: 'c10_sci_5', chapterNumber: 5, name: 'Life Processes', subject: 'Science' },
        { id: 'c10_sci_6', chapterNumber: 6, name: 'Control and Coordination', subject: 'Science' },
        { id: 'c10_sci_7', chapterNumber: 7, name: 'How do Organisms Reproduce?', subject: 'Science' },
        { id: 'c10_sci_8', chapterNumber: 8, name: 'Heredity', subject: 'Science' },
        { id: 'c10_sci_9', chapterNumber: 9, name: 'Light – Reflection and Refraction', subject: 'Science' },
        { id: 'c10_sci_10', chapterNumber: 10, name: 'The Human Eye and the Colourful World', subject: 'Science' },
        { id: 'c10_sci_11', chapterNumber: 11, name: 'Electricity', subject: 'Science' },
        { id: 'c10_sci_12', chapterNumber: 12, name: 'Magnetic Effects of Electric Current', subject: 'Science' },
        { id: 'c10_sci_13', chapterNumber: 13, name: 'Our Environment', subject: 'Science' },
      ],
    },
    {
      subject: 'Mathematics',
      color: 'indigo',
      chapters: [
        { id: 'c10_math_1', chapterNumber: 1, name: 'Real Numbers', subject: 'Mathematics' },
        { id: 'c10_math_2', chapterNumber: 2, name: 'Polynomials', subject: 'Mathematics' },
        { id: 'c10_math_3', chapterNumber: 3, name: 'Pair of Linear Equations in Two Variables', subject: 'Mathematics' },
        { id: 'c10_math_4', chapterNumber: 4, name: 'Quadratic Equations', subject: 'Mathematics' },
        { id: 'c10_math_5', chapterNumber: 5, name: 'Arithmetic Progressions', subject: 'Mathematics' },
        { id: 'c10_math_6', chapterNumber: 6, name: 'Triangles', subject: 'Mathematics' },
        { id: 'c10_math_7', chapterNumber: 7, name: 'Coordinate Geometry', subject: 'Mathematics' },
        { id: 'c10_math_8', chapterNumber: 8, name: 'Introduction to Trigonometry', subject: 'Mathematics' },
        { id: 'c10_math_9', chapterNumber: 9, name: 'Some Applications of Trigonometry', subject: 'Mathematics' },
        { id: 'c10_math_10', chapterNumber: 10, name: 'Circles', subject: 'Mathematics' },
        { id: 'c10_math_11', chapterNumber: 11, name: 'Areas Related to Circles', subject: 'Mathematics' },
        { id: 'c10_math_12', chapterNumber: 12, name: 'Surface Areas and Volumes', subject: 'Mathematics' },
        { id: 'c10_math_13', chapterNumber: 13, name: 'Statistics', subject: 'Mathematics' },
        { id: 'c10_math_14', chapterNumber: 14, name: 'Probability', subject: 'Mathematics' },
      ],
    },
  ],

  // ----------------------------------------------------
  // CLASS 11 - STREAM SPECIFIC (NCERT)
  // ----------------------------------------------------
  'Class 11_PCM': [
    {
      subject: 'Physics',
      color: 'cyan',
      chapters: [
        { id: 'c11_phy_1', chapterNumber: 1, name: 'Units and Measurements', subject: 'Physics' },
        { id: 'c11_phy_2', chapterNumber: 2, name: 'Motion in a Straight Line', subject: 'Physics' },
        { id: 'c11_phy_3', chapterNumber: 3, name: 'Motion in a Plane', subject: 'Physics' },
        { id: 'c11_phy_4', chapterNumber: 4, name: 'Laws of Motion', subject: 'Physics' },
        { id: 'c11_phy_5', chapterNumber: 5, name: 'Work, Energy and Power', subject: 'Physics' },
        { id: 'c11_phy_6', chapterNumber: 6, name: 'System of Particles and Rotational Motion', subject: 'Physics' },
        { id: 'c11_phy_7', chapterNumber: 7, name: 'Gravitation', subject: 'Physics' },
        { id: 'c11_phy_8', chapterNumber: 8, name: 'Mechanical Properties of Solids', subject: 'Physics' },
        { id: 'c11_phy_9', chapterNumber: 9, name: 'Mechanical Properties of Fluids', subject: 'Physics' },
        { id: 'c11_phy_10', chapterNumber: 10, name: 'Thermal Properties of Matter', subject: 'Physics' },
        { id: 'c11_phy_11', chapterNumber: 11, name: 'Thermodynamics', subject: 'Physics' },
        { id: 'c11_phy_12', chapterNumber: 12, name: 'Kinetic Theory', subject: 'Physics' },
        { id: 'c11_phy_13', chapterNumber: 13, name: 'Oscillations', subject: 'Physics' },
        { id: 'c11_phy_14', chapterNumber: 14, name: 'Waves', subject: 'Physics' },
      ],
    },
    {
      subject: 'Chemistry',
      color: 'emerald',
      chapters: [
        { id: 'c11_chem_1', chapterNumber: 1, name: 'Some Basic Concepts of Chemistry', subject: 'Chemistry' },
        { id: 'c11_chem_2', chapterNumber: 2, name: 'Structure of Atom', subject: 'Chemistry' },
        { id: 'c11_chem_3', chapterNumber: 3, name: 'Classification of Elements and Periodicity in Properties', subject: 'Chemistry' },
        { id: 'c11_chem_4', chapterNumber: 4, name: 'Chemical Bonding and Molecular Structure', subject: 'Chemistry' },
        { id: 'c11_chem_5', chapterNumber: 5, name: 'Chemical Thermodynamics', subject: 'Chemistry' },
        { id: 'c11_chem_6', chapterNumber: 6, name: 'Equilibrium', subject: 'Chemistry' },
        { id: 'c11_chem_7', chapterNumber: 7, name: 'Redox Reactions', subject: 'Chemistry' },
        { id: 'c11_chem_8', chapterNumber: 8, name: 'Organic Chemistry: Some Basic Principles and Techniques', subject: 'Chemistry' },
        { id: 'c11_chem_9', chapterNumber: 9, name: 'Hydrocarbons', subject: 'Chemistry' },
      ],
    },
    {
      subject: 'Mathematics',
      color: 'indigo',
      chapters: [
        { id: 'c11_math_1', chapterNumber: 1, name: 'Sets', subject: 'Mathematics' },
        { id: 'c11_math_2', chapterNumber: 2, name: 'Relations and Functions', subject: 'Mathematics' },
        { id: 'c11_math_3', chapterNumber: 3, name: 'Trigonometric Functions', subject: 'Mathematics' },
        { id: 'c11_math_4', chapterNumber: 4, name: 'Complex Numbers and Quadratic Equations', subject: 'Mathematics' },
        { id: 'c11_math_5', chapterNumber: 5, name: 'Linear Inequalities', subject: 'Mathematics' },
        { id: 'c11_math_6', chapterNumber: 6, name: 'Permutations and Combinations', subject: 'Mathematics' },
        { id: 'c11_math_7', chapterNumber: 7, name: 'Binomial Theorem', subject: 'Mathematics' },
        { id: 'c11_math_8', chapterNumber: 8, name: 'Sequences and Series', subject: 'Mathematics' },
        { id: 'c11_math_9', chapterNumber: 9, name: 'Straight Lines', subject: 'Mathematics' },
        { id: 'c11_math_10', chapterNumber: 10, name: 'Conic Sections', subject: 'Mathematics' },
        { id: 'c11_math_11', chapterNumber: 11, name: 'Introduction to Three Dimensional Geometry', subject: 'Mathematics' },
        { id: 'c11_math_12', chapterNumber: 12, name: 'Limits and Derivatives', subject: 'Mathematics' },
        { id: 'c11_math_13', chapterNumber: 13, name: 'Statistics', subject: 'Mathematics' },
        { id: 'c11_math_14', chapterNumber: 14, name: 'Probability', subject: 'Mathematics' },
      ],
    },
  ],

  'Class 11_PCB': [
    {
      subject: 'Physics',
      color: 'cyan',
      chapters: [
        { id: 'c11_phy_1', chapterNumber: 1, name: 'Units and Measurements', subject: 'Physics' },
        { id: 'c11_phy_2', chapterNumber: 2, name: 'Motion in a Straight Line', subject: 'Physics' },
        { id: 'c11_phy_3', chapterNumber: 3, name: 'Motion in a Plane', subject: 'Physics' },
        { id: 'c11_phy_4', chapterNumber: 4, name: 'Laws of Motion', subject: 'Physics' },
        { id: 'c11_phy_5', chapterNumber: 5, name: 'Work, Energy and Power', subject: 'Physics' },
        { id: 'c11_phy_6', chapterNumber: 6, name: 'System of Particles and Rotational Motion', subject: 'Physics' },
        { id: 'c11_phy_7', chapterNumber: 7, name: 'Gravitation', subject: 'Physics' },
        { id: 'c11_phy_8', chapterNumber: 8, name: 'Mechanical Properties of Solids', subject: 'Physics' },
        { id: 'c11_phy_9', chapterNumber: 9, name: 'Mechanical Properties of Fluids', subject: 'Physics' },
        { id: 'c11_phy_10', chapterNumber: 10, name: 'Thermal Properties of Matter', subject: 'Physics' },
        { id: 'c11_phy_11', chapterNumber: 11, name: 'Thermodynamics', subject: 'Physics' },
        { id: 'c11_phy_12', chapterNumber: 12, name: 'Kinetic Theory', subject: 'Physics' },
        { id: 'c11_phy_13', chapterNumber: 13, name: 'Oscillations', subject: 'Physics' },
        { id: 'c11_phy_14', chapterNumber: 14, name: 'Waves', subject: 'Physics' },
      ],
    },
    {
      subject: 'Chemistry',
      color: 'emerald',
      chapters: [
        { id: 'c11_chem_1', chapterNumber: 1, name: 'Some Basic Concepts of Chemistry', subject: 'Chemistry' },
        { id: 'c11_chem_2', chapterNumber: 2, name: 'Structure of Atom', subject: 'Chemistry' },
        { id: 'c11_chem_3', chapterNumber: 3, name: 'Classification of Elements and Periodicity in Properties', subject: 'Chemistry' },
        { id: 'c11_chem_4', chapterNumber: 4, name: 'Chemical Bonding and Molecular Structure', subject: 'Chemistry' },
        { id: 'c11_chem_5', chapterNumber: 5, name: 'Chemical Thermodynamics', subject: 'Chemistry' },
        { id: 'c11_chem_6', chapterNumber: 6, name: 'Equilibrium', subject: 'Chemistry' },
        { id: 'c11_chem_7', chapterNumber: 7, name: 'Redox Reactions', subject: 'Chemistry' },
        { id: 'c11_chem_8', chapterNumber: 8, name: 'Organic Chemistry: Some Basic Principles and Techniques', subject: 'Chemistry' },
        { id: 'c11_chem_9', chapterNumber: 9, name: 'Hydrocarbons', subject: 'Chemistry' },
      ],
    },
    {
      subject: 'Biology',
      color: 'teal',
      chapters: [
        { id: 'c11_bio_1', chapterNumber: 1, name: 'The Living World', subject: 'Biology' },
        { id: 'c11_bio_2', chapterNumber: 2, name: 'Biological Classification', subject: 'Biology' },
        { id: 'c11_bio_3', chapterNumber: 3, name: 'Plant Kingdom', subject: 'Biology' },
        { id: 'c11_bio_4', chapterNumber: 4, name: 'Animal Kingdom', subject: 'Biology' },
        { id: 'c11_bio_5', chapterNumber: 5, name: 'Morphology of Flowering Plants', subject: 'Biology' },
        { id: 'c11_bio_6', chapterNumber: 6, name: 'Anatomy of Flowering Plants', subject: 'Biology' },
        { id: 'c11_bio_7', chapterNumber: 7, name: 'Structural Organisation in Animals', subject: 'Biology' },
        { id: 'c11_bio_8', chapterNumber: 8, name: 'Cell: The Unit of Life', subject: 'Biology' },
        { id: 'c11_bio_9', chapterNumber: 9, name: 'Biomolecules', subject: 'Biology' },
        { id: 'c11_bio_10', chapterNumber: 10, name: 'Cell Cycle and Cell Division', subject: 'Biology' },
        { id: 'c11_bio_11', chapterNumber: 11, name: 'Photosynthesis in Higher Plants', subject: 'Biology' },
        { id: 'c11_bio_12', chapterNumber: 12, name: 'Respiration in Plants', subject: 'Biology' },
        { id: 'c11_bio_13', chapterNumber: 13, name: 'Plant Growth and Development', subject: 'Biology' },
        { id: 'c11_bio_14', chapterNumber: 14, name: 'Breathing and Exchange of Gases', subject: 'Biology' },
        { id: 'c11_bio_15', chapterNumber: 15, name: 'Body Fluids and Circulation', subject: 'Biology' },
        { id: 'c11_bio_16', chapterNumber: 16, name: 'Excretory Products and their Elimination', subject: 'Biology' },
        { id: 'c11_bio_17', chapterNumber: 17, name: 'Locomotion and Movement', subject: 'Biology' },
        { id: 'c11_bio_18', chapterNumber: 18, name: 'Neural Control and Coordination', subject: 'Biology' },
        { id: 'c11_bio_19', chapterNumber: 19, name: 'Chemical Coordination and Integration', subject: 'Biology' },
      ],
    },
  ],

  'Class 11_COMMERCE': [
    {
      subject: 'Accountancy',
      color: 'amber',
      chapters: [
        { id: 'c11_acc_1', chapterNumber: 1, name: 'Introduction to Accounting', subject: 'Accountancy' },
        { id: 'c11_acc_2', chapterNumber: 2, name: 'Theory Base of Accounting', subject: 'Accountancy' },
        { id: 'c11_acc_3', chapterNumber: 3, name: 'Recording of Transactions - I (Journal, Ledger)', subject: 'Accountancy' },
        { id: 'c11_acc_4', chapterNumber: 4, name: 'Recording of Transactions - II (Cash Book, Special Journals)', subject: 'Accountancy' },
        { id: 'c11_acc_5', chapterNumber: 5, name: 'Bank Reconciliation Statement', subject: 'Accountancy' },
        { id: 'c11_acc_6', chapterNumber: 6, name: 'Trial Balance and Rectification of Errors', subject: 'Accountancy' },
        { id: 'c11_acc_7', chapterNumber: 7, name: 'Depreciation, Provisions and Reserves', subject: 'Accountancy' },
        { id: 'c11_acc_8', chapterNumber: 8, name: 'Financial Statements of Sole Proprietorship', subject: 'Accountancy' },
      ],
    },
    {
      subject: 'Economics',
      color: 'emerald',
      chapters: [
        { id: 'c11_eco_1', chapterNumber: 1, name: 'Statistics: Introduction & Collection of Data', subject: 'Economics' },
        { id: 'c11_eco_2', chapterNumber: 2, name: 'Organisation & Presentation of Data', subject: 'Economics' },
        { id: 'c11_eco_3', chapterNumber: 3, name: 'Measures of Central Tendency (Mean, Median, Mode)', subject: 'Economics' },
        { id: 'c11_eco_4', chapterNumber: 4, name: 'Correlation & Index Numbers', subject: 'Economics' },
        { id: 'c11_eco_5', chapterNumber: 5, name: 'Microeconomics: Introduction & Central Problems', subject: 'Economics' },
        { id: 'c11_eco_6', chapterNumber: 6, name: "Consumer's Equilibrium and Demand", subject: 'Economics' },
        { id: 'c11_eco_7', chapterNumber: 7, name: "Producer's Behaviour and Supply", subject: 'Economics' },
        { id: 'c11_eco_8', chapterNumber: 8, name: 'Forms of Market and Price Determination', subject: 'Economics' },
      ],
    },
    {
      subject: 'Business Studies',
      color: 'indigo',
      chapters: [
        { id: 'c11_bst_1', chapterNumber: 1, name: 'Nature and Purpose of Business', subject: 'Business Studies' },
        { id: 'c11_bst_2', chapterNumber: 2, name: 'Forms of Business Organisations', subject: 'Business Studies' },
        { id: 'c11_bst_3', chapterNumber: 3, name: 'Public, Private and Global Enterprises', subject: 'Business Studies' },
        { id: 'c11_bst_4', chapterNumber: 4, name: 'Business Services', subject: 'Business Studies' },
        { id: 'c11_bst_5', chapterNumber: 5, name: 'Emerging Modes of Business', subject: 'Business Studies' },
        { id: 'c11_bst_6', chapterNumber: 6, name: 'Social Responsibilities of Business and Business Ethics', subject: 'Business Studies' },
        { id: 'c11_bst_7', chapterNumber: 7, name: 'Sources of Business Finance', subject: 'Business Studies' },
        { id: 'c11_bst_8', chapterNumber: 8, name: 'Small Business and Enterprises', subject: 'Business Studies' },
        { id: 'c11_bst_9', chapterNumber: 9, name: 'Internal Trade', subject: 'Business Studies' },
        { id: 'c11_bst_10', chapterNumber: 10, name: 'International Business', subject: 'Business Studies' },
      ],
    },
  ],

  'Class 11_ARTS': [
    {
      subject: 'History',
      color: 'rose',
      chapters: [
        { id: 'c11_his_1', chapterNumber: 1, name: 'Writing and City Life (Mesopotamia)', subject: 'History' },
        { id: 'c11_his_2', chapterNumber: 2, name: 'An Empire Across Three Continents (Roman Empire)', subject: 'History' },
        { id: 'c11_his_3', chapterNumber: 3, name: 'Nomadic Empires (Mongols)', subject: 'History' },
        { id: 'c11_his_4', chapterNumber: 4, name: 'The Three Orders (Feudal Society)', subject: 'History' },
        { id: 'c11_his_5', chapterNumber: 5, name: 'Changing Cultural Traditions', subject: 'History' },
        { id: 'c11_his_6', chapterNumber: 6, name: 'Displacing Indigenous Peoples', subject: 'History' },
        { id: 'c11_his_7', chapterNumber: 7, name: 'Paths to Modernisation (East Asia)', subject: 'History' },
      ],
    },
    {
      subject: 'Political Science',
      color: 'violet',
      chapters: [
        { id: 'c11_pol_1', chapterNumber: 1, name: 'Constitution: Why and How?', subject: 'Political Science' },
        { id: 'c11_pol_2', chapterNumber: 2, name: 'Rights in the Indian Constitution', subject: 'Political Science' },
        { id: 'c11_pol_3', chapterNumber: 3, name: 'Election and Representation', subject: 'Political Science' },
        { id: 'c11_pol_4', chapterNumber: 4, name: 'Executive, Legislature and Judiciary', subject: 'Political Science' },
        { id: 'c11_pol_5', chapterNumber: 5, name: 'Federalism and Local Governments', subject: 'Political Science' },
        { id: 'c11_pol_6', chapterNumber: 6, name: 'Political Theory: An Introduction', subject: 'Political Science' },
        { id: 'c11_pol_7', chapterNumber: 7, name: 'Freedom, Equality and Social Justice', subject: 'Political Science' },
        { id: 'c11_pol_8', chapterNumber: 8, name: 'Rights, Citizenship and Nationalism', subject: 'Political Science' },
      ],
    },
    {
      subject: 'Psychology / Sociology',
      color: 'amber',
      chapters: [
        { id: 'c11_soc_1', chapterNumber: 1, name: 'Introducing Sociology & Society', subject: 'Psychology / Sociology' },
        { id: 'c11_soc_2', chapterNumber: 2, name: 'Social Institutions & Culture', subject: 'Psychology / Sociology' },
        { id: 'c11_soc_3', chapterNumber: 3, name: 'Methods of Enquiry in Psychology', subject: 'Psychology / Sociology' },
        { id: 'c11_soc_4', chapterNumber: 4, name: 'The Bases of Human Behaviour', subject: 'Psychology / Sociology' },
        { id: 'c11_soc_5', chapterNumber: 5, name: 'Human Development and Learning', subject: 'Psychology / Sociology' },
        { id: 'c11_soc_6', chapterNumber: 6, name: 'Human Memory and Thinking', subject: 'Psychology / Sociology' },
      ],
    },
  ],

  // ----------------------------------------------------
  // CLASS 12 - STREAM SPECIFIC (NCERT)
  // ----------------------------------------------------
  'Class 12_PCM': [
    {
      subject: 'Physics',
      color: 'cyan',
      chapters: [
        { id: 'c12_phy_1', chapterNumber: 1, name: 'Electric Charges and Fields', subject: 'Physics' },
        { id: 'c12_phy_2', chapterNumber: 2, name: 'Electrostatic Potential and Capacitance', subject: 'Physics' },
        { id: 'c12_phy_3', chapterNumber: 3, name: 'Current Electricity', subject: 'Physics' },
        { id: 'c12_phy_4', chapterNumber: 4, name: 'Moving Charges and Magnetism', subject: 'Physics' },
        { id: 'c12_phy_5', chapterNumber: 5, name: 'Magnetism and Matter', subject: 'Physics' },
        { id: 'c12_phy_6', chapterNumber: 6, name: 'Electromagnetic Induction', subject: 'Physics' },
        { id: 'c12_phy_7', chapterNumber: 7, name: 'Alternating Current', subject: 'Physics' },
        { id: 'c12_phy_8', chapterNumber: 8, name: 'Electromagnetic Waves', subject: 'Physics' },
        { id: 'c12_phy_9', chapterNumber: 9, name: 'Ray Optics and Optical Instruments', subject: 'Physics' },
        { id: 'c12_phy_10', chapterNumber: 10, name: 'Wave Optics', subject: 'Physics' },
        { id: 'c12_phy_11', chapterNumber: 11, name: 'Dual Nature of Radiation and Matter', subject: 'Physics' },
        { id: 'c12_phy_12', chapterNumber: 12, name: 'Atoms', subject: 'Physics' },
        { id: 'c12_phy_13', chapterNumber: 13, name: 'Nuclei', subject: 'Physics' },
        { id: 'c12_phy_14', chapterNumber: 14, name: 'Semiconductor Electronics: Materials, Devices and Simple Circuits', subject: 'Physics' },
      ],
    },
    {
      subject: 'Chemistry',
      color: 'emerald',
      chapters: [
        { id: 'c12_chem_1', chapterNumber: 1, name: 'Solutions', subject: 'Chemistry' },
        { id: 'c12_chem_2', chapterNumber: 2, name: 'Electrochemistry', subject: 'Chemistry' },
        { id: 'c12_chem_3', chapterNumber: 3, name: 'Chemical Kinetics', subject: 'Chemistry' },
        { id: 'c12_chem_4', chapterNumber: 4, name: 'The d- and f-Block Elements', subject: 'Chemistry' },
        { id: 'c12_chem_5', chapterNumber: 5, name: 'Coordination Compounds', subject: 'Chemistry' },
        { id: 'c12_chem_6', chapterNumber: 6, name: 'Haloalkanes and Haloarenes', subject: 'Chemistry' },
        { id: 'c12_chem_7', chapterNumber: 7, name: 'Alcohols, Phenols and Ethers', subject: 'Chemistry' },
        { id: 'c12_chem_8', chapterNumber: 8, name: 'Aldehydes, Ketones and Carboxylic Acids', subject: 'Chemistry' },
        { id: 'c12_chem_9', chapterNumber: 9, name: 'Amines', subject: 'Chemistry' },
        { id: 'c12_chem_10', chapterNumber: 10, name: 'Biomolecules', subject: 'Chemistry' },
      ],
    },
    {
      subject: 'Mathematics',
      color: 'indigo',
      chapters: [
        { id: 'c12_math_1', chapterNumber: 1, name: 'Relations and Functions', subject: 'Mathematics' },
        { id: 'c12_math_2', chapterNumber: 2, name: 'Inverse Trigonometric Functions', subject: 'Mathematics' },
        { id: 'c12_math_3', chapterNumber: 3, name: 'Matrices', subject: 'Mathematics' },
        { id: 'c12_math_4', chapterNumber: 4, name: 'Determinants', subject: 'Mathematics' },
        { id: 'c12_math_5', chapterNumber: 5, name: 'Continuity and Differentiability', subject: 'Mathematics' },
        { id: 'c12_math_6', chapterNumber: 6, name: 'Application of Derivatives', subject: 'Mathematics' },
        { id: 'c12_math_7', chapterNumber: 7, name: 'Integrals', subject: 'Mathematics' },
        { id: 'c12_math_8', chapterNumber: 8, name: 'Application of Integrals', subject: 'Mathematics' },
        { id: 'c12_math_9', chapterNumber: 9, name: 'Differential Equations', subject: 'Mathematics' },
        { id: 'c12_math_10', chapterNumber: 10, name: 'Vector Algebra', subject: 'Mathematics' },
        { id: 'c12_math_11', chapterNumber: 11, name: 'Three Dimensional Geometry', subject: 'Mathematics' },
        { id: 'c12_math_12', chapterNumber: 12, name: 'Linear Programming', subject: 'Mathematics' },
        { id: 'c12_math_13', chapterNumber: 13, name: 'Probability', subject: 'Mathematics' },
      ],
    },
  ],

  'Class 12_PCB': [
    {
      subject: 'Physics',
      color: 'cyan',
      chapters: [
        { id: 'c12_phy_1', chapterNumber: 1, name: 'Electric Charges and Fields', subject: 'Physics' },
        { id: 'c12_phy_2', chapterNumber: 2, name: 'Electrostatic Potential and Capacitance', subject: 'Physics' },
        { id: 'c12_phy_3', chapterNumber: 3, name: 'Current Electricity', subject: 'Physics' },
        { id: 'c12_phy_4', chapterNumber: 4, name: 'Moving Charges and Magnetism', subject: 'Physics' },
        { id: 'c12_phy_5', chapterNumber: 5, name: 'Magnetism and Matter', subject: 'Physics' },
        { id: 'c12_phy_6', chapterNumber: 6, name: 'Electromagnetic Induction', subject: 'Physics' },
        { id: 'c12_phy_7', chapterNumber: 7, name: 'Alternating Current', subject: 'Physics' },
        { id: 'c12_phy_8', chapterNumber: 8, name: 'Electromagnetic Waves', subject: 'Physics' },
        { id: 'c12_phy_9', chapterNumber: 9, name: 'Ray Optics and Optical Instruments', subject: 'Physics' },
        { id: 'c12_phy_10', chapterNumber: 10, name: 'Wave Optics', subject: 'Physics' },
        { id: 'c12_phy_11', chapterNumber: 11, name: 'Dual Nature of Radiation and Matter', subject: 'Physics' },
        { id: 'c12_phy_12', chapterNumber: 12, name: 'Atoms', subject: 'Physics' },
        { id: 'c12_phy_13', chapterNumber: 13, name: 'Nuclei', subject: 'Physics' },
        { id: 'c12_phy_14', chapterNumber: 14, name: 'Semiconductor Electronics: Materials, Devices and Simple Circuits', subject: 'Physics' },
      ],
    },
    {
      subject: 'Chemistry',
      color: 'emerald',
      chapters: [
        { id: 'c12_chem_1', chapterNumber: 1, name: 'Solutions', subject: 'Chemistry' },
        { id: 'c12_chem_2', chapterNumber: 2, name: 'Electrochemistry', subject: 'Chemistry' },
        { id: 'c12_chem_3', chapterNumber: 3, name: 'Chemical Kinetics', subject: 'Chemistry' },
        { id: 'c12_chem_4', chapterNumber: 4, name: 'The d- and f-Block Elements', subject: 'Chemistry' },
        { id: 'c12_chem_5', chapterNumber: 5, name: 'Coordination Compounds', subject: 'Chemistry' },
        { id: 'c12_chem_6', chapterNumber: 6, name: 'Haloalkanes and Haloarenes', subject: 'Chemistry' },
        { id: 'c12_chem_7', chapterNumber: 7, name: 'Alcohols, Phenols and Ethers', subject: 'Chemistry' },
        { id: 'c12_chem_8', chapterNumber: 8, name: 'Aldehydes, Ketones and Carboxylic Acids', subject: 'Chemistry' },
        { id: 'c12_chem_9', chapterNumber: 9, name: 'Amines', subject: 'Chemistry' },
        { id: 'c12_chem_10', chapterNumber: 10, name: 'Biomolecules', subject: 'Chemistry' },
      ],
    },
    {
      subject: 'Biology',
      color: 'teal',
      chapters: [
        { id: 'c12_bio_1', chapterNumber: 1, name: 'Sexual Reproduction in Flowering Plants', subject: 'Biology' },
        { id: 'c12_bio_2', chapterNumber: 2, name: 'Human Reproduction', subject: 'Biology' },
        { id: 'c12_bio_3', chapterNumber: 3, name: 'Reproductive Health', subject: 'Biology' },
        { id: 'c12_bio_4', chapterNumber: 4, name: 'Principles of Inheritance and Variation', subject: 'Biology' },
        { id: 'c12_bio_5', chapterNumber: 5, name: 'Molecular Basis of Inheritance', subject: 'Biology' },
        { id: 'c12_bio_6', chapterNumber: 6, name: 'Evolution', subject: 'Biology' },
        { id: 'c12_bio_7', chapterNumber: 7, name: 'Human Health and Disease', subject: 'Biology' },
        { id: 'c12_bio_8', chapterNumber: 8, name: 'Microbes in Human Welfare', subject: 'Biology' },
        { id: 'c12_bio_9', chapterNumber: 9, name: 'Biotechnology - Principles and Processes', subject: 'Biology' },
        { id: 'c12_bio_10', chapterNumber: 10, name: 'Biotechnology and its Applications', subject: 'Biology' },
        { id: 'c12_bio_11', chapterNumber: 11, name: 'Organisms and Populations', subject: 'Biology' },
        { id: 'c12_bio_12', chapterNumber: 12, name: 'Ecosystem', subject: 'Biology' },
        { id: 'c12_bio_13', chapterNumber: 13, name: 'Biodiversity and Conservation', subject: 'Biology' },
      ],
    },
  ],

  'Class 12_COMMERCE': [
    {
      subject: 'Accountancy',
      color: 'amber',
      chapters: [
        { id: 'c12_acc_1', chapterNumber: 1, name: 'Accounting for Partnership: Basic Concepts', subject: 'Accountancy' },
        { id: 'c12_acc_2', chapterNumber: 2, name: 'Reconstitution of a Partnership: Admission of a Partner', subject: 'Accountancy' },
        { id: 'c12_acc_3', chapterNumber: 3, name: 'Reconstitution of a Partnership: Retirement/Death of a Partner', subject: 'Accountancy' },
        { id: 'c12_acc_4', chapterNumber: 4, name: 'Dissolution of a Partnership Firm', subject: 'Accountancy' },
        { id: 'c12_acc_5', chapterNumber: 5, name: 'Accounting for Share Capital', subject: 'Accountancy' },
        { id: 'c12_acc_6', chapterNumber: 6, name: 'Issue and Redemption of Debentures', subject: 'Accountancy' },
        { id: 'c12_acc_7', chapterNumber: 7, name: 'Financial Statements of a Company', subject: 'Accountancy' },
        { id: 'c12_acc_8', chapterNumber: 8, name: 'Accounting Ratios & Cash Flow Statement', subject: 'Accountancy' },
      ],
    },
    {
      subject: 'Economics',
      color: 'emerald',
      chapters: [
        { id: 'c12_eco_1', chapterNumber: 1, name: 'National Income and Related Aggregates', subject: 'Economics' },
        { id: 'c12_eco_2', chapterNumber: 2, name: 'Money and Banking', subject: 'Economics' },
        { id: 'c12_eco_3', chapterNumber: 3, name: 'Determination of Income and Employment', subject: 'Economics' },
        { id: 'c12_eco_4', chapterNumber: 4, name: 'Government Budget and the Economy', subject: 'Economics' },
        { id: 'c12_eco_5', chapterNumber: 5, name: 'Balance of Payments and Foreign Exchange', subject: 'Economics' },
        { id: 'c12_eco_6', chapterNumber: 6, name: 'Development Experience (1947-90) & Economic Reforms', subject: 'Economics' },
        { id: 'c12_eco_7', chapterNumber: 7, name: 'Current Challenges Facing Indian Economy', subject: 'Economics' },
        { id: 'c12_eco_8', chapterNumber: 8, name: 'Comparative Development Experiences of India and its Neighbours', subject: 'Economics' },
      ],
    },
    {
      subject: 'Business Studies',
      color: 'indigo',
      chapters: [
        { id: 'c12_bst_1', chapterNumber: 1, name: 'Nature and Significance of Management', subject: 'Business Studies' },
        { id: 'c12_bst_2', chapterNumber: 2, name: 'Principles of Management', subject: 'Business Studies' },
        { id: 'c12_bst_3', chapterNumber: 3, name: 'Business Environment', subject: 'Business Studies' },
        { id: 'c12_bst_4', chapterNumber: 4, name: 'Planning', subject: 'Business Studies' },
        { id: 'c12_bst_5', chapterNumber: 5, name: 'Organising', subject: 'Business Studies' },
        { id: 'c12_bst_6', chapterNumber: 6, name: 'Staffing', subject: 'Business Studies' },
        { id: 'c12_bst_7', chapterNumber: 7, name: 'Directing', subject: 'Business Studies' },
        { id: 'c12_bst_8', chapterNumber: 8, name: 'Controlling', subject: 'Business Studies' },
        { id: 'c12_bst_9', chapterNumber: 9, name: 'Financial Management', subject: 'Business Studies' },
        { id: 'c12_bst_10', chapterNumber: 10, name: 'Financial Markets', subject: 'Business Studies' },
        { id: 'c12_bst_11', chapterNumber: 11, name: 'Marketing', subject: 'Business Studies' },
        { id: 'c12_bst_12', chapterNumber: 12, name: 'Consumer Protection', subject: 'Business Studies' },
      ],
    },
  ],

  'Class 12_ARTS': [
    {
      subject: 'History',
      color: 'rose',
      chapters: [
        { id: 'c12_his_1', chapterNumber: 1, name: 'Bricks, Beads and Bones (Harappan Civilisation)', subject: 'History' },
        { id: 'c12_his_2', chapterNumber: 2, name: 'Kings, Farmers and Towns (Early States and Economies)', subject: 'History' },
        { id: 'c12_his_3', chapterNumber: 3, name: 'Kinship, Caste and Class (Early Societies)', subject: 'History' },
        { id: 'c12_his_4', chapterNumber: 4, name: 'Thinkers, Beliefs and Buildings (Cultural Developments)', subject: 'History' },
        { id: 'c12_his_5', chapterNumber: 5, name: 'Through the Eyes of Travellers', subject: 'History' },
        { id: 'c12_his_6', chapterNumber: 6, name: 'Bhakti-Sufi Traditions', subject: 'History' },
        { id: 'c12_his_7', chapterNumber: 7, name: 'An Imperial Capital: Vijayanagara', subject: 'History' },
        { id: 'c12_his_8', chapterNumber: 8, name: 'Peasants, Zamindars and the State', subject: 'History' },
        { id: 'c12_his_9', chapterNumber: 9, name: 'Colonialism and the Countryside', subject: 'History' },
        { id: 'c12_his_10', chapterNumber: 10, name: 'Rebels and the Raj (1857 Revolt)', subject: 'History' },
        { id: 'c12_his_11', chapterNumber: 11, name: 'Mahatma Gandhi and the Nationalist Movement', subject: 'History' },
        { id: 'c12_his_12', chapterNumber: 12, name: 'Framing the Constitution', subject: 'History' },
      ],
    },
    {
      subject: 'Political Science',
      color: 'violet',
      chapters: [
        { id: 'c12_pol_1', chapterNumber: 1, name: 'The End of Bipolarity', subject: 'Political Science' },
        { id: 'c12_pol_2', chapterNumber: 2, name: 'Contemporary Centres of Power (EU, ASEAN, BRICS)', subject: 'Political Science' },
        { id: 'c12_pol_3', chapterNumber: 3, name: 'Contemporary South Asia', subject: 'Political Science' },
        { id: 'c12_pol_4', chapterNumber: 4, name: 'International Organisations (UN)', subject: 'Political Science' },
        { id: 'c12_pol_5', chapterNumber: 5, name: 'Security in the Contemporary World', subject: 'Political Science' },
        { id: 'c12_pol_6', chapterNumber: 6, name: 'Environment and Natural Resources', subject: 'Political Science' },
        { id: 'c12_pol_7', chapterNumber: 7, name: 'Globalisation', subject: 'Political Science' },
        { id: 'c12_pol_8', chapterNumber: 8, name: 'Challenges of Nation-Building', subject: 'Political Science' },
        { id: 'c12_pol_9', chapterNumber: 9, name: 'Era of One-Party Dominance', subject: 'Political Science' },
        { id: 'c12_pol_10', chapterNumber: 10, name: 'Politics of Planned Development & External Relations', subject: 'Political Science' },
      ],
    },
    {
      subject: 'Psychology / Sociology',
      color: 'amber',
      chapters: [
        { id: 'c12_soc_1', chapterNumber: 1, name: 'Variations in Psychological Attributes (Intelligence)', subject: 'Psychology / Sociology' },
        { id: 'c12_soc_2', chapterNumber: 2, name: 'Self and Personality', subject: 'Psychology / Sociology' },
        { id: 'c12_soc_3', chapterNumber: 3, name: 'Meeting Life Challenges (Stress Management)', subject: 'Psychology / Sociology' },
        { id: 'c12_soc_4', chapterNumber: 4, name: 'Psychological Disorders & Psychotherapy', subject: 'Psychology / Sociology' },
        { id: 'c12_soc_5', chapterNumber: 5, name: 'Social Institutions: Continuity and Change', subject: 'Psychology / Sociology' },
        { id: 'c12_soc_6', chapterNumber: 6, name: 'Patterns of Social Inequality and Exclusion', subject: 'Psychology / Sociology' },
        { id: 'c12_soc_7', chapterNumber: 7, name: 'The Challenges of Cultural Diversity', subject: 'Psychology / Sociology' },
      ],
    },
  ],
};

export function getNcertChapters(grade: GradeLevel, stream?: StudentStream): NcertSubjectGroup[] {
  if (grade === 'Class 8') {
    // Strictly NOT available in Class 8 as requested
    return [];
  }

  if (grade === 'Class 9') {
    return NCERT_DATABASE['Class 9'] || [];
  }

  if (grade === 'Class 10') {
    return NCERT_DATABASE['Class 10'] || [];
  }

  if (grade === 'Class 11') {
    const key = `Class 11_${stream || 'PCM'}`;
    return NCERT_DATABASE[key] || NCERT_DATABASE['Class 11_PCM'] || [];
  }

  if (grade === 'Class 12') {
    const key = `Class 12_${stream || 'PCM'}`;
    return NCERT_DATABASE[key] || NCERT_DATABASE['Class 12_PCM'] || [];
  }

  return [];
}
