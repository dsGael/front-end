
const comida=[
    {
        "id": 1,
        "nombre": "Hamburguesa Sencilla",
        "precio": 50,
        "descripcion": "Carne a la parrilla con lechuga, tomate y queso",
        "imagen": "fotos/Hamburguesa.png"
    },
    {
        "id": 2,
        "nombre": "Hamburguesa Doble Carne",
        "precio": 50,
        "descripcion": "2 CARNES a la parrilla con lechuga, tomate y queso",
        "imagen": "fotos/Hamburguesa.png"
    },
    {
        "id": 3,
        "nombre": "Double Western",
        "precio": 50,
        "descripcion": "Carne a la parrilla con tocino y salsa BBQ",
        "imagen": "fotos/Hamburguesa.png"
    },
    {
        "id": 4,
        "nombre": "Boneless",
        "precio": 50,
        "descripcion": "Tenders bañados en salsa",
        "imagen": "fotos/Hamburguesa.png"
    },
    {
        "id": 5,
        "nombre": "Papa Boneless",
        "precio": 50,
        "descripcion": "Pollo y papas con salsa",
        "imagen": "fotos/Hamburguesa.png"
    },
    {
        "id": 6,
        "nombre": "Papas fritas",
        "precio": 50,
        "descripcion": "Fritas",
        "imagen": "fotos/Hamburguesa.png"
    }
]

const bebidas=[
    {
        "id": 7,
        "nombre": "Refresco",
        "precio": 50,
        "descripcion": "Variedad de sabores",
        "imagen": "fotos/soda.png"
    },
    {
        "id": 8,
        "nombre": "Horchata",
        "precio": 50,
        "descripcion": "Horchata de arroz",
        "imagen": "fotos/soda.png"
    },
    {
        "id": 9,
        "nombre": "Agua",
        "precio": 50,
        "descripcion": "Agua natural",
        "imagen": "fotos/soda.png"
    }
]

function cargarProductos(json, elementoId) {
    let lista=document.getElementById(elementoId);
    if (!lista) return;
    json.forEach(producto => {
        const html=`
            <li class="bloque">
                <div class="nombre"> ${producto.nombre} </div>
                <div>
                    <img class="imgComida" src="${producto.imagen}" alt="imagen de ${producto.nombre}">
                    <h3 class="precio" >$${producto.precio}.00</h3>
                    <p class="descripcion" >${producto.descripcion}</p>
                </div>
                <button class="botonAdd" onclick="agregarCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.descripcion}')">agregar</button>
            </li>

        `;

        lista.innerHTML+=html;
    });

}


let carritoList = [];
function agregarCarrito(nombre, precio, imagen, descripcion) {
    const producto = {
        nombre: nombre,
        precio: precio,
        imagen: imagen,
        descripcion: descripcion
    };
    carritoList.push(producto);
    alert(`Producto ${nombre} agregado al carrito.`);
    console.log(carritoList);
    mostrarCarrito(carritoList, 'lista-carrito');
}


function mostrarCarrito(lista, elementoId) {
    let cosas = document.getElementById(elementoId);
    if (!cosas) return; 
    cosas.innerHTML = ""; 
    lista.forEach(producto => {
        const html = `
             <li class="bloque">
                <div class="nombre"> ${producto.nombre} </div>
                <div>
                     <img class="imgComida" src="${producto.imagen}" alt="">
                    <h3 class="precio" >$${producto.precio}.00</h3>
                    <p class="descripcion" >${producto.descripcion}</p>
                </div>
            </li> 
        `;
        cosas.innerHTML += html;
    });
}




document.addEventListener('DOMContentLoaded', () => {
    cargarProductos(comida, 'lista-comida');
    cargarProductos(bebidas, 'lista-bebidas');
    mostrarCarrito(carritoList, 'lista-carrito');
});

