// Driver service for API integration
// For now using mock data, later replace with real API calls

// Mock data for drivers
let mockDriversArray = [
  { 
    id: 1, 
    callsign: "ALPHA1", 
    name: "John Doe", 
    phone: "+1 555-0101",
    truck: "T001",
    trailer: "TR001",
    vin: "1HGBH41JXMN109186"
  },
  { 
    id: 2, 
    callsign: "BRAVO2", 
    name: "Sara Lee", 
    phone: "+1 555-0102",
    truck: "T002",
    trailer: "TR002",
    vin: "1HGBH41JXMN109187"
  },
  { 
    id: 3, 
    callsign: "CHARLIE3", 
    name: "Alex Kim", 
    phone: "+1 555-0103",
    truck: "T003",
    trailer: "TR003",
    vin: "1HGBH41JXMN109188"
  },
];

// For testing empty state: uncomment the line below
// mockDriversArray = [];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all drivers
 * @returns {Promise<Array>} Array of driver objects
 */
export async function getDrivers() {
  await delay(500); // Simulate network delay
  return Promise.resolve([...mockDriversArray]);
}

/**
 * Create a new driver
 * @param {Object} driver - Driver data
 * @returns {Promise<Object>} Created driver with ID
 */
export async function createDriver(driver) {
  await delay(300);
  const newDriver = {
    ...driver,
    id: Date.now() // Generate unique ID
  };
  mockDriversArray.push(newDriver);
  return Promise.resolve(newDriver);
}

/**
 * Update an existing driver
 * @param {number} id - Driver ID
 * @param {Object} updates - Updated driver data
 * @returns {Promise<Object>} Updated driver object
 */
export async function updateDriver(id, updates) {
  await delay(300);
  const updatedDriver = { id, ...updates };
  const index = mockDriversArray.findIndex(driver => driver.id === id);
  if (index !== -1) {
    mockDriversArray[index] = updatedDriver;
  }
  return Promise.resolve(updatedDriver);
}

/**
 * Delete a driver
 * @param {number} id - Driver ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteDriver(id) {
  await delay(200);
  const index = mockDriversArray.findIndex(driver => driver.id === id);
  if (index !== -1) {
    mockDriversArray.splice(index, 1);
  }
  return Promise.resolve({ success: true });
}

// TODO: Replace with real API calls when backend is ready
// Example final implementation:
/*
export async function getDrivers() {
  const res = await fetch('/api/drivers');
  if (!res.ok) throw new Error('Failed to fetch drivers');
  return await res.json();
}

export async function createDriver(driver) {
  const res = await fetch('/api/drivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driver)
  });
  if (!res.ok) throw new Error('Failed to create driver');
  return await res.json();
}

export async function updateDriver(id, updates) {
  const res = await fetch(`/api/drivers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update driver');
  return await res.json();
}

export async function deleteDriver(id) {
  const res = await fetch(`/api/drivers/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete driver');
  return await res.json();
}
*/
