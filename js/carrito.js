// Variables y configuración inicial
const apiUrl = 'https://fakestoreapi.com/products';
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Escuchar eventos DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const carritoIcono = document.getElementById('carrito-icono');
    const carritoContador = document.getElementById('carrito-contador');
    const carritoDesplegable = document.getElementById('carrito-desplegable');
    const listaCarrito = document.getElementById('lista-carrito');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const cerrarCarritoBtn = document.getElementById('close-cart');
    const totalPriceElem = document.getElementById('total-price');

    // Mostrar el contador del carrito
    function actualizarContador() {
        carritoContador.textContent = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
        carritoContador.style.display = carrito.length > 0 ? 'block' : 'none';
    }

    // Calcular y mostrar el total
    function calcularTotal() {
        const total = carrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
        totalPriceElem.textContent = `$${total.toFixed(2)}`;
    }

    // Renderizar el carrito en el desplegable
    function renderizarCarrito() {
        listaCarrito.innerHTML = '';
        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<li>El carrito está vacío.</li>';
            totalPriceElem.textContent = `$0.00`;
        } else {
            carrito.forEach((producto, index) => {
                const li = document.createElement('li');
                li.classList.add('carrito-item');

                const imagen = document.createElement('img');
                imagen.classList.add('carrito-item-imagen');
                imagen.src = producto.imagen;

                const detalles = document.createElement('div');
                detalles.classList.add('carrito-item-detalles');
                detalles.innerHTML = `
                    <h4>${producto.nombre}</h4>
                    <span class="carrito-item-precio">$${producto.precio}</span>
                `;

                const cantidadInput = document.createElement('input');
                cantidadInput.type = 'number';
                cantidadInput.value = producto.cantidad;
                cantidadInput.min = 1;
                cantidadInput.classList.add('carrito-item-cantidad');
                cantidadInput.addEventListener('input', (e) => {
                    producto.cantidad = parseInt(e.target.value);
                    guardarCarrito();
                });

                const eliminarBtn = document.createElement('button');
                eliminarBtn.textContent = 'Eliminar';
                eliminarBtn.onclick = () => eliminarProductoCarrito(index);

                const contenedor = document.createElement('div');
                contenedor.classList.add('carrito-item-contenedor');
                contenedor.append(imagen, detalles);

                li.append(contenedor, cantidadInput, eliminarBtn);
                listaCarrito.appendChild(li);
            });
            calcularTotal();
        }
    }

    // Guardar el carrito en localStorage y actualizar contador y carrito
    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContador();
        renderizarCarrito();
    }

    // Eliminar producto del carrito
    function eliminarProductoCarrito(index) {
        carrito.splice(index, 1);
        guardarCarrito();
    }

    // Función para mostrar el carrito desplegable
    carritoIcono.addEventListener('click', () => {
        carritoDesplegable.style.display = carritoDesplegable.style.display === 'none' ? 'block' : 'none';
    });

    cerrarCarritoBtn.addEventListener('click', () => {
        carritoDesplegable.style.display = 'none';
    });

    vaciarCarritoBtn.addEventListener('click', () => {
        carrito = [];
        guardarCarrito();
    });

    // Cargar productos desde la API
    async function obtenerProductos() {
        try {
            const response = await fetch(apiUrl);
            const productos = await response.json();
            mostrarProductos(productos.slice(0, 10)); // Mostrar 10 productos por defecto
        } catch (error) {
            console.error("Error al obtener productos:", error);
        }
    }

    // Mostrar productos en la interfaz
    function mostrarProductos(productos) {
        const productosContainer = document.querySelector('#productos-lista') || document.querySelector('#producto-flex');
        productosContainer.innerHTML = '';
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
            productosContainer.appendChild(productoCard);
        });
    }

    // Agregar al carrito
    function agregarAlCarrito(producto) {
        const existente = carrito.find(p => p.nombre === producto.nombre);
        if (existente) {
            existente.cantidad += producto.cantidad;
        } else {
            carrito.push(producto);
        }
        guardarCarrito();
    }

    // Función para actualizar cantidad en página de detalles
    document.querySelectorAll('.quantity-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
            const quantityInput = document.getElementById('quantity');
            let currentQuantity = parseInt(quantityInput.value);
            if (e.target.textContent === '-' && currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1;
            }
            if (e.target.textContent === '+') {
                quantityInput.value = currentQuantity + 1;
            }
        });
    });

    // Inicializar los productos
    obtenerProductos();
    renderizarCarrito();

    // Mostrar detalle de producto si estamos en su página
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId) {
        mostrarDetalleProducto(productId);
    }
});

// Función para mostrar detalle del producto
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
