const API_URL = "https://taskmanagerapi-production-fd8f.up.railway.app/tasks";
const LOGIN_URL = "https://taskmanagerapi-production-fd8f.up.railway.app/auth/login";

const userId =localStorage.getItem("userId");

const pendingList = document.getElementById("pending-list");
const completedList = document.getElementById("completed-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const emptyMsg = document.getElementById("empty-msg");
const pendingEmpty = document.getElementById("pending-empty");
const completedEmpty = document.getElementById("completed-empty");
const logoutBtn = document.getElementById("logout-btn");

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
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
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

function fetchTasks() {
  return fetch(`${API_URL}/${userId}`)
    .then((res) => res.json())
    .then((tasks) => {
      renderTasks(tasks);
    })
    .catch((err) => {
      console.error("Error al obtener tareas:", err);
    });
}

async function addTask(title) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, userId: Number.parseInt(userId) }),
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

if (taskForm && taskInput) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;
    addTask(title);
    taskInput.value = "";
  });
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("name");
  localStorage.removeItem("userId");
  globalThis.location.href = "login.html";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}


async function login(user, password) {
  try{
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("userId", data.userId);
      globalThis.location.href="index.html";


      await fetchTasks();

    }

  }catch(e){
    console.error("Error al iniciar sesión:", e);
  }
}


if (pendingList && completedList) {
  fetchTasks();
}
