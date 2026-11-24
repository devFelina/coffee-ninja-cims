const API_URL = 'http://localhost:5005/api';

async function readResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export async function loginStaff(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return readResponse(response);
}

export async function getInquiries(token, filters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.append('search', filters.search.trim());
  }

  if (filters.status) {
    params.append('status', filters.status);
  }

  const response = await fetch(
    `${API_URL}/inquiries?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await readResponse(response);

  // The API may return an array directly or an object containing the records.
  return Array.isArray(data)
    ? data
    : data.inquiries || data.results || [];
}

export async function createInquiry(token, inquiryData) {
  const response = await fetch(`${API_URL}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(inquiryData),
  });

  return readResponse(response);
}

export async function getInquiryById(token, id) {
    const response = await fetch(`${API_URL}/inquiries/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return readResponse(response);
}

export async function updateInquiryStatus(token, id, status) {
    const response = await fetch(`${API_URL}/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    return readResponse(response);
}