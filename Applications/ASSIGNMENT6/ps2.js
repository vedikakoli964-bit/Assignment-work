const API_URL = "https://jsonplaceholder.typicode.com/users"; 
let students = []; 
const studentTableBody = document.getElementById("studentTableBody");
const studentForm = document.getElementById("studentForm");
const searchInput = document.getElementById("search");
const statusMessage = document.getElementById("statusMessage");
async function fetchStudents() {
  showStatus("Loading students...", "loading");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch student data");
    const data = await response.json();
    students = data.map((item, index) => ({
      id: item.id || index + 1,
      name: item.name,
      email: item.email || "student@example.com",
      course: item.company ? item.company.bs : "Computer Science",
      age: item.age || 20
    }));

    clearStatus();
    renderStudents(students);
  } catch (error) {
    showStatus("Error loading students: " + error.message, "error");
  }
}
function renderStudents(list) {
  studentTableBody.innerHTML = ""; 

  if (list.length === 0) {
    studentTableBody.innerHTML = `<tr><td colspan="6">No students found.</td></tr>`;
    return;
  }
  list.forEach((student) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course}</td>
      <td>${student.age}</td>
      <td>
        <button onclick="deleteStudent('${student.id}')">Delete</button>
      </td>
    `;
    studentTableBody.appendChild(tr);
  });
}
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();
  const age = document.getElementById("age").value.trim();
  if (!name || !email || !course || !age) {
    alert("Please fill in all fields.");
    return;
  }
  const newStudent = { name, email, course, age: Number(age) };
  showStatus("Adding student...", "loading");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
    if (!response.ok) throw new Error("Failed to add student");
    const createdStudent = await response.json();
    if (!createdStudent.id) createdStudent.id = Date.now(); 
    students.push(createdStudent);
    renderStudents(students);
    studentForm.reset();
    clearStatus();
  } catch (error) {
    showStatus("Error adding student: " + error.message, "error");
  }
});
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;
  showStatus("Deleting student...", "loading");
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete student");
    students = students.filter((s) => s.id != id);
    renderStudents(students);
    clearStatus();
  } catch (error) {
    showStatus("Error deleting student: " + error.message, "error");
  }
}
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = students.filter((student) => {
    return (
      student.name.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query)
    );
  });
  renderStudents(filtered);
});
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-msg ${type}`;
}
function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-msg";
}
fetchStudents();
