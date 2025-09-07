// ==========================
// تحسينات الأمان والبيانات الأساسية
// ==========================
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
let cvs = JSON.parse(localStorage.getItem('cvs')) || [];
let workers = JSON.parse(localStorage.getItem('workers')) || [];

// دالة حفظ البيانات في localStorage
function saveToStorage() {
  localStorage.setItem('clients', JSON.stringify(clients));
  localStorage.setItem('contracts', JSON.stringify(contracts));
  localStorage.setItem('cvs', JSON.stringify(cvs));
  localStorage.setItem('workers', JSON.stringify(workers));
}

// ==========================
// نظام الإشعارات المحسّن
// ==========================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast'; // إعادة تعيين الفئات
  toast.classList.add(type); // إضافة فئة النوع
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.className = 'toast', 300);
    }, 3000);
  }, 10);
}

// إضافة أنواع ألوان للإشعارات
const toastStyles = `
  .toast.success { background: var(--success); }
  .toast.warning { background: var(--warning); }
  .toast.error { background: var(--danger); }
  .toast.info { background: var(--secondary); }
`;

// إضافة أنماط إضافية للإشعارات
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);

// ==========================
// فتح النموذج (Modal/Form) - محسّن
// ==========================
function openForm(type) {
  const formContent = document.getElementById('formContent');
  formContent.innerHTML = '';
  
  if (type === 'client') {
    openClientForm();
  } else if (type === 'contract') {
    openContractForm();
  } else if (type === 'cv') {
    openCVForm();
  } else if (type === 'worker' || type === 'accommodation') {
    openWorkerForm();
  }

  const overlay = document.getElementById('formOverlay');
  overlay.style.display = 'flex';
  setTimeout(() => overlay.classList.add('show'), 10);
  
  // تحديث الأحداث بعد تحميل النموذج
  setupFormValidation();
}

// ==========================
// إغلاق النموذج - مع تأثير
// ==========================
function closeForm() {
  const overlay = document.getElementById('formOverlay');
  overlay.classList.remove('show');
  
  setTimeout(() => {
    overlay.style.display = 'none';
    // مسح محتوى النموذج لتجنب إعادة المدخلات القديمة
    document.getElementById('formContent').innerHTML = '';
  }, 300);
}

// ==========================
// نموذج العميل - تلقائي مع تحقق فوري
// ==========================
function openClientForm() {
  const nextClientID = generateNextClientID();
  
  document.getElementById('formContent').innerHTML = `
    <h2>إضافة عميل</h2>
    
    <div class="form-section">
      <h3>المعلومات الأساسية</h3>
      <div class="form-row">
        <div>
          <label>الاسم <span class="required">*</span></label>
          <input type="text" id="clientName" required>
          <div class="error-message" id="clientName-error"></div>
        </div>
        <div>
          <label>رقم العميل <span class="required">*</span></label>
          <input type="text" id="clientID" value="${nextClientID}" readonly>
          <div class="error-message" id="clientID-error"></div>
        </div>
      </div>
      <div class="form-row">
        <div>
          <label>العنوان <span class="required">*</span></label>
          <input type="text" id="clientAddress" required>
          <div class="error-message" id="clientAddress-error"></div>
        </div>
        <div>
          <label>الجنسية <span class="required">*</span></label>
          <select id="clientNationality" required>
            <option value="">اختر الجنسية</option>
            <option>السعودية</option>
            <option>الفلبين</option>
            <option>إثيوبيا</option>
            <option>مصر</option>
            <option>الأردن</option>
          </select>
          <div class="error-message" id="clientNationality-error"></div>
        </div>
      </div>
    </div>
    
    <div class="form-section">
      <h3>المعلومات الشخصية</h3>
      <div class="form-row">
        <div>
          <label>رقم الهوية <span class="required">*</span></label>
          <input type="text" id="clientIDNumber" maxlength="10" required>
          <div class="error-message" id="clientIDNumber-error"></div>
          <small class="hint">يجب أن يتكون من 10 أرقام فقط</small>
        </div>
        <div>
          <label>رقم الجوال <span class="required">*</span></label>
          <input type="tel" id="clientPhone" required>
          <div class="error-message" id="clientPhone-error"></div>
          <small class="hint">يجب أن يتكون من أرقام فقط</small>
        </div>
      </div>
      <div class="form-row">
        <div>
          <label>مكان العمل</label>
          <input type="text" id="clientWorkplace">
        </div>
        <div>
          <label>تاريخ الميلاد</label>
          <input type="date" id="clientBirth">
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <button type="button" class="btn-cancel" onclick="closeForm()">إلغاء</button>
      <button type="button" class="btn-submit" onclick="addClient()">إضافة عميل</button>
    </div>
  `;
}

// ==========================
// نموذج العقد - مع تحميل العملاء ديناميكيًا
// ==========================
function openContractForm() {
  if (clients.length === 0) {
    document.getElementById('formContent').innerHTML = `
      <h2>إضافة عقد</h2>
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i>
        لا توجد عملاء. يرجى إضافة عميل أولاً قبل إنشاء عقد.
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="closeForm()">إلغاء</button>
        <button type="button" class="btn-primary" onclick="openForm('client')">إضافة عميل</button>
      </div>
    `;
    return;
  }

  // إنشاء خيارات العملاء
  let clientsOptions = '';
  clients.forEach(client => {
    clientsOptions += `<option value="${client.id}">${client.name}</option>`;
  });

  document.getElementById('formContent').innerHTML = `
    <h2>عقد التوظيف</h2>
    
    <div class="form-section">
      <h3>المعلومات الأساسية</h3>
      <div class="form-row">
        <div>
          <label>العميل <span class="required">*</span></label>
          <select id="contractClient" required>
            <option value="">اختر عميل</option>
            ${clientsOptions}
          </select>
          <div class="error-message" id="contractClient-error"></div>
        </div>
        <div>
          <label>رقم العقد <span class="required">*</span></label>
          <input type="text" id="contractNumber" value="${generateNextContractNumber()}" readonly>
          <div class="error-message" id="contractNumber-error"></div>
        </div>
      </div>
      
      <div class="form-row">
        <div>
          <label>الجنسية <span class="required">*</span></label>
          <select id="contractNationality" required>
            <option value="">اختر الجنسية</option>
            <option>الفلبين</option>
            <option>إثيوبيا</option>
            <option>السعودية</option>
            <option>مصر</option>
            <option>الأردن</option>
          </select>
          <div class="error-message" id="contractNationality-error"></div>
        </div>
        <div>
          <label>السيرة الذاتية</label>
          <select id="contractCV">
            <option value="">اختر السيرة الذاتية</option>
            <!-- سيتم ملؤها ديناميكيًا -->
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div>
          <label>تاريخ العقد <span class="required">*</span></label>
          <input type="date" id="contractDate" required>
          <div class="error-message" id="contractDate-error"></div>
        </div>
        <div>
          <label>مدة العقد <span class="required">*</span></label>
          <input type="text" id="contractDuration" required>
          <div class="error-message" id="contractDuration-error"></div>
        </div>
      </div>
    </div>
    
    <!-- باقي أقسام النموذج -->
    <!-- ... -->
    
    <div class="form-actions">
      <button type="button" class="btn-cancel" onclick="closeForm()">إلغاء</button>
      <button type="button" class="btn-submit" onclick="addContract()">إضافة عقد</button>
    </div>
  `;
  
  // تعيين تاريخ العقد إلى اليوم
  document.getElementById('contractDate').valueAsDate = new Date();
  
  // ملء قائمة السير الذاتية
  populateCVOptions();
}

// ==========================
// تحميل السير الذاتية في قائمة العقد
// ==========================
function populateCVOptions() {
  const cvSelect = document.getElementById('contractCV');
  if (!cvSelect) return;
  
  // إفراغ الخيارات الحالية
  cvSelect.innerHTML = '<option value="">اختر السيرة الذاتية</option>';
  
  // إضافة السير الذاتية
  cvs.forEach(cv => {
    const option = document.createElement('option');
    option.value = cv.id || cv.name;
    option.textContent = cv.name;
    cvSelect.appendChild(option);
  });
}

// ==========================
// التحقق من صحة النموذج
// ==========================
function setupFormValidation() {
  // التحقق من رقم الهوية (10 أرقام فقط)
  const idNumberInput = document.getElementById('clientIDNumber');
  if (idNumberInput) {
    idNumberInput.addEventListener('input', function() {
      // السماح بالأرقام فقط
      this.value = this.value.replace(/[^0-9]/g, '');
      
      // تحديد الحد الأقصى لعدد الأرقام (10)
      if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
      }
      
      validateIDNumber();
    });
    
    idNumberInput.addEventListener('blur', validateIDNumber);
  }
  
  // التحقق من رقم الجوال (أرقام فقط)
  const phoneInput = document.getElementById('clientPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      // السماح بالأرقام فقط
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }
  
  // التحقق من رقم العميل (أرقام فقط وفريد)
  const clientIDInput = document.getElementById('clientID');
  if (clientIDInput) {
    clientIDInput.addEventListener('blur', function() {
      validateClientID();
    });
  }
  
  // التحقق من اسم العميل
  const clientNameInput = document.getElementById('clientName');
  if (clientNameInput) {
    clientNameInput.addEventListener('blur', function() {
      validateClientName();
    });
  }
}

// ==========================
// دوال التحقق الفرعي
// ==========================
function validateIDNumber() {
  const idNumberInput = document.getElementById('clientIDNumber');
  const errorElement = document.getElementById('clientIDNumber-error');
  
  if (!idNumberInput || !errorElement) return;
  
  const value = idNumberInput.value;
  
  if (!value) {
    errorElement.textContent = 'رقم الهوية مطلوب';
    errorElement.style.display = 'block';
    return false;
  }
  
  if (value.length !== 10) {
    errorElement.textContent = 'رقم الهوية يجب أن يتكون من 10 أرقام';
    errorElement.style.display = 'block';
    return false;
  }
  
  errorElement.style.display = 'none';
  return true;
}

function validateClientID() {
  const clientIDInput = document.getElementById('clientID');
  const errorElement = document.getElementById('clientID-error');
  
  if (!clientIDInput || !errorElement) return;
  
  const value = clientIDInput.value;
  
  if (!value) {
    errorElement.textContent = 'رقم العميل مطلوب';
    errorElement.style.display = 'block';
    return false;
  }
  
  if (!/^\d+$/.test(value)) {
    errorElement.textContent = 'رقم العميل يجب أن يتكون من أرقام فقط';
    errorElement.style.display = 'block';
    return false;
  }
  
  if (!isClientIDUnique(value)) {
    errorElement.textContent = 'رقم العميل موجود مسبقًا. يرجى اختيار رقم مختلف';
    errorElement.style.display = 'block';
    return false;
  }
  
  errorElement.style.display = 'none';
  return true;
}

function validateClientName() {
  const clientNameInput = document.getElementById('clientName');
  const errorElement = document.getElementById('clientName-error');
  
  if (!clientNameInput || !errorElement) return;
  
  if (!clientNameInput.value.trim()) {
    errorElement.textContent = 'اسم العميل مطلوب';
    errorElement.style.display = 'block';
    return false;
  }
  
  errorElement.style.display = 'none';
  return true;
}

// ==========================
// التحقق من فريدة رقم العميل
// ==========================
function isClientIDUnique(id) {
  return !clients.some(client => client.id === id);
}

// ==========================
// إضافة عميل - مع تحقق متكامل
// ==========================
function addClient() {
  // جمع البيانات
  const name = document.getElementById('clientName').value.trim();
  const id = document.getElementById('clientID').value;
  const address = document.getElementById('clientAddress').value.trim();
  const nationality = document.getElementById('clientNationality').value;
  const idNumber = document.getElementById('clientIDNumber').value;
  const phone = document.getElementById('clientPhone').value;
  const workplace = document.getElementById('clientWorkplace').value;
  const birth = document.getElementById('clientBirth').value;
  
  // التحقق من جميع الحقول
  let isValid = true;
  
  if (!validateClientName()) isValid = false;
  if (!validateClientID()) isValid = false;
  if (!validateIDNumber()) isValid = false;
  
  // التحقق من الحقول الأخرى
  if (!address) {
    document.getElementById('clientAddress-error').textContent = 'العنوان مطلوب';
    document.getElementById('clientAddress-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('clientAddress-error').style.display = 'none';
  }
  
  if (!nationality) {
    document.getElementById('clientNationality-error').textContent = 'الجنسية مطلوبة';
    document.getElementById('clientNationality-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('clientNationality-error').style.display = 'none';
  }
  
  if (!phone) {
    document.getElementById('clientPhone-error').textContent = 'رقم الجوال مطلوب';
    document.getElementById('clientPhone-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('clientPhone-error').style.display = 'none';
  }
  
  // إذا لم تكن البيانات صالحة، إيقاف الإجراء
  if (!isValid) {
    showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
    return;
  }
  
  // إنشاء كائن العميل
  const newClient = {
    id,
    name,
    address,
    nationality,
    idNumber,
    phone,
    workplace: workplace || '',
    birth: birth || '',
    date: new Date().toISOString()
  };
  
  // إضافة العميل إلى القائمة
  clients.push(newClient);
  
  // حفظ البيانات
  saveToStorage();
  
  // تحديث واجهة المستخدم
  updateStats();
  closeForm();
  
  // إظهار رسالة نجاح
  showToast("تم إضافة العميل بنجاح", 'success');
  
  // تحديث نماذج العقد
  updateContractClientDropdown();
}

// ==========================
// تحديث قائمة العملاء في نموذج العقد
// ==========================
function updateContractClientDropdown() {
  const contractClientSelect = document.getElementById('contractClient');
  if (!contractClientSelect) return;
  
  // حفظ العميل المحدد حاليًا
  const currentClient = contractClientSelect.value;
  
  // تحديث الخيارات
  let clientsOptions = '<option value="">اختر عميل</option>';
  clients.forEach(client => {
    const selected = client.id === currentClient ? 'selected' : '';
    clientsOptions += `<option value="${client.id}" ${selected}>${client.name}</option>`;
  });
  
  contractClientSelect.innerHTML = clientsOptions;
}

// ==========================
// إضافة عقد - مع تحقق متكامل
// ==========================
function addContract() {
  const clientId = document.getElementById('contractClient').value;
  const number = document.getElementById('contractNumber').value;
  const nationality = document.getElementById('contractNationality').value;
  const cv = document.getElementById('contractCV').value;
  const date = document.getElementById('contractDate').value;
  const duration = document.getElementById('contractDuration').value;
  
  // التحقق من الحقول المطلوبة
  let isValid = true;
  
  if (!clientId) {
    document.getElementById('contractClient-error').textContent = 'العميل مطلوب';
    document.getElementById('contractClient-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('contractClient-error').style.display = 'none';
  }
  
  if (!number) {
    document.getElementById('contractNumber-error').textContent = 'رقم العقد مطلوب';
    document.getElementById('contractNumber-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('contractNumber-error').style.display = 'none';
  }
  
  if (!nationality) {
    document.getElementById('contractNationality-error').textContent = 'الجنسية مطلوبة';
    document.getElementById('contractNationality-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('contractNationality-error').style.display = 'none';
  }
  
  if (!date) {
    document.getElementById('contractDate-error').textContent = 'تاريخ العقد مطلوب';
    document.getElementById('contractDate-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('contractDate-error').style.display = 'none';
  }
  
  if (!duration) {
    document.getElementById('contractDuration-error').textContent = 'مدة العقد مطلوبة';
    document.getElementById('contractDuration-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('contractDuration-error').style.display = 'none';
  }
  
  // إذا لم تكن البيانات صالحة، إيقاف الإجراء
  if (!isValid) {
    showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
    return;
  }
  
  // إيجاد اسم العميل
  const client = clients.find(c => c.id === clientId);
  const clientName = client ? client.name : 'عميل غير معروف';
  
  // إنشاء كائن العقد
  const newContract = {
    client: clientName,
    clientId: clientId,
    number,
    nationality,
    cv: cv || '',
    date,
    duration,
    created: new Date().toISOString()
  };
  
  // إضافة العقد إلى القائمة
  contracts.push(newContract);
  
  // حفظ البيانات
  saveToStorage();
  
  // تحديث واجهة المستخدم
  updateStats();
  closeForm();
  loadContractsTable();
  
  // إظهار رسالة نجاح
  showToast("تم إضافة العقد بنجاح", 'success');
}

// ==========================
// توليد رقم عقد تلقائي
// ==========================
function generateNextContractNumber() {
  if (contracts.length === 0) {
    return 'CT-000001';
  }
  
  // استخراج الأرقام من جميع أرقام العقود
  const contractNumbers = contracts.map(contract => {
    const numMatch = contract.number.match(/\d+$/);
    return numMatch ? parseInt(numMatch[0]) : 0;
  }).filter(num => num > 0);
  
  // إيجاد أكبر رقم
  const maxNumber = contractNumbers.length > 0 ? Math.max(...contractNumbers) : 0;
  
  // توليد الرقم التالي مع التنسيق
  const nextNumber = maxNumber + 1;
  return `CT-${nextNumber.toString().padStart(6, '0')}`;
}

// ==========================
// تحميل جدول العقود
// ==========================
function loadContractsTable() {
  const tableBody = document.querySelector('#contractsTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  contracts.forEach(contract => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contract.client}</td>
      <td>${contract.number}</td>
      <td>${contract.nationality}</td>
      <td>${contract.cv || '-'}</td>
      <td>${contract.date}</td>
      <td>${contract.duration}</td>
      <td>
        <button class="btn-action edit" title="تعديل"><i class="fas fa-edit"></i></button>
        <button class="btn-action delete" title="حذف" onclick="deleteContract('${contract.number}')"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// ==========================
// حذف العقد
// ==========================
function deleteContract(contractNumber) {
  if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) {
    return;
  }
  
  // العثور على العقد وحذفه
  contracts = contracts.filter(contract => contract.number !== contractNumber);
  
  // حفظ البيانات
  saveToStorage();
  
  // تحديث واجهة المستخدم
  updateStats();
  loadContractsTable();
  
  // إظهار رسالة نجاح
  showToast("تم حذف العقد بنجاح", 'success');
}

// ==========================
// تحميل البيانات عند بدء التشغيل
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  // تحميل البيانات من localStorage
  clients = JSON.parse(localStorage.getItem('clients')) || [];
  contracts = JSON.parse(localStorage.getItem('contracts')) || [];
  cvs = JSON.parse(localStorage.getItem('cvs')) || [];
  workers = JSON.parse(localStorage.getItem('workers')) || [];
  
  // تحديث العدادات
  updateStats();
  
  // تحميل جدول العقود
  loadContractsTable();
  
  // تحميل الرسوم البيانية
  renderCharts();
  
  // تعيين التواريخ الافتراضية
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setMonth(fromDate.getMonth() - 1);
  
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  if (document.getElementById('fromDate')) {
    document.getElementById('fromDate').value = formatDate(fromDate);
    document.getElementById('toDate').value = formatDate(today);
  }
  
  // تفعيل تبويب العقود
  const contractsTab = document.querySelector('.report-tab[data-report="contracts"]');
  if (contractsTab) {
    contractsTab.click();
  }
});

// ==========================
// نظام إدارة أسماء الصفحات - مركزي
// ==========================
const pageNames = {
  // الصفحة الرئيسية
  'dashboard': {
    ar: 'لوحة التحكم',
    en: 'Dashboard'
  },
  
  // الأقسام الأساسية
  'basic': {
    ar: 'اساسية',
    en: 'Basic'
  },
  'role': {
    ar: 'الصلاحية',
    en: 'Role'
  },
  'nationality': {
    ar: 'الجنسيات',
    en: 'Nationalities'
  },
  'airport': {
    ar: 'المطارات',
    en: 'Airports'
  },
  'offices': {
    ar: 'المكاتب',
    en: 'Offices'
  },
  'profession': {
    ar: 'المهنة',
    en: 'Profession'
  },
  'users': {
    ar: 'المستخدمين',
    en: 'Users'
  },
  'status': {
    ar: 'الحالة',
    en: 'Status'
  },
  'countries': {
    ar: 'الدول',
    en: 'Countries'
  },
  'religion': {
    ar: 'الديانة',
    en: 'Religion'
  },
  'terms': {
    ar: 'الشروط والمزايا',
    en: 'Terms & Benefits'
  },
  'qualifications': {
    ar: 'المؤهلات والخبرة',
    en: 'Qualifications & Experience'
  },
  'marketer': {
    ar: 'المسوقين',
    en: 'Marketers'
  },
  'accommodation-type': {
    ar: 'نوع الايواء',
    en: 'Accommodation Type'
  },
  'visa-type': {
    ar: 'نوع التأشيره',
    en: 'Visa Type'
  },
  'settings': {
    ar: 'الاعدادات',
    en: 'Settings'
  },
  'activity-log': {
    ar: 'سجلات نشاط البرنامج',
    en: 'Activity Log'
  },
  
  // الوصول السريع
  'quick-access': {
    ar: 'الوصول السريع',
    en: 'Quick Access'
  },
  'cv': {
    ar: 'السيرة الذاتية',
    en: 'CV'
  },
  'customers': {
    ar: 'العملاء',
    en: 'Customers'
  },
  'contracts': {
    ar: 'العقود',
    en: 'Contracts'
  },
  'under-warranty': {
    ar: 'تحت الضمان',
    en: 'Under Warranty'
  },
  'arrivals': {
    ar: 'الوصول',
    en: 'Arrivals'
  },
  
  // الدعم
  'support': {
    ar: 'الدعم',
    en: 'Support'
  },
  'my-tickets': {
    ar: 'الشكاوي الخاصة بي',
    en: 'My Tickets'
  },
  'tickets': {
    ar: 'الشكاوي',
    en: 'Tickets'
  },
  
  // الإيواء
  'accommodation': {
    ar: 'الايواء',
    en: 'Accommodation'
  },
  
  // المحاسبة
  'accounting': {
    ar: 'المحاسبة',
    en: 'Accounting'
  },
  'settlement-restrictions': {
    ar: 'سندات القيد / التسويه',
    en: 'Settlement Restrictions'
  },
  'transactions-out': {
    ar: 'سندات الصرف',
    en: 'Transactions Out'
  },
  'transactions-in': {
    ar: 'سندات القبض',
    en: 'Transactions In'
  },
  'accounting-tree': {
    ar: 'شجرة الحسابات',
    en: 'Accounting Tree'
  },
  'invoices': {
    ar: 'الفواتير',
    en: 'Invoices'
  },
  'final-accounts': {
    ar: 'الحسابات الختامية',
    en: 'Final Accounts'
  },
  'cost-center': {
    ar: 'مراكز التكلفة',
    en: 'Cost Center'
  },
  'currency': {
    ar: 'العملات',
    en: 'Currency'
  },
  
  // التقارير المالية
  'financial-reports': {
    ar: 'التقارير الماليه',
    en: 'Financial Reports'
  },
  'account-statement': {
    ar: 'كشف حساب',
    en: 'Account Statement'
  },
  'detailed-financial': {
    ar: 'القيود الماليه التفصيليه',
    en: 'Detailed Financial'
  },
  'profits-losses': {
    ar: 'الارباح والخسائر',
    en: 'Profits & Losses'
  },
  'general-budget': {
    ar: 'الميزانيه العموميه',
    en: 'General Budget'
  },
  'trial-balance': {
    ar: 'ميزان المراجعه',
    en: 'Trial Balance'
  },
  
  // التقارير
  'reports': {
    ar: 'التقارير',
    en: 'Reports'
  }
};

// ==========================
// دالة لجلب اسم الصفحة
// ==========================
function getPageName(pageKey, language = document.documentElement.lang) {
  // التأكد من أن اللغة المطلوبة موجودة
  const lang = language === 'en' ? 'en' : 'ar';
  
  // التأكد من أن المفتاح موجود
  if (!pageNames[pageKey]) {
    console.warn(`لم يتم العثور على اسم الصفحة للمفتاح: ${pageKey}`);
    return pageKey;
  }
  
  return pageNames[pageKey][lang];
}

// ==========================
// دالة لتحديث جميع أسماء الصفحات في الواجهة
// ==========================
function updatePageNames() {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
  
  // تحديث عنوان الصفحة
  if (document.querySelector('title')) {
    const pageTitle = getPageName('dashboard', lang);
    document.querySelector('title').textContent = `${pageTitle} - الفارس العالمي`;
  }
  
  // تحديث العناوين في الشريط العلوي
  if (document.querySelector('.page-title')) {
    const pageTitle = getPageName('dashboard', lang);
    document.querySelector('.page-title').textContent = pageTitle;
  }
  
  // تحديث أسماء القوائم
  updateNavigationNames(lang);
  
  // تحديث أسماء التبويبات
  updateTabNames(lang);
  
  // تحديث أسماء الأزرار
  updateButtonNames(lang);
}

// ==========================
// دالة لتحديث أسماء القوائم
// ==========================
function updateNavigationNames(lang) {
  // تحديث قائمة "الاساسية"
  const basicMenu = document.querySelector('a[href="#"][onclick*="toggleLanguage"]');
  if (basicMenu && basicMenu.closest('.dropdown')) {
    const dropdown = basicMenu.closest('.dropdown');
    if (dropdown.querySelector('.dropdown-content')) {
      // تحديث عنوان القائمة
      basicMenu.innerHTML = `<i class="dripicons-checklist"></i> ${getPageName('basic', lang)} <i class="mdi mdi-chevron-down mdi-drop"></i>`;
      
      // تحديث أسماء العناصر الفرعية
      const items = dropdown.querySelectorAll('.dropdown-content a');
      items.forEach(item => {
        const href = item.getAttribute('href');
        let key = '';
        
        if (href.includes('/role')) key = 'role';
        else if (href.includes('/nationalitie')) key = 'nationality';
        else if (href.includes('/airport')) key = 'airport';
        else if (href.includes('/offices')) key = 'offices';
        else if (href.includes('/profession')) key = 'profession';
        else if (href.includes('/users')) key = 'users';
        else if (href.includes('/status')) key = 'status';
        else if (href.includes('/countrys')) key = 'countries';
        else if (href.includes('/religion')) key = 'religion';
        else if (href.includes('/terms-and-advantage')) key = 'terms';
        else if (href.includes('/qualifications-and-experience')) key = 'qualifications';
        else if (href.includes('/marketer')) key = 'marketer';
        else if (href.includes('/accommodation-type')) key = 'accommodation-type';
        else if (href.includes('/visa-type')) key = 'visa-type';
        else if (href.includes('/main-settings')) key = 'settings';
        else if (href.includes('/activity-log')) key = 'activity-log';
        
        if (key) {
          item.textContent = getPageName(key, lang);
        }
      });
    }
  }
  
  // تحديث قائمة "الوصول السريع"
  const quickAccessMenu = document.querySelector('a[href="#"][onclick*="toggleLanguage"]');
  if (quickAccessMenu && quickAccessMenu.closest('.dropdown')) {
    const dropdown = quickAccessMenu.closest('.dropdown');
    if (dropdown.querySelector('.dropdown-content')) {
      // تحديث عنوان القائمة
      quickAccessMenu.innerHTML = `<i class="dripicons-meter"></i> ${getPageName('quick-access', lang)} <i class="mdi mdi-chevron-down mdi-drop"></i>`;
      
      // تحديث أسماء العناصر الفرعية
      const items = dropdown.querySelectorAll('.dropdown-content a');
      items.forEach(item => {
        const href = item.getAttribute('href');
        let key = '';
        
        if (href.includes('/cv')) key = 'cv';
        else if (href.includes('/customer')) key = 'customers';
        else if (href.includes('/contract-list')) {
          if (href.includes('underwarranty')) key = 'under-warranty';
          else if (href.includes('arrivals')) key = 'arrivals';
          else key = 'contracts';
        }
        
        if (key) {
          item.textContent = getPageName(key, lang);
        }
      });
    }
  }
  
  // تحديث قائمة "الدعم"
  const supportMenu = document.querySelector('a[href="#"][onclick*="toggleLanguage"]');
  if (supportMenu && supportMenu.closest('.dropdown')) {
    const dropdown = supportMenu.closest('.dropdown');
    if (dropdown.querySelector('.dropdown-content')) {
      // تحديث عنوان القائمة
      supportMenu.innerHTML = `<i class="dripicons-help"></i> ${getPageName('support', lang)} <i class="mdi mdi-chevron-down mdi-drop"></i>`;
      
      // تحديث أسماء العناصر الفرعية
      const items = dropdown.querySelectorAll('.dropdown-content a');
      items.forEach(item => {
        const href = item.getAttribute('href');
        let key = '';
        
        if (href.includes('/my-ticket')) key = 'my-tickets';
        else if (href.includes('/ticket')) key = 'tickets';
        
        if (key) {
          item.textContent = getPageName(key, lang);
        }
      });
    }
  }
  
  // تحديث قائمة "الايواء"
  const accommodationLink = document.querySelector('a[href="away.html"]');
  if (accommodationLink) {
    accommodationLink.innerHTML = `<i class="dripicons-user-group"></i> ${getPageName('accommodation', lang)}`;
  }
  
  // تحديث قائمة "المحاسبة"
  const accountingMenu = document.querySelector('a[href="#"][onclick*="toggleLanguage"]');
  if (accountingMenu && accountingMenu.closest('.dropdown')) {
    const dropdown = accountingMenu.closest('.dropdown');
    if (dropdown.querySelector('.dropdown-content')) {
      // تحديث عنوان القائمة
      accountingMenu.innerHTML = `<i class="dripicons-wallet"></i> ${getPageName('accounting', lang)} <i class="mdi mdi-chevron-down mdi-drop"></i>`;
      
      // تحديث أسماء العناصر الفرعية
      const items = dropdown.querySelectorAll('.dropdown-content a');
      items.forEach(item => {
        const href = item.getAttribute('href');
        let key = '';
        
        if (href.includes('/settlementRestrictions')) {
          if (href.includes('/create')) key = 'settlement-restrictions';
          else key = 'settlement-restrictions';
        }
        else if (href.includes('/transactionsOut')) {
          if (href.includes('/create')) key = 'transactions-out';
          else key = 'transactions-out';
        }
        else if (href.includes('/transactionsIn')) {
          if (href.includes('/create')) key = 'transactions-in';
          else key = 'transactions-in';
        }
        else if (href.includes('/accountingTree')) key = 'accounting-tree';
        else if (href.includes('/invoice')) key = 'invoices';
        else if (href.includes('/finalAccounts')) key = 'final-accounts';
        else if (href.includes('/cost-center')) key = 'cost-center';
        else if (href.includes('/currency')) key = 'currency';
        
        if (key) {
          item.textContent = getPageName(key, lang);
        }
      });
    }
  }
  
  // تحديث قائمة "التقارير الماليه"
  const financialReportsMenu = document.querySelector('a[href="#"][onclick*="toggleLanguage"]');
  if (financialReportsMenu && financialReportsMenu.closest('.dropdown')) {
    const dropdown = financialReportsMenu.closest('.dropdown');
    if (dropdown.querySelector('.dropdown-content')) {
      // تحديث عنوان القائمة
      financialReportsMenu.innerHTML = `<i class="dripicons-wallet"></i> ${getPageName('financial-reports', lang)} <i class="mdi mdi-chevron-down mdi-drop"></i>`;
      
      // تحديث أسماء العناصر الفرعية
      const items = dropdown.querySelectorAll('.dropdown-content a');
      items.forEach(item => {
        const href = item.getAttribute('href');
        let key = '';
        
        if (href.includes('/accountStatement')) key = 'account-statement';
        else if (href.includes('/detailedFinancialRestrictions')) key = 'detailed-financial';
        else if (href.includes('/profitsAndLosses')) key = 'profits-losses';
        else if (href.includes('/generalBudget')) key = 'general-budget';
        else if (href.includes('/trialBalance')) key = 'trial-balance';
        
        if (key) {
          item.textContent = getPageName(key, lang);
        }
      });
    }
  }
  
  // تحديث قائمة "التقارير"
  const reportsLink = document.querySelector('a[href="reports.html"]');
  if (reportsLink) {
    reportsLink.innerHTML = `<i class="dripicons-document-remove"></i> ${getPageName('reports', lang)}`;
  }
}

// ==========================
// دالة لتحديث أسماء التبويبات
// ==========================
function updateTabNames(lang) {
  // تحديث تبويبات التقارير
  const reportTabs = document.querySelectorAll('.report-tab');
  reportTabs.forEach(tab => {
    const reportType = tab.getAttribute('data-report');
    let key = '';
    
    switch(reportType) {
      case 'contracts': key = 'contracts'; break;
      case 'clients': key = 'customers'; break;
      case 'workers': key = 'workers'; break;
      case 'financial': key = 'financial-reports'; break;
      case 'summary': key = 'reports'; break;
    }
    
    if (key) {
      tab.textContent = getPageName(key, lang);
    }
  });
}

// ==========================
// دالة لتحديث أسماء الأزرار
// ==========================
function updateButtonNames(lang) {
  // تحديث زر اللغة
  const langBtn = document.querySelector('a[href="#"][onclick*="toggleLanguage"]');
  if (langBtn) {
    langBtn.innerHTML = lang === 'en' ? 
      '<i class="fas fa-globe"></i> • عربي' : 
      '<i class="fas fa-globe"></i> • English';
  }
  
  // تحديث أزرار الإجراءات في الجداول
  const actionButtons = document.querySelectorAll('.btn-action');
  actionButtons.forEach(btn => {
    const action = btn.getAttribute('data-action');
    if (action === 'edit') {
      btn.title = lang === 'en' ? 'Edit' : 'تعديل';
    } else if (action === 'delete') {
      btn.title = lang === 'en' ? 'Delete' : 'حذف';
    }
  });
}

// ==========================
// دالة لتبديل اللغة
// ==========================
function toggleLanguage() {
  const isArabic = document.documentElement.lang === 'ar';
  const newLang = isArabic ? 'en' : 'ar';
  
  // تحديث لغة الصفحة
  document.documentElement.lang = newLang;
  
  // تحديث جميع أسماء الصفحات
  updatePageNames();
  
  // حفظ تفضيل اللغة في localStorage
  localStorage.setItem('appLanguage', newLang);
}

// ==========================
// دالة لتحميل تفضيل اللغة المحفوظة
// ==========================
function loadSavedLanguage() {
  const savedLang = localStorage.getItem('appLanguage');
  if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
    document.documentElement.lang = savedLang;
  }
  
  // تحديث جميع أسماء الصفحات
  updatePageNames();
}

// ==========================
// تهيئة النظام عند تحميل الصفحة
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  // تحميل تفضيل اللغة المحفوظة
  loadSavedLanguage();
  
  // إضافة مستمع لحدث تغيير اللغة
  document.querySelectorAll('a[href="#"][onclick*="toggleLanguage"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleLanguage();
    });
  });
});


// ==========================
// نظام التصفح الديناميكي
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  // تهيئة النظام
  initNavigation();
  loadPageContent('dashboard'); // تحميل لوحة التحكم كافتراضي
});

// ==========================
// تهيئة نظام التصفح
// ==========================
function initNavigation() {
  // إضافة مستمع للأحداث لجميع روابط القائمة
  const navLinks = document.querySelectorAll('nav.nav a');
  navLinks.forEach(link => {
    // تخطي روابط اللغة والروابط الخارجية
    if (link.getAttribute('onclick') || link.getAttribute('target') || link.getAttribute('href').includes('http')) {
      return;
    }
    
    // منع السلوك الافتراضي للروابط
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // حالة خاصة لإيواء: الانتقال إلى صفحة منفصلة
      if (this.href.includes('away.html')) {
        window.location.href = 'away.html';
        return;
      }
      
      // حالة خاصة للتقارير
      if (this.href.includes('reports.html')) {
        goToReports();
        return;
      }
      
      // تحديد الصفحة المستهدفة
      let targetPage;
      
      // تحديد الصفحة بناءً على الرابط
      if (this.href.includes('index.html') || this.textContent.includes('لوحة التحكم')) {
        targetPage = 'dashboard';
      } else if (this.textContent.includes('الصلاحيات')) {
        targetPage = 'role';
      } else if (this.textContent.includes('الجنسيات')) {
        targetPage = 'nationality';
      } else if (this.textContent.includes('المطارات')) {
        targetPage = 'airport';
      } else if (this.textContent.includes('المكاتب')) {
        targetPage = 'offices';
      } else if (this.textContent.includes('المهنة')) {
        targetPage = 'profession';
      } else if (this.textContent.includes('المستخدمين')) {
        targetPage = 'users';
      } else if (this.textContent.includes('الحالة')) {
        targetPage = 'status';
      } else if (this.textContent.includes('الدول')) {
        targetPage = 'countries';
      } else if (this.textContent.includes('الديانة')) {
        targetPage = 'religion';
      } else if (this.textContent.includes('الشروط والمزايا')) {
        targetPage = 'terms';
      } else if (this.textContent.includes('المؤهلات والخبرة')) {
        targetPage = 'qualifications';
      } else if (this.textContent.includes('المسوقين')) {
        targetPage = 'marketer';
      } else if (this.textContent.includes('نوع الايواء')) {
        targetPage = 'accommodation-type';
      } else if (this.textContent.includes('نوع التأشيره')) {
        targetPage = 'visa-type';
      } else if (this.textContent.includes('الاعدادات')) {
        targetPage = 'settings';
      } else if (this.textContent.includes('سجلات نشاط البرنامج')) {
        targetPage = 'activity-log';
      } else if (this.textContent.includes('الوصول السريع')) {
        targetPage = 'quick-access';
      } else if (this.textContent.includes('الدعم')) {
        targetPage = 'support';
      } else if (this.textContent.includes('الايواء')) {
        targetPage = 'accommodation';
      } else if (this.textContent.includes('المحاسبة')) {
        targetPage = 'accounting';
      } else if (this.textContent.includes('التقارير الماليه')) {
        targetPage = 'financial-reports';
      } else {
        targetPage = 'dashboard';
      }
      
      // تحديث الرابط النشط
      document.querySelectorAll('nav.nav a').forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
      
      // تحميل محتوى الصفحة
      loadPageContent(targetPage);
    });
  });
}

// ==========================
// تحميل محتوى الصفحة
// ==========================
function loadPageContent(page) {
  // عرض مؤشر التحميل
  showLoadingIndicator();
  
  // تحديد عنوان API بناءً على الصفحة
  let apiUrl;
  switch(page) {
    case 'dashboard':
      apiUrl = 'dashboard.html';
      break;
    case 'role':
      apiUrl = 'role.html';
      break;
    case 'nationality':
      apiUrl = 'nationality.html';
      break;
    case 'airport':
      apiUrl = 'airport.html';
      break;
    case 'offices':
      apiUrl = 'offices.html';
      break;
    case 'profession':
      apiUrl = 'profession.html';
      break;
    case 'users':
      apiUrl = 'users.html';
      break;
    case 'status':
      apiUrl = 'status.html';
      break;
    case 'countries':
      apiUrl = 'countries.html';
      break;
    case 'religion':
      apiUrl = 'religion.html';
      break;
    case 'terms':
      apiUrl = 'terms.html';
      break;
    case 'qualifications':
      apiUrl = 'qualifications.html';
      break;
    case 'marketer':
      apiUrl = 'marketer.html';
      break;
    case 'accommodation-type':
      apiUrl = 'accommodation-type.html';
      break;
    case 'visa-type':
      apiUrl = 'visa-type.html';
      break;
    case 'settings':
      apiUrl = 'settings.html';
      break;
    case 'activity-log':
      apiUrl = 'activity-log.html';
      break;
    case 'quick-access':
      apiUrl = 'quick-access.html';
      break;
    case 'support':
      apiUrl = 'support.html';
      break;
    case 'accommodation':
      apiUrl = 'accommodation.html';
      break;
    case 'accounting':
      apiUrl = 'accounting.html';
      break;
    case 'financial-reports':
      apiUrl = 'financial-reports.html';
      break;
    default:
      apiUrl = 'dashboard.html';
  }
  
  // جلب محتوى الصفحة
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('فشل تحميل الصفحة');
      }
      return response.text();
    })
    .then(html => {
      // استخراج محتوى main من الصفحة
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMainContent = doc.querySelector('main');
      
      if (newMainContent) {
        // استبدال المحتوى الحالي
        document.querySelector('main').innerHTML = newMainContent.innerHTML;
        
        // تحديث عنوان الصفحة
        const title = doc.querySelector('title')?.textContent || 'الفارس العالمي';
        document.title = title;
        
        // تحديث عنوان الصفحة في الشريط العلوي
        const pageTitle = doc.querySelector('.page-title')?.textContent || 'لوحة التحكم';
        if (document.querySelector('.page-title')) {
          document.querySelector('.page-title').textContent = pageTitle;
        }
        
        // إعادة تهيئة المكونات بعد تحميل المحتوى
        reinitializePageComponents(page);
      } else {
        throw new Error('لم يتم العثور على محتوى الصفحة');
      }
      
      // إخفاء مؤشر التحميل
      hideLoadingIndicator();
    })
    .catch(error => {
      console.error('خطأ في تحميل الصفحة:', error);
      hideLoadingIndicator();
      showToast('حدث خطأ أثناء تحميل الصفحة', 'error');
      
      // تحميل محتوى بديل في حالة الفشل
      document.querySelector('main').innerHTML = `
        <div class="error-state">
          <h2>حدث خطأ</h2>
          <p>تعذر تحميل المحتوى. يرجى المحاولة مرة أخرى لاحقًا.</p>
          <button class="btn" onclick="loadPageContent('${page}')">إعادة المحاولة</button>
        </div>
      `;
    });
}

// ==========================
// إعادة تهيئة مكونات الصفحة
// ==========================
function reinitializePageComponents(page) {
  switch(page) {
    case 'dashboard':
      // إعادة تهيئة لوحة التحكم
      if (typeof renderCharts === 'function') renderCharts();
      if (typeof updateStats === 'function') updateStats();
      if (typeof loadContractsTable === 'function') loadContractsTable();
      break;
      
    case 'role':
      // إعادة تهيئة صفحة الصلاحيات
      if (typeof renderRolesTable === 'function') renderRolesTable();
      break;
      
    case 'nationality':
      // إعادة تهيئة صفحة الجنسيات
      if (typeof renderNationalitiesTable === 'function') renderNationalitiesTable();
      break;
      
    case 'users':
      // إعادة تهيئة صفحة المستخدمين
      if (typeof renderUsersTable === 'function') renderUsersTable();
      break;
      
    // إضافة حالات أخرى للصفحات الأخرى...
  }
}

// ==========================
// مؤشر التحميل
// ==========================
function showLoadingIndicator() {
  let loader = document.getElementById('pageLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(to right, var(--secondary), var(--success));
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(loader);
  }
  loader.style.opacity = '1';
}

function hideLoadingIndicator() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      if (loader) loader.remove();
    }, 300);
  }
}

// ==========================
// الذهاب إلى صفحة التقارير
// ==========================
function goToReports() {
  event.preventDefault();
  if (confirm("هل ترغب في الذهاب إلى صفحة التقارير؟")) {
    window.location.href = "reports.html";
  }
}

// ==========================
// تغيير اللغة مع الحفاظ على الصفحة الحالية
// ==========================
function toggleLanguage() {
  const isArabic = document.documentElement.lang === 'ar';
  const newLang = isArabic ? 'en' : 'ar';
  
  // تحديث لغة الصفحة
  document.documentElement.lang = newLang;
  
  // حفظ تفضيل اللغة
  localStorage.setItem('appLanguage', newLang);
  
  // تحديث النصوص
  updatePageNames();
}

// ==========================
// تحديث أسماء الصفحات
// ==========================
function updatePageNames() {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
  
  // تحديث عناوين القوائم
  document.querySelectorAll('nav.nav a').forEach(link => {
    const text = link.textContent.trim();
    
    // تخطي روابط اللغة والروابط الخارجية
    if (link.getAttribute('onclick') || link.getAttribute('target')) return;
    
    // تحديث النصوص حسب اللغة
    if (lang === 'en') {
      if (text.includes('لوحة التحكم')) link.textContent = 'Dashboard';
      else if (text.includes('الصلاحيات')) link.textContent = 'Roles';
      else if (text.includes('الجنسيات')) link.textContent = 'Nationalities';
      else if (text.includes('المطارات')) link.textContent = 'Airports';
      else if (text.includes('المكاتب')) link.textContent = 'Offices';
      else if (text.includes('المهنة')) link.textContent = 'Profession';
      else if (text.includes('المستخدمين')) link.textContent = 'Users';
      else if (text.includes('الحالة')) link.textContent = 'Status';
      else if (text.includes('الدول')) link.textContent = 'Countries';
      else if (text.includes('الديانة')) link.textContent = 'Religion';
      else if (text.includes('الشروط والمزايا')) link.textContent = 'Terms & Benefits';
      else if (text.includes('المؤهلات والخبرة')) link.textContent = 'Qualifications & Experience';
      else if (text.includes('المسوقين')) link.textContent = 'Marketers';
      else if (text.includes('نوع الايواء')) link.textContent = 'Accommodation Type';
      else if (text.includes('نوع التأشيره')) link.textContent = 'Visa Type';
      else if (text.includes('الاعدادات')) link.textContent = 'Settings';
      else if (text.includes('سجلات نشاط البرنامج')) link.textContent = 'Activity Log';
      else if (text.includes('الوصول السريع')) link.textContent = 'Quick Access';
      else if (text.includes('الدعم')) link.textContent = 'Support';
      else if (text.includes('الايواء')) link.textContent = 'Accommodation';
      else if (text.includes('المحاسبة')) link.textContent = 'Accounting';
      else if (text.includes('التقارير الماليه')) link.textContent = 'Financial Reports';
      else if (text.includes('التقارير')) link.textContent = 'Reports';
    } else {
      if (text.includes('Dashboard')) link.textContent = 'لوحة التحكم';
      else if (text.includes('Roles')) link.textContent = 'الصلاحيات';
      else if (text.includes('Nationalities')) link.textContent = 'الجنسيات';
      else if (text.includes('Airports')) link.textContent = 'المطارات';
      else if (text.includes('Offices')) link.textContent = 'المكاتب';
      else if (text.includes('Profession')) link.textContent = 'المهنة';
      else if (text.includes('Users')) link.textContent = 'المستخدمين';
      else if (text.includes('Status')) link.textContent = 'الحالة';
      else if (text.includes('Countries')) link.textContent = 'الدول';
      else if (text.includes('Religion')) link.textContent = 'الديانة';
      else if (text.includes('Terms & Benefits')) link.textContent = 'الشروط والمزايا';
      else if (text.includes('Qualifications & Experience')) link.textContent = 'المؤهلات والخبرة';
      else if (text.includes('Marketers')) link.textContent = 'المسوقين';
      else if (text.includes('Accommodation Type')) link.textContent = 'نوع الايواء';
      else if (text.includes('Visa Type')) link.textContent = 'نوع التأشيره';
      else if (text.includes('Settings')) link.textContent = 'الاعدادات';
      else if (text.includes('Activity Log')) link.textContent = 'سجلات نشاط البرنامج';
      else if (text.includes('Quick Access')) link.textContent = 'الوصول السريع';
      else if (text.includes('Support')) link.textContent = 'الدعم';
      else if (text.includes('Accommodation')) link.textContent = 'الايواء';
      else if (text.includes('Accounting')) link.textContent = 'المحاسبة';
      else if (text.includes('Financial Reports')) link.textContent = 'التقارير الماليه';
      else if (text.includes('Reports')) link.textContent = 'التقارير';
    }
  });
  
  // تحديث زر اللغة
  const langBtn = document.querySelector('a[href="#"][onclick*="toggleLanguage"]');
  if (langBtn) {
    langBtn.innerHTML = lang === 'en' ? 
      '<i class="fas fa-globe"></i> • عربي' : 
      '<i class="fas fa-globe"></i> • English';
  }
}