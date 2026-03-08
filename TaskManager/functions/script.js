const API_URL = "https://taskmanagerapi-production-fd8f.up.railway.app/tasks";

const pendingList = document.getElementById("pending-list");
const completedList = document.getElementById("completed-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const emptyMsg = document.getElementById("empty-msg");
const pendingEmpty = document.getElementById("pending-empty");
const completedEmpty = document.getElementById("completed-empty");

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className =
    "flex items-center justify-between gap-3 bg-slate-800 px-4 py-3 rounded-lg";

  const left = document.createElement("div");
  left.className = "flex items-center gap-3";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(task.completed);
  checkbox.className = "h-4 w-4 accent-indigo-500 cursor-pointer";
  checkbox.addEventListener("change", () => {
    completeTask(task.id, checkbox.checked);
  });

  const span = document.createElement("span");
  span.textContent = task.title;
  span.className = task.completed ? "text-slate-500 line-through" : "text-white";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className =
    "p-2 text-red-300 hover:text-red-100 hover:bg-red-700/40 rounded transition";
  deleteBtn.setAttribute("aria-label", "Eliminar tarea");
  deleteBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M16.5 4.478V4.5h3.75a.75.75 0 010 1.5h-.818l-.877 12.156A3 3 0 0115.563 21H8.437a3 3 0 01-2.992-2.844L4.568 6H3.75a.75.75 0 010-1.5H7.5v-.022A2.25 2.25 0 019.75 2.25h4a2.25 2.25 0 012.75 2.228zm-6.75-.022a.75.75 0 00-.75.75V4.5h6v-.294a.75.75 0 00-.75-.75h-4z" clip-rule="evenodd"/></svg>';
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  left.appendChild(checkbox);
  left.appendChild(span);
  li.appendChild(left);
  li.appendChild(deleteBtn);

  return li;
}

function renderTasks(tasks) {
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  if (tasks.length === 0) {
    emptyMsg.classList.remove("hidden");
  } else {
    emptyMsg.classList.add("hidden");
  }

  pendingEmpty.classList.toggle("hidden", pendingTasks.length > 0);
  completedEmpty.classList.toggle("hidden", completedTasks.length > 0);

  pendingTasks.forEach((task) => {
    pendingList.appendChild(createTaskElement(task));
  });

  completedTasks.forEach((task) => {
    completedList.appendChild(createTaskElement(task));
  });
}

async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error("Error al obtener tareas:", err);
  }
}

async function addTask(title) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, completed: false }),
    });
    if (res.ok) {
      await fetchTasks();
    }
  } catch (err) {
    console.error("Error al crear tarea:", err);
  }
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchTasks();
    }
  } catch (err) {
    console.error("Error al eliminar tarea:", err);
  }
}

async function completeTask(id, completed) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (res.ok) {
      await fetchTasks();
    }
  } catch (err) {
    console.error("Error al completar tarea:", err);
  }
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  addTask(title);
  taskInput.value = "";
});

fetchTasks();
