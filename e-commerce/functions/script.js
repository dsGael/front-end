
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
        "imagen": "fotos/Hamburguesa.png"
    },
    {
        "id": 8,
        "nombre": "Horchata",
        "precio": 50,
        "descripcion": "Horchata de arroz",
        "imagen": "fotos/Hamburguesa.png"
    },
    {
        "id": 9,
        "nombre": "Agua",
        "precio": 50,
        "descripcion": "Agua natural",
        "imagen": "fotos/Hamburguesa.png"
    }
]

function cargarProductos(json, elementoId) {
    let lista=document.getElementById(elementoId);
    json.forEach(producto => {
        const html=`
            <div class="bloque">
                <div class="nombre"> ${producto.nombre} </div>
                <div>
                    <img class="imgComida" src="${producto.imagen}" alt="">
                    <h3 class="precio" >$${producto.precio}.00</h3>
                    <p class="descripcion" >${producto.descripcion}</p>
                </div>
                <button class="botonAdd" onclick="agregarCarrito('${producto.nombre}', ${producto.precio})">agregar</button>
            </div>

        `;

        lista.innerHTML+=html;
    });

}



const carritoList=[];
function agregarCarrito(nombre,precio) {
    let producto = {
        nombre: nombre,
        precio: precio
    };
    carritoList.push(producto);
    console.log(carritoList);



}

function mostrarCarrito(json, elementoId) {
    let lista=document.getElementById(elementoId);
    json.forEach(producto => {
        const html=`
             <div class="bloque">
                <div class="nombre"> ${producto.nombre} </div>
                <div>
                    <img class="imgComida" src="${producto.imagen}" alt="">
                    <h3 class="precio" >$${producto.precio}.00</h3>
                    <p class="descripcion" >${producto.descripcion}</p>
                </div>
                <button class="botonAdd" onclick="agregarCarrito('${producto.nombre}', ${producto.precio})">agregar</button>
            </div> 
        
        `;
        lista.innerHTML+=html;
    });
}




document.addEventListener('DOMContentLoaded', () => {
    cargarProductos(comida, 'lista-comida');
    cargarProductos(bebidas, 'lista-bebidas');
});

