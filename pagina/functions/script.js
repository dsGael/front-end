const usuarios = [
    {
        "id": 1,
        "user": "admin",
        "password": "123",
        "likes": []
    },
    {
        "id": 2,
        "user": "user1",
        "password": "abc",
        "likes": []
    }
];

const carros = [
    {
        "id": 1,
        "nombre": "Toyota Corolla",
        "modelo": "2023",
        "num_likes": 150,
        "foto": "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600&h=400&fit=crop"
    },
    {
        "id": 2,
        "nombre": "Honda Civic",
        "modelo": "2022",
        "num_likes": 200,
        "foto": "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=600&h=400&fit=crop"
    },
    {
        "id": 3,
        "nombre": "Ford Mustang",
        "modelo": "2021",
        "num_likes": 340,
        "foto": "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=600&h=400&fit=crop"
    },
    {
        "id": 4,
        "nombre": "Chevrolet Camaro",
        "modelo": "2023",
        "num_likes": 120,
        "foto": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop"
    },
    {
        "id": 5,
        "nombre": "Tesla Model 3",
        "modelo": "2024",
        "num_likes": 500,
        "foto": "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=600&h=400&fit=crop"
    },
    {
        "id": 6,
        "nombre": "BMW M4",
        "modelo": "2022",
        "num_likes": 280,
        "foto": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop"
    },
    {
        "id": 7,
        "nombre": "Audi A5",
        "modelo": "2015",
        "num_likes": 220,
        "foto": "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&h=400&fit=crop"

    },
   

];

function init() {
    checkAuth();
    document.getElementById("username").innerText = JSON.parse(localStorage.getItem("user")).user;
    if (!localStorage.getItem("likes")) {
        localStorage.setItem("likes", JSON.stringify([]));
    }
    
    renderSorted('all');
    renderFavorites();
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/'))) {
         window.location.href = "login.html";
    }
}

function checkLoginState() {
    const user = JSON.parse(localStorage.getItem("user"));
    const favSection = document.getElementById("favorites-section");
    if (user && favSection) {
        favSection.classList.remove("hidden");
    }
}

function login(email, password) {
    const user = usuarios.find(u => u.user === email && u.password === password);
    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        globalThis.location.href = "index.html";
    } else {
        alert("Invalid email or password.");
    }
    console.log(user.user)

}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

function like(carId) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Por favor inicia sesión para agregar a favoritos.");
        return;
    }

    let likes = JSON.parse(localStorage.getItem("likes")) || [];
    
    if (likes.includes(carId)) {
        likes = likes.filter(id => id !== carId);
    } else {
        likes.push(carId);
    }
    
    localStorage.setItem("likes", JSON.stringify(likes));
    
    renderFavorites();
    const currentSort = document.getElementById('lista-carros').getAttribute('data-sort') || 'all';
    renderSorted(currentSort);
}

function orderByLikes() {
    return [...carros].sort((a, b) => b.num_likes - a.num_likes);
}

function orderByName() {
    return [...carros].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function orderByModel() {
    return [...carros].sort((a, b) => b.modelo - a.modelo);
}

function renderSorted(type) {
    let sorted;
    if (type === 'name') sorted = orderByName();
    else if (type === 'model') sorted = orderByModel();
    else if (type === 'likes') sorted = orderByLikes();
    else sorted = carros;
    
    // Guardar estado actual
    const lista = document.getElementById('lista-carros');
    if(lista) lista.setAttribute('data-sort', type);

    cargarCarros(sorted, "lista-carros");
}


function renderFavorites() {
    const likes = JSON.parse(localStorage.getItem("likes")) || [];
    const favoriteCars = carros.filter(car => likes.includes(car.id));
    cargarCarros(favoriteCars, "lista-favoritos");
    const container = document.getElementById("lista-favoritos");
    if(container) {
        if (favoriteCars.length === 0) {
            container.innerHTML = "<p class='text-gray-500 italic col-span-3 text-center'>No tienes favoritos aún.</p>";
        }
    }
}

function cargarCarros(listaCarros, elementoId) {
    let contenedor = document.getElementById(elementoId);
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const userLikes = JSON.parse(localStorage.getItem("likes")) || [];

    listaCarros.forEach(car => {
        const isLiked = userLikes.includes(car.id);
        const heartColor = isLiked ? "text-red-500 fill-current" : "text-gray-400";
        
        const card = `
            <li class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col h-full ring-1 ring-gray-100">
                <div class="relative h-48 overflow-hidden">
                    <img class="w-full h-full object-cover transition-transform duration-500 " src="${car.foto}" alt="${car.nombre}">
                    <div class="absolute top-0 right-0 bg-green-500 bg-opacity-90  font-bold text-white text-s px-2 py-1 m-2 rounded">
                        ${car.modelo}
                    </div>
                </div>
                
                <div class="p-5 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold text-gray-800">${car.nombre}</h3>
                    </div>
                    
                    <p class="text-gray-600 mb-4 text-sm flex-grow">Un increíble vehículo modelo ${car.modelo}.</p>
                    
                    <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <span class="text-s font-semibold text-gray-500 flex items-center gap-1">
                            ❤️ ${car.num_likes} Likes Globales
                        </span>
                        
                        <button onclick="like(${car.id})" class="focus:outline-none transform active:scale-95 transition-transform hover:bg-gray-100 p-2 rounded-full" title="${isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 ${heartColor} transition-colors duration-300" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </li>
        `;
        contenedor.innerHTML += card;
    });
}