const API_URL = "https://taskmanagerapi-production-fd8f.up.railway.app/comments";
const LOGIN_URL = "https://taskmanagerapi-production-fd8f.up.railway.app/auth/login";

const TOKEN_KEY = "access_token";
const USER_ID_KEY = "userId";
const USER_NAME_KEY = "name";

const commentList = document.getElementById("comment-list");
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");
const emptyMsg = document.getElementById("empty-msg");
const logoutBtn = document.getElementById("logout-btn");
const userGreeting = document.getElementById("user-greeting");
const loginError = document.getElementById("login-error");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

let commentsRefreshInterval = null;

function getAccessToken() {
	return localStorage.getItem(TOKEN_KEY);
}

function getUserId() {
	const rawUserId = localStorage.getItem(USER_ID_KEY);
	const parsed = Number.parseInt(rawUserId ?? "", 10);
	return Number.isNaN(parsed) ? null : parsed;
}

function getUserName() {
	return localStorage.getItem(USER_NAME_KEY) ?? "";
}

function parseJwtPayload(token) {
	try {
		const [, payloadPart] = token.split(".");
		if (!payloadPart) return null;
		const base64 = payloadPart.replaceAll("-", "+").replaceAll("_", "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((char) => {
					const codePoint = char.codePointAt(0) || 0;
					const hex = `00${codePoint.toString(16)}`;
					return `%${hex.slice(-2)}`;
				})
				.join("")
		);
		return JSON.parse(jsonPayload);
	} catch {
		return null;
	}
}

function isTokenExpired(token) {
	const payload = parseJwtPayload(token);
	if (!payload?.exp) return false;
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

function logout() {
	if (commentsRefreshInterval) {
		clearInterval(commentsRefreshInterval);
		commentsRefreshInterval = null;
	}

	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_NAME_KEY);
	localStorage.removeItem(USER_ID_KEY);
	globalThis.location.href = "login.html";
}

async function apiRequest(url, options = {}) {
	const token = getAccessToken();
	const headers = options.headers ? { ...options.headers } : {};

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

function normalizeComment(rawComment) {
	const userObject = rawComment.user && typeof rawComment.user === "object" ? rawComment.user : null;
	const authorNameFromObject =
		userObject?.user || userObject?.name || userObject?.username || null;
	const authorNameFromPrimitive =
		typeof rawComment.user === "string" ? rawComment.user : rawComment.author;

	return {
		id: rawComment.id,
		userId: Number.parseInt(String(rawComment.userId ?? rawComment.user_id ?? ""), 10) || null,
		author: authorNameFromObject || authorNameFromPrimitive || rawComment.name || rawComment.username || "Anónimo",
		text: rawComment.text || rawComment.content || rawComment.comment || "",
		createdAt: rawComment.createdAt || rawComment.created_at || null,
	};
}

function formatDate(isoString) {
	if (!isoString) return "";
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleString("es-AR", {
		hour12: false,
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function createCommentElement(comment) {
	const currentUserId = getUserId();
	const canDelete = currentUserId && comment.userId && currentUserId === comment.userId;

	const li = document.createElement("li");
	li.className = "bg-slate-800 rounded-xl p-4 border border-slate-700";

	const topRow = document.createElement("div");
	topRow.className = "flex items-start justify-between gap-3 mb-2";

	const info = document.createElement("div");

	const author = document.createElement("p");
	author.className = "text-indigo-300 font-semibold";
	author.textContent = comment.author;

	const date = document.createElement("p");
	date.className = "text-slate-400 text-xs";
	date.textContent = formatDate(comment.createdAt);

	const text = document.createElement("p");
	text.className = "text-white break-words";
	text.textContent = comment.text;

	info.appendChild(author);
	info.appendChild(date);
	topRow.appendChild(info);

	if (canDelete) {
		const deleteBtn = document.createElement("button");
		deleteBtn.type = "button";
		deleteBtn.className =
			"p-2 text-red-300 hover:text-red-100 hover:bg-red-700/40 rounded transition";
		deleteBtn.setAttribute("aria-label", "Eliminar comentario");
		deleteBtn.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
		deleteBtn.addEventListener("click", () => deleteComment(comment.id));
		topRow.appendChild(deleteBtn);
	}

	li.appendChild(topRow);
	li.appendChild(text);

	return li;
}

function renderComments(rawComments) {
	if (!commentList) return;

	const comments = rawComments
		.map(normalizeComment)
		.filter((comment) => comment.id != null && comment.text.trim() !== "")
		.sort((a, b) => {
			const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return bTime - aTime;
		});

	commentList.innerHTML = "";

	if (emptyMsg) {
		emptyMsg.classList.toggle("hidden", comments.length > 0);
	}

	comments.forEach((comment) => {
		commentList.appendChild(createCommentElement(comment));
	});
}

async function fetchComments() {
	try {
		const res = await apiRequest(API_URL);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const data = await res.json();
		const comments = Array.isArray(data) ? data : data.value || data.comments || [];
		renderComments(comments);
	} catch (err) {
		console.error("Error al obtener comentarios:", err);
	}
}

async function addComment(text) {
	const userId = getUserId();

	if (!userId) {
		logout();
		return;
	}

	try {
		const payload = {
			comment: text,
			userId,
		};

		const res = await apiRequest(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		await fetchComments();
	} catch (err) {
		console.error("Error al crear comentario:", err);
	}
}

async function deleteComment(id) {
	try {
		const res = await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		await fetchComments();
	} catch (err) {
		console.error("Error al eliminar comentario:", err);
	}
}

function renderUserGreeting() {
	if (!userGreeting) return;
	const name = getUserName().trim();
	userGreeting.textContent = name ? `Hola, ${name}` : "Hola";
}

async function login(user, password) {
	if (loginError) {
		loginError.classList.add("hidden");
		loginError.textContent = "";
	}

	if (!user?.trim() || !password?.trim()) {
		if (loginError) {
			loginError.textContent = "Completa usuario y contraseña.";
			loginError.classList.remove("hidden");
		}
		return;
	}

	try {
		const res = await fetch(LOGIN_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ user, password }),
		});

		if (!res.ok) {
			if (loginError) {
				loginError.textContent = "Usuario o contraseña inválidos.";
				loginError.classList.remove("hidden");
			}
			return;
		}

		const data = await res.json();
		localStorage.setItem(TOKEN_KEY, data.access_token);
		localStorage.setItem(USER_NAME_KEY, data.name);
		localStorage.setItem(USER_ID_KEY, String(data.userId));
		globalThis.location.href = "index.html";
	} catch (err) {
		console.error("Error al iniciar sesión:", err);
		if (loginError) {
			loginError.textContent = "No se pudo iniciar sesión. Intenta de nuevo.";
			loginError.classList.remove("hidden");
		}
	}
}

if (commentForm && commentInput) {
	commentForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const text = commentInput.value.trim();
		if (!text) return;

		addComment(text);
		commentInput.value = "";
	});
}

if (logoutBtn) {
	logoutBtn.addEventListener("click", logout);
}

if (commentList) {
	if (hasValidSession()) {
		renderUserGreeting();
		fetchComments();
		commentsRefreshInterval = setInterval(fetchComments, 3000);

		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				fetchComments();
			}
		});
	} else {
		logout();
	}
}

if (!commentList && hasValidSession()) {
	globalThis.location.href = "index.html";
}

if (loginForm && emailInput && passwordInput) {
	loginForm.addEventListener("submit", (event) => {
		event.preventDefault();
		login(emailInput.value, passwordInput.value);
	});
}

globalThis.login = login;


