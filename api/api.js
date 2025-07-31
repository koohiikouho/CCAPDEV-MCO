
export async function getUserData() {
  const response = await fetch('http://localhost:3000/users');
  const data = await response.json();
  return data;
}

export async function getLabReservations() {
  const response = await fetch('http://localhost:3000/reservations');
  const data = await response.json();
  return data;
}

export async function getLabData() {
  const response = await fetch('http://localhost:3000/labs');
  const data = await response.json();
  return data;
}

export async function getSuggestions() {
  const response = await fetch('http://localhost:3000/suggestions');
  const data = await response.json();
  return data;
}

export async function verifySignUp(firstName, lastName, idNumber, email, password) {
  const response = await fetch('http://localhost:3000/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, idNumber, email, password })
  });

  const data = await response.json();
  return data;
}

export async function updateUserProfile(payload, token) {
  const response = await fetch("http://localhost:3000/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

export async function sendSuggestion(email, subject, message) {
  const response = await fetch('http://localhost:3000/users/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, subject, message })
  });

  const data = await response.json();
  return data;
}
