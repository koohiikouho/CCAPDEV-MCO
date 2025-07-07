
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