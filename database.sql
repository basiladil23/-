-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client_id TEXT UNIQUE NOT NULL,
    address TEXT,
    nationality TEXT,
    id_number TEXT,
    phone TEXT,
    workplace TEXT,
    birth_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الجنسيات (للاستخدام في القوائم المنسدلة)
CREATE TABLE IF NOT EXISTS nationalities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- إدخال بيانات افتراضية للجنسيات
INSERT OR IGNORE INTO nationalities (name) VALUES 
('السعودية'),
('الفلبين'),
('إثيوبيا'),
('مصر'),
('الأردن'),
('الكويت');

-- إنشاء جدول المهنة
CREATE TABLE IF NOT EXISTS professions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- إدخال بيانات افتراضية للمهن
INSERT OR IGNORE INTO professions (name) VALUES 
('مُهندس'),
('عامل'),
('طبيب'),
('معلم');

-- إنشاء جدول الديانات
CREATE TABLE IF NOT EXISTS religions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- إدخال بيانات افتراضية للديانات
INSERT OR IGNORE INTO religions (name) VALUES 
('مسلم'),
('مسيحي'),
('آخر');

-- إنشاء جدول العقود
CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    contract_number TEXT UNIQUE NOT NULL,
    nationality_id INTEGER,
    cv_id INTEGER,
    contract_date DATE NOT NULL,
    duration TEXT,
    visa_type TEXT,
    visa_number TEXT,
    musaned_contract_number TEXT,
    passport_number TEXT,
    candidates_count INTEGER DEFAULT 1,
    candidate_age INTEGER,
    candidate_religion_id INTEGER,
    direct_recruitment_cost REAL DEFAULT 0,
    insurance_cost REAL DEFAULT 0,
    external_recruitment_cost REAL DEFAULT 0,
    government_cost REAL DEFAULT 0,
    bank_cost REAL DEFAULT 0,
    tax_percentage REAL DEFAULT 15,
    total_cost REAL AS (direct_recruitment_cost + insurance_cost + external_recruitment_cost + government_cost + bank_cost),
    visa_date DATE,
    external_office TEXT,
    internal_office TEXT,
    contract_source TEXT,
    profession_id INTEGER,
    arrival_location TEXT,
    monthly_salary REAL,
    arrival_airport TEXT,
    terms_and_benefits TEXT,
    qualifications TEXT,
    cost_center TEXT,
    marketer TEXT,
    marketer_fee REAL,
    arrival_date DATE,
    arrival_time TIME,
    flight_number TEXT,
    contract_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (nationality_id) REFERENCES nationalities(id),
    FOREIGN KEY (candidate_religion_id) REFERENCES religions(id),
    FOREIGN KEY (profession_id) REFERENCES professions(id)
);

-- إنشاء جدول السير الذاتية
CREATE TABLE IF NOT EXISTS cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    profession_id INTEGER,
    nationality_id INTEGER,
    religion_id INTEGER,
    age INTEGER,
    experience TEXT,
    office TEXT,
    passport_number TEXT,
    notes TEXT,
    status TEXT DEFAULT 'متوفر',
    file_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profession_id) REFERENCES professions(id),
    FOREIGN KEY (nationality_id) REFERENCES nationalities(id),
    FOREIGN KEY (religion_id) REFERENCES religions(id)
);

-- إنشاء جدول العمال (الإيواء)
CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sponsor_name TEXT,
    nationality_id INTEGER,
    border_number TEXT,
    residence_number TEXT,
    profession_id INTEGER,
    age INTEGER,
    kingdom_entry_date DATE,
    office_entry_date DATE,
    passport_number TEXT,
    office TEXT,
    accommodation_type TEXT,
    religion_id INTEGER,
    experience TEXT,
    passport_file TEXT,
    other_attachments TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nationality_id) REFERENCES nationalities(id),
    FOREIGN KEY (profession_id) REFERENCES professions(id),
    FOREIGN KEY (religion_id) REFERENCES religions(id)
);

-- إنشاء جدول المحاسبة (سندات القيد)
CREATE TABLE IF NOT EXISTS accounting_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    account_code TEXT NOT NULL,
    debit REAL DEFAULT 0,
    credit REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المحاسبة (سندات الصرف)
CREATE TABLE IF NOT EXISTS payment_vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    payee TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    account_code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المحاسبة (سندات القبض)
CREATE TABLE IF NOT EXISTS receipt_vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    payer TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    account_code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول شجرة الحسابات
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN ('الأصول', 'الالتزامات', 'حقوق الملكية', 'الإيرادات', 'المصروفات')),
    parent_id INTEGER,
    balance REAL DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES chart_of_accounts(id)
);

-- إدخال بيانات افتراضية لشجرة الحسابات
INSERT OR IGNORE INTO chart_of_accounts (account_code, account_name, account_type, parent_id) VALUES 
('1000', 'الأصول', 'الأصول', NULL),
('1100', 'النقد', 'الأصول', 1),
('1110', 'النقد في الخزينة', 'الأصول', 2),
('1120', 'الحسابات البنكية', 'الأصول', 2),
('2000', 'الالتزامات', 'الالتزامات', NULL),
('2100', 'الحسابات الدائنة', 'الالتزامات', 5),
('3000', 'حقوق الملكية', 'حقوق الملكية', NULL),
('4000', 'الإيرادات', 'الإيرادات', NULL),
('4100', 'إيرادات المبيعات', 'الإيرادات', 8),
('5000', 'المصروفات', 'المصروفات', NULL),
('5100', 'مصروفات الرواتب', 'المصروفات', 10);

-- إنشاء جدول مراكز التكلفة
CREATE TABLE IF NOT EXISTS cost_centers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- إدخال بيانات افتراضية لمراكز التكلفة
INSERT OR IGNORE INTO cost_centers (name, description) VALUES 
('الفرع الرئيسي', 'الفرع الرئيسي في الرياض'),
('فرع جدة', 'فرع جدة'),
('فرع الدمام', 'فرع الدمام');

-- إنشاء جدول العملات
CREATE TABLE IF NOT EXISTS currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    exchange_rate REAL DEFAULT 1.0
);

-- إدخال بيانات افتراضية للعملات
INSERT OR IGNORE INTO currencies (code, name, exchange_rate) VALUES 
('SAR', 'الريال السعودي', 1.0),
('USD', 'الدولار الأمريكي', 3.75),
('EUR', 'اليورو', 4.0),
('PHP', 'البيزو الفلبيني', 0.067);

-- إنشاء جدول المصادر (مصدر العقد)
CREATE TABLE IF NOT EXISTS contract_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- إدخال بيانات افتراضية لمصادر العقود
INSERT OR IGNORE INTO contract_sources (name) VALUES 
('مساند'),
('مكتب خاص'),
('مصدر آخر');

-- إنشاء جدول المطارات
CREATE TABLE IF NOT EXISTS airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- إدخال بيانات افتراضية للمطارات
INSERT OR IGNORE INTO airports (code, name) VALUES 
('RUH', 'مطار الملك خالد الدولي - الرياض'),
('JED', 'مطار الملك عبدالعزيز الدولي - جدة'),
('DMM', 'مطار الملك فهد الدولي - الدمام');

-- إنشاء جدول المكاتب
CREATE TABLE IF NOT EXISTS offices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK(type IN ('داخلي', 'خارجي'))
);

-- إدخال بيانات افتراضية للمكاتب
INSERT OR IGNORE INTO offices (name, type) VALUES 
('PACIFIC STAR INTERNATIONAL', 'خارجي'),
('ILEL LIQA FOREIGN AGENCY', 'خارجي'),
('AL MADINA COMPANY', 'خارجي'),
('الفرع الرئيسي', 'داخلي'),
('فرع جدة', 'داخلي');

-- إنشاء جدول الشروط والمزايا
CREATE TABLE IF NOT EXISTS terms_and_benefits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- إدخال بيانات افتراضية للشروط والمزايا
INSERT OR IGNORE INTO terms_and_benefits (name) VALUES 
('سكن'),
('مواصلات'),
('تامين صحي'),
('إجازة سنوية');

-- إنشاء جدول المؤهلات والخبرة
CREATE TABLE IF NOT EXISTS qualifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- إدخال بيانات افتراضية للمؤهلات
INSERT OR IGNORE INTO qualifications (name) VALUES 
('دبلوم'),
('جامعة'),
('ماجستير'),
('دكتوراه');

-- إنشاء جدول المسوقين
CREATE TABLE IF NOT EXISTS marketers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    contact_info TEXT
);

-- إدخال بيانات افتراضية للمسوقين
INSERT OR IGNORE INTO marketers (name, contact_info) VALUES 
('مسوق 1', '0551234567'),
('مسوق 2', '0559876543');

-- إنشاء جدول المطارات
CREATE TABLE IF NOT EXISTS airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- إدخال بيانات افتراضية للمطارات
INSERT OR IGNORE INTO airports (code, name) VALUES 
('RUH', 'مطار الملك خالد الدولي - الرياض'),
('JED', 'مطار الملك عبدالعزيز الدولي - جدة'),
('DMM', 'مطار الملك فهد الدولي - الدمام');

-- إنشاء جدول الدول
CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    nationality TEXT NOT NULL
);

-- إدخال بيانات افتراضية للدول
INSERT OR IGNORE INTO countries (name, nationality) VALUES 
('المملكة العربية السعودية', 'سعودي'),
('الفلبين', 'فلبيني'),
('إثيوبيا', 'إثيوبي'),
('مصر', 'مصري'),
('الأردن', 'أردني'),
('الكويت', 'كويتي');

-- إنشاء جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL
);

-- إدخال إعدادات افتراضية
INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES 
('app_name', 'الفارس العالمي'),
('current_year', '2024'),
('tax_rate', '15');

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'employee', 'accountant')),
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إدخال مستخدم افتراضي (كلمة المرور: 123456)
INSERT OR IGNORE INTO users (username, password, role, full_name) VALUES 
('admin', 'e10adc3949ba59abbe56e057f20f883e', 'admin', 'المشرف العام');

-- إنشاء مؤشرات لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_date ON contracts(contract_date);
CREATE INDEX IF NOT EXISTS idx_workers_nationality ON workers(nationality_id);
CREATE INDEX IF NOT EXISTS idx_cvs_profession ON cvs(profession_id);