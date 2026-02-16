// State
const state = {
    employees: [],
    currentView: 'home',
    currentEditId: null,
    sortBy: 'name-asc',
    searchQuery: ''
};

// DOM Elements
const elements = {
    views: {
        home: document.getElementById('home-view'),
        add: document.getElementById('add-view'),
        edit: document.getElementById('edit-view')
    },
    nav: {
        home: document.getElementById('nav-home'),
        add: document.getElementById('nav-add')
    },
    stats: {
        count: document.getElementById('total-employees'),
        payroll: document.getElementById('total-payroll'),
        avgSalary: document.getElementById('average-salary')
    },
    list: {
        container: document.getElementById('employee-list'),
        empty: document.getElementById('empty-state'),
        emptyAddBtn: document.getElementById('empty-add-btn')
    },
    controls: {
        search: document.getElementById('search-input'),
        sort: document.getElementById('sort-select')
    },
    forms: {
        add: document.getElementById('add-form'),
        edit: document.getElementById('edit-form')
    },
    modals: {
        confirm: document.getElementById('confirm-modal'),
        loading: document.getElementById('loading-overlay')
    },
    toastContainer: document.getElementById('toast-container')
};

// Validation Regex
const patterns = {
    name: /^[A-Za-z ]{3,30}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+]?[0-9]{10,15}$/
};

// --- Initialization ---

async function init() {
    setupEventListeners();
    await loadEmployees();
}

function setupEventListeners() {
    // Navigation
    elements.nav.home.addEventListener('click', () => showView('home'));
    elements.nav.add.addEventListener('click', () => showView('add'));
    elements.list.emptyAddBtn.addEventListener('click', () => showView('add'));

    // Cancel buttons in forms
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => showView('home'));
    });

    // Search & Sort
    elements.controls.search.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        renderList();
    });

    elements.controls.sort.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderList();
    });

    // Forms
    elements.forms.add.addEventListener('submit', handleAddSubmit);
    elements.forms.edit.addEventListener('submit', handleEditSubmit);

    // Real-time Validation
    setupFormValidation('add');
    setupFormValidation('edit');

    // Modal Actions
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    
    modalCancel.addEventListener('click', closeModal);
    modalConfirm.addEventListener('click', confirmDelete);
}

// --- Data & State ---

async function loadEmployees() {
    showLoading();
    try {
        state.employees = await getAllEmployees();
        updateStats();
        renderList();
    } catch (error) {
        showToast('Failed to load employees. Please check if server is running.', 'error');
    } finally {
        hideLoading();
    }
}

// --- View Management ---

function showView(viewName) {
    // Update State
    state.currentView = viewName;
    
    // Toggle Sections
    Object.values(elements.views).forEach(el => el.classList.add('hidden'));
    elements.views[viewName].classList.remove('hidden');

    // Update Nav State
    elements.nav.home.classList.toggle('active', viewName === 'home');
    elements.nav.add.classList.toggle('active', viewName === 'add');

    // Specific View Logic
    if (viewName === 'home') {
        loadEmployees(); // Refresh data
    } else if (viewName === 'add') {
        elements.forms.add.reset();
        resetValidation(elements.forms.add);
    }
}

// --- Rendering ---

function renderList() {
    const list = elements.list.container;
    list.innerHTML = '';

    // Filter
    let filtered = state.employees.filter(emp => {
        const query = state.searchQuery;
        return emp.name.toLowerCase().includes(query) ||
               emp.email.toLowerCase().includes(query) ||
               emp.department.toLowerCase().includes(query);
    });

    // Sort
    filtered.sort((a, b) => {
        const [field, direction] = state.sortBy.split('-');
        let valA = a[field];
        let valB = b[field];

        if (field === 'salary') {
            return direction === 'asc' ? valA - valB : valB - valA;
        } else if (field === 'date') {
            return direction === 'asc' 
                ? new Date(a.startDate) - new Date(b.startDate) 
                : new Date(b.startDate) - new Date(a.startDate);
        } else {
            // String comparison (Name)
            return direction === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        }
    });

    // Empty State
    if (filtered.length === 0) {
        elements.list.empty.classList.remove('hidden');
    } else {
        elements.list.empty.classList.add('hidden');
        filtered.forEach(emp => {
            list.appendChild(createEmployeeCard(emp));
        });
    }
}

function createEmployeeCard(emp) {
    const card = document.createElement('div');
    card.className = 'employee-card';
    
    const initials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const formattedSalary = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(emp.salary);
    const deptClass = `dept-${emp.department.toLowerCase()}`;

    card.innerHTML = `
        <div class="card-header">
            <div class="avatar">${initials}</div>
            <span class="dept-badge ${deptClass}">${emp.department}</span>
        </div>
        <div class="card-body">
            <h3>${emp.name}</h3>
            <p class="email">${emp.email}</p>
            <div class="card-details">
                <div><i class="fa-solid fa-phone"></i> ${emp.phone}</div>
                <div><i class="fa-solid fa-indian-rupee-sign"></i> ${formattedSalary}</div>
                <div><i class="fa-regular fa-calendar"></i> Joined: ${emp.startDate}</div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn btn-primary" onclick="initEdit(${emp.id})">Edit</button>
            <button class="btn btn-secondary" style="color: var(--danger); border-color: var(--danger);" onclick="initDelete(${emp.id})">Delete</button>
        </div>
    `;
    return card;
}

function updateStats() {
    const total = state.employees.length;
    const totalSalary = state.employees.reduce((sum, emp) => sum + Number(emp.salary), 0);
    const avg = total ? Math.round(totalSalary / total) : 0;

    elements.stats.count.textContent = total;
    elements.stats.payroll.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalSalary);
    elements.stats.avgSalary.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(avg);
}

// --- Form Handling ---

function setupFormValidation(type) {
    const form = elements.forms[type];
    const inputs = form.querySelectorAll('input, select');

    inputs.forEach(input => {
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });
}

function validateField(input) {
    const fieldName = input.name;
    const val = input.value.trim();
    let isValid = true;

    // Remove existing styles
    input.classList.remove('error', 'success');

    if (input.hasAttribute('required') && !val) {
        isValid = false;
    } else {
        switch(fieldName) {
            case 'name':
                isValid = patterns.name.test(val);
                break;
            case 'email':
                isValid = patterns.email.test(val);
                break;
            case 'phone':
                isValid = patterns.phone.test(val);
                break;
            case 'salary':
                isValid = Number(val) >= 15000;
                break;
            case 'startDate':
                const selected = new Date(val);
                const today = new Date();
                isValid = selected <= today;
                break;
        }
    }

    if (isValid) {
        input.classList.add('success');
    } else {
        input.classList.add('error');
    }
    return isValid;
}

function resetValidation(form) {
    form.querySelectorAll('input, select').forEach(input => {
        input.classList.remove('error', 'success');
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        if (!validateField(input)) isValid = false;
    });
    return isValid;
}

async function handleAddSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) {
        showToast('Please fix the errors in the form', 'warning');
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Check duplicate email
    if (state.employees.some(emp => emp.email === data.email)) {
        showToast('Email already exists!', 'error');
        return;
    }

    showLoading();
    try {
        await createEmployee(data);
        showToast('Employee added successfully!', 'success');
        showView('home');
    } catch (error) {
        showToast('Error saving employee', 'error');
    } finally {
        hideLoading();
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) {
        showToast('Please fix errors', 'warning');
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Check duplicate email (exclude self)
    const exists = state.employees.some(emp => emp.email === data.email && emp.id != state.currentEditId);
    if (exists) {
        showToast('Email already used by another employee', 'error');
        return;
    }

    showLoading();
    try {
        await updateEmployee(state.currentEditId, data);
        showToast('Employee updated!', 'success');
        showView('home');
    } catch (error) {
        showToast('Error updating employee', 'error');
    } finally {
        hideLoading();
    }
}

// Global scope functions for onclick events
window.initEdit = async (id) => {
    state.currentEditId = id;
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;

    const form = elements.forms.edit;
    
    // Populate form
    document.getElementById('edit-id').value = emp.id;
    document.getElementById('edit-name').value = emp.name;
    document.getElementById('edit-email').value = emp.email;
    document.getElementById('edit-phone').value = emp.phone;
    document.getElementById('edit-salary').value = emp.salary;
    document.getElementById('edit-department').value = emp.department;
    document.getElementById('edit-date').value = emp.startDate;
    document.getElementById('edit-notes').value = emp.notes || '';

    resetValidation(form);
    showView('edit');
};

let deleteId = null;

window.initDelete = (id) => {
    deleteId = id;
    elements.modals.confirm.classList.remove('hidden');
    // Animate
    setTimeout(() => {
        elements.modals.confirm.style.opacity = '1';
    }, 10);
};

function closeModal() {
    elements.modals.confirm.style.opacity = '0';
    setTimeout(() => {
        elements.modals.confirm.classList.add('hidden');
        deleteId = null;
    }, 200);
}

async function confirmDelete() {
    if (!deleteId) return;
    
    closeModal();
    showLoading();
    try {
        await deleteEmployee(deleteId);
        showToast('Employee deleted', 'success');
        await loadEmployees();
    } catch (error) {
        showToast('Error deleting employee', 'error');
    } finally {
        hideLoading();
    }
}

// --- UI Utilities ---

function showLoading() {
    elements.modals.loading.classList.remove('hidden');
}

function hideLoading() {
    elements.modals.loading.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="toast-content"><p>${message}</p></div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Start App
document.addEventListener('DOMContentLoaded', init);
