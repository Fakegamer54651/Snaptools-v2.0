// Template service for API integration
// For now using mock data, later replace with real API calls

// Mock data for templates
let mockTemplatesArray = [
  {
    id: 1,
    name: "Ask load info Atransportation",
    senderEmail: "boboTransport@gmail.com",
    subject: "Load from {{origin}} to {{dest}}, available on {{date}}",
    yourEmail: "dispatcher@company.com"
  },
  {
    id: 2,
    name: "Delivery Confirmation",
    senderEmail: "logistics@transport.com",
    subject: "Load from {{origin}} to {{dest}}, available on {{date}}",
    yourEmail: "manager@company.com"
  },
  {
    id: 3,
    name: "Rate Request",
    senderEmail: "rates@shipping.com",
    subject: "Load from {{origin}} to {{dest}} for {{date}}",
    yourEmail: "admin@company.com"
  }
];

// For testing empty state: uncomment the line below
// mockTemplatesArray = [];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all templates
 * @returns {Promise<Array>} Array of template objects
 */
export async function getTemplates() {
  await delay(400); // Simulate network delay
  return Promise.resolve([...mockTemplatesArray]);
}

/**
 * Create a new template
 * @param {Object} template - Template data
 * @returns {Promise<Object>} Created template with ID
 */
export async function createTemplate(template) {
  await delay(300);
  const newTemplate = {
    ...template,
    id: Date.now() // Generate unique ID
  };
  mockTemplatesArray.push(newTemplate);
  return Promise.resolve(newTemplate);
}

/**
 * Update an existing template
 * @param {number} id - Template ID
 * @param {Object} updates - Updated template data
 * @returns {Promise<Object>} Updated template object
 */
export async function updateTemplate(id, updates) {
  await delay(300);
  const updatedTemplate = { id, ...updates };
  const index = mockTemplatesArray.findIndex(template => template.id === id);
  if (index !== -1) {
    mockTemplatesArray[index] = updatedTemplate;
  }
  return Promise.resolve(updatedTemplate);
}

/**
 * Delete a template
 * @param {number} id - Template ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteTemplate(id) {
  await delay(200);
  const index = mockTemplatesArray.findIndex(template => template.id === id);
  if (index !== -1) {
    mockTemplatesArray.splice(index, 1);
  }
  return Promise.resolve({ success: true });
}

// TODO: Replace with real API calls when backend is ready
// Example final implementation:
/*
export async function getTemplates() {
  const res = await fetch('/api/templates');
  if (!res.ok) throw new Error('Failed to fetch templates');
  return await res.json();
}

export async function createTemplate(template) {
  const res = await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to create template');
  return await res.json();
}

export async function updateTemplate(id, updates) {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update template');
  return await res.json();
}

export async function deleteTemplate(id) {
  const res = await fetch(`/api/templates/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete template');
  return await res.json();
}
*/
