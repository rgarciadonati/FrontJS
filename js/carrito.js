document.addEventListener("DOMContentLoaded", () => {
    // Variables del DOM
    const carritoIcono = document.getElementById('carrito-icono'); 
    const carritoContador = document.getElementById('carrito-contador');
    const carritoDesplegable = document.getElementById('carrito-desplegable');
    const listaCarrito = document.getElementById('lista-carrito');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const cerrarCarritoBtn = document.getElementById('close-cart');
    const totalPriceElem = document.getElementById('total-price');

    // Inicialización del carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Función para mostrar el carrito (mostrar/ocultar desplegable)
    function mostrarCarrito() {
        carritoDesplegable.style.display = carritoDesplegable.style.display === 'none' ? 'block' : 'none';
    }

    // Función para actualizar el contador de productos en el carrito
    function actualizarContador() {
        carritoContador.textContent = carrito.length;
        carritoContador.style.display = carrito.length > 0 ? 'block' : 'none';
    }

    // Función para calcular y mostrar el total
    function calcularTotal() {
        let total = 0;
        carrito.forEach(producto => {
            total += producto.precio * producto.cantidad;
        });
        totalPriceElem.textContent = `${total.toFixed(2)}`;
    }

    // Función para renderizar el carrito en el desplegable
    function renderizarCarrito() {
        listaCarrito.innerHTML = ''; // Limpiar la lista antes de renderizar
        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<li>El carrito está vacío.</li>';
            totalPriceElem.textContent = `0.00`;  // Mostrar el total como $0.00 cuando está vacío
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
                    localStorage.setItem('carrito', JSON.stringify(carrito));
                    renderizarCarrito();  // Vuelve a renderizar después de actualizar la cantidad
                    calcularTotal();  // Actualiza el total después de cambiar la cantidad
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
            calcularTotal();  // Calcular el total al renderizar los productos
        }
    }

    // Función para agregar un producto al carrito
    function agregarAlCarrito(producto) {
        const productoExistente = carrito.find(p => p.nombre === producto.nombre);
        if (productoExistente) {
            productoExistente.cantidad += 1; // Aumentar la cantidad si ya está en el carrito
        } else {
            carrito.push(producto);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContador();
        renderizarCarrito();
    }

    // Función para eliminar un producto del carrito
    function eliminarProductoCarrito(index) {
        carrito.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContador();
        renderizarCarrito();
    }

    // Mostrar el carrito al hacer clic en el icono
    carritoIcono.addEventListener('click', mostrarCarrito);

    // Cerrar el carrito (cuando el usuario hace clic en el botón de cierre)
    cerrarCarritoBtn.addEventListener('click', () => {
        carritoDesplegable.style.display = 'none';
    });

    // Vaciar el carrito
    vaciarCarritoBtn.addEventListener('click', () => {
        carrito = [];
        localStorage.removeItem('carrito'); // Eliminar el carrito del localStorage
        actualizarContador(); // Actualizar contador
        renderizarCarrito(); // Renderizar el carrito vacío
    });

    // Agregar productos al carrito desde las tarjetas de productos
    const botonesAgregarCarrito = document.querySelectorAll('.producto-card button');
    botonesAgregarCarrito.forEach((boton, index) => {
        boton.addEventListener('click', () => {
            const nombreProducto = document.querySelectorAll('.producto-card h3')[index].textContent;
            const precioProducto = document.querySelectorAll('.producto-card .precio-nuevo')[index].textContent.replace('$', '').replace(',', '');
            const imagenProducto = document.querySelectorAll('.producto-card img')[index].src;

            const producto = {
                nombre: nombreProducto,
                precio: parseFloat(precioProducto),
                cantidad: 1,
                imagen: imagenProducto
            };

            agregarAlCarrito(producto);
        });
    });

    vaciarCarritoBtn.addEventListener('click', () => {
        carrito = [];
        localStorage.removeItem('carrito');
        actualizarContador();
        renderizarCarrito();
    });

    cerrarCarritoBtn.addEventListener('click', () => {
        carritoDesplegable.style.display = 'none';
    });

    // Inicializar al cargar la página
    actualizarContador();
    renderizarCarrito();
});