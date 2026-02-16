const API_URL = 'http://localhost:3000/employees';

/**
 * Helper to handle fetch responses
 */
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
    }
    return response.json();
}

/**
 * Fetch all employees
 */
async function getAllEmployees() {
    try {
        const response = await fetch(API_URL);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
}

/**
 * Fetch single employee by ID
 */
async function getEmployeeById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching employee ${id}:`, error);
        throw error;
    }
}

/**
 * Create new employee
 */
async function createEmployee(employeeData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
}

/**
 * Update existing employee
 */
async function updateEmployee(id, employeeData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error updating employee ${id}:`, error);
        throw error;
    }
}

/**
 * Delete employee
 */
async function deleteEmployee(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error deleting employee ${id}:`, error);
        throw error;
    }
}
