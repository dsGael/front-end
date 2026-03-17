const API_URL = "https://taskmanagerapi-production-fd8f.up.railway.app/tasks";
const LOGIN_URL = "https://taskmanagerapi-production-fd8f.up.railway.app/auth/login";

const TOKEN_KEY = "access_token";
const USER_ID_KEY = "userId";

const pendingList = document.getElementById("pending-list");
const completedList = document.getElementById("completed-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const emptyMsg = document.getElementById("empty-msg");
const pendingEmpty = document.getElementById("pending-empty");
const completedEmpty = document.getElementById("completed-empty");
const logoutBtn = document.getElementById("logout-btn");
const userGreeting = document.getElementById("user-greeting");

function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUserId() {
  const rawUserId = localStorage.getItem(USER_ID_KEY);
  const parsed = Number.parseInt(rawUserId ?? "", 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getUserName() {
  return localStorage.getItem("name") ?? "";
}

function parseJwtPayload(token) {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds >= payload.exp;
}

function hasValidSession() {
  const token = getAccessToken();
  const userId = getUserId();
  if (!token || !userId) return false;

  if (isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    return false;
  }

  return true;
}

async function apiRequest(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
  }

  return response;
}

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
  const userId = getUserId();
  if (!userId) {
    logout();
    return Promise.resolve();
  }

  return apiRequest(`${API_URL}/${userId}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((tasks) => {
      renderTasks(tasks);
    })
    .catch((err) => {
      console.error("Error al obtener tareas:", err);
    });
}

async function addTask(title) {
  try {
    const userId = getUserId();
    if (!userId) {
      logout();
      return;
    }

    const res = await apiRequest(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, userId }),
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
    const res = await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchTasks();
    }
  } catch (err) {
    console.error("Error al eliminar tarea:", err);
  }
}

async function completeTask(id, completed) {
  try {
    const res = await apiRequest(`${API_URL}/${id}`, {
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
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("name");
  localStorage.removeItem(USER_ID_KEY);
  globalThis.location.href = "login.html";
}

function renderUserGreeting() {
  if (!userGreeting) return;

  const name = getUserName().trim();
  userGreeting.textContent = name ? `Bienvenido ${name}` : "Hola,";
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
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem("name", data.name);
      localStorage.setItem(USER_ID_KEY, String(data.userId));
      globalThis.location.href="index.html";

    }

  }catch(e){
    console.error("Error al iniciar sesión:", e);
  }
}


if (pendingList && completedList) {
  if (!hasValidSession()) {
    logout();
  } else {
    renderUserGreeting();
    fetchTasks();
  }
}
