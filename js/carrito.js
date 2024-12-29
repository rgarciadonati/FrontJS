// API y carrito
const apiUrl = 'https://fakestoreapi.com/products';
let carrito = [];

// Inicializar el carrito desde localStorage o comenzar vacío.
// Persiste el carrito si el usuario cierra o actualiza la página.
function inicializarCarrito() {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
}

// Guardar el carrito en localStorage.
// Uso de localStorage para mantener persistencia.
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContador();
    renderizarCarrito();
}

// Mostrar el contador del carrito (Contador dinámico).
function actualizarContador() {
    const carritoContador = document.getElementById('carrito-contador');
    if (carritoContador) {
        carritoContador.textContent = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
        carritoContador.style.display = carrito.length > 0 ? 'block' : 'none';
    }
}

// Renderizar el carrito (Visualización de productos en el carrito, cantidades, precios y total).
function renderizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalPriceElem = document.getElementById('total-price');

    if (!listaCarrito || !totalPriceElem) return;

    listaCarrito.innerHTML = '';
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li>El carrito está vacío.</li>';
        totalPriceElem.textContent = `0.00`;
    } else {
        carrito.forEach((producto, index) => {
            const li = document.createElement('li');
            li.classList.add('carrito-item');

            // Visualización del producto en el carrito.
            const imagen = document.createElement('img');
            imagen.classList.add('carrito-item-imagen');
            imagen.src = producto.imagen;

            const detalles = document.createElement('div');
            detalles.classList.add('carrito-item-detalles');
            detalles.innerHTML = `
                <h4>${producto.nombre}</h4>
                <span class="carrito-item-precio">${producto.precio.toFixed(2)}</span>
            `;

            // Edición de cantidades del carrito.
            const cantidadInput = document.createElement('input');
            cantidadInput.type = 'number';
            cantidadInput.value = producto.cantidad;
            cantidadInput.min = 1;
            cantidadInput.classList.add('carrito-item-cantidad');
            cantidadInput.addEventListener('input', (e) => {
                producto.cantidad = parseInt(e.target.value) || 1;
                guardarCarrito();
            });

            // Botón para eliminar un producto del carrito.
            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.onclick = () => eliminarProductoCarrito(index);

            li.append(imagen, detalles, cantidadInput, eliminarBtn);
            listaCarrito.appendChild(li);
        });

        // Total dinámico: Actualiza el precio total en el carrito.
        const total = carrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
        totalPriceElem.textContent = `${total.toFixed(2)}`;
    }
}

// Agregar productos al carrito.
function agregarAlCarrito(producto) {
    const existente = carrito.find(p => p.nombre === producto.nombre);
    if (existente) {
        existente.cantidad += producto.cantidad;
    } else {
        carrito.push(producto);
    }
    guardarCarrito();
}

// Eliminar producto del carrito.
function eliminarProductoCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
}

// Vaciar todo el carrito.
function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
}

// Inicializar las interacciones con el carrito desplegable.
function inicializarDesplegableCarrito() {
    const carritoIcono = document.getElementById('carrito-icono');
    const carritoDesplegable = document.getElementById('carrito-desplegable');
    const cerrarCarritoBtn = document.getElementById('close-cart');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');

    if (carritoIcono && carritoDesplegable) {
        carritoIcono.addEventListener('click', () => {
            carritoDesplegable.style.display = 
                carritoDesplegable.style.display === 'none' || !carritoDesplegable.style.display
                    ? 'block'
                    : 'none';
        });
    }

    if (cerrarCarritoBtn) {
        cerrarCarritoBtn.addEventListener('click', () => {
            carritoDesplegable.style.display = 'none';
        });
    }

    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            vaciarCarrito();
        });
    }
}

// Cargar y mostrar productos desde una API (FETCH API).
// Consume datos desde la API y los muestra en forma de tarjetas.
async function cargarProductos() {
    try {
        const response = await fetch(apiUrl);
        const productos = await response.json();

        const homeContainer = document.querySelector('#productos-lista');
        const productosContainer = document.querySelector('#producto-flex');

        if (homeContainer) {
            mostrarProductos(productos.slice(0, 4), homeContainer);
        }

        if (productosContainer) {
            mostrarProductos(productos.slice(0, 12), productosContainer);
        }
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Mostrar productos en un contenedor (Visualización de productos).
function mostrarProductos(productos, contenedor) {
    contenedor.innerHTML = '';
    productos.forEach(producto => {
        const productoCard = document.createElement('div');
        productoCard.classList.add('producto-card');
        productoCard.innerHTML = `
            <div class="producto-card-img">
                <img src="${producto.image}" alt="${producto.title}">
            </div>
            <div class="producto-card-body">
                <h3>${producto.title}</h3>
                <div class="precio">$${producto.price}</div>
                <a href="detalle-producto.html?id=${producto.id}" class="ver-detalle">Ver detalles</a>
                <button class="agregar-carrito">Añadir al carrito</button>
            </div>
        `;

        productoCard.querySelector('.agregar-carrito').addEventListener('click', () => {
            const productoData = {
                nombre: producto.title,
                precio: producto.price,
                cantidad: 1,
                imagen: producto.image
            };
            agregarAlCarrito(productoData);
        });

        contenedor.appendChild(productoCard);
    });
}

// Inicializar el sitio y las funciones del carrito.
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito();
    actualizarContador();
    renderizarCarrito();
    inicializarDesplegableCarrito();

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (productId) {
        mostrarDetalleProducto(productId);
    } else {
        cargarProductos();
    }
});

// Detalles del producto (Visualización del detalle del producto seleccionado).
async function mostrarDetalleProducto(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        const producto = await response.json();
        document.querySelector('.imagen-principal img').src = producto.image;
        document.querySelector('h1').textContent = producto.title;
        document.querySelector('.precio').textContent = `$${producto.price}`;
        document.querySelector('.content p').textContent = producto.description;

        document.querySelector('.btn-comprar').addEventListener('click', () => {
            const cantidad = parseInt(document.getElementById('quantity').value) || 1;
            agregarAlCarrito({ 
                nombre: producto.title, 
                precio: producto.price, 
                cantidad, 
                imagen: producto.image 
            });
        });
    } catch (error) {
        console.error("Error al mostrar detalle:", error);
    }
}