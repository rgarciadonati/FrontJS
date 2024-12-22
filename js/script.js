// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos el formulario completo
    const formulario = document.querySelector("form");
    // Seleccionamos todos los campos dentro del formulario (input, textarea, y select)
    const inputs = formulario.querySelectorAll("input, textarea, select");

    /**
     * Función para validar cada campo de manera individual
     * @param {HTMLElement} input - El campo que se está validando
     */
    const validarCampo = (input) => {
        // Selecciona el contenedor del mensaje de error que está después del input
        const error = input.nextElementSibling; 
        
        // Verifica diferentes tipos de errores y muestra un mensaje personalizado
        if (input.validity.valueMissing) {
            error.textContent = "Este campo es obligatorio."; // Campo vacío
        } else if (input.validity.typeMismatch) {
            error.textContent = "El formato ingresado no es válido."; // Tipo incorrecto (ejemplo: email mal formateado)
        } else if (input.validity.patternMismatch) {
            error.textContent = "El formato ingresado no es válido."; // Patrón no coincide (usado para regex)
        } else if (input.validity.tooShort || input.validity.tooLong) {
            error.textContent = `El texto debe tener entre ${input.minLength} y ${input.maxLength} caracteres.`; // Longitud incorrecta
        } else {
            error.textContent = ""; // Sin errores
        }
    };

    // Agregar eventos a cada campo del formulario para validarlos en tiempo real
    inputs.forEach((input) => {
        // Crear un div para mostrar los mensajes de error y añadirlo después del campo
        const errorDiv = document.createElement("div");
        errorDiv.className = "error"; // Clase para estilos en CSS
        input.insertAdjacentElement("afterend", errorDiv);

        // Escucha el evento 'input' (cuando el usuario escribe) para validar en tiempo real
        input.addEventListener("input", () => validarCampo(input));
        // Escucha el evento 'blur' (cuando el campo pierde el foco) para validar al salir
        input.addEventListener("blur", () => validarCampo(input));
    });

    // Agregar un evento para validar todo el formulario cuando se intente enviar
    formulario.addEventListener("submit", (e) => {
        let formValido = true; // Bandera para verificar si el formulario es válido

        // Validar todos los campos del formulario
        inputs.forEach((input) => {
            validarCampo(input); // Valida el campo actual
            if (!input.checkValidity()) formValido = false; // Si un campo no es válido, cambia la bandera a false
        });

        // Si hay errores en el formulario, evita que se envíe
        if (!formValido) {
            e.preventDefault(); // Detiene el envío del formulario
            alert("Por favor corrige los errores en el formulario."); // Muestra una alerta al usuario
        }
    });
});
// Variables de DOM
const carritoIcono = document.getElementById('carrito-icono'); // Icono del carrito
const carritoContador = document.getElementById('carrito-contador'); // Contador de productos
const carritoDesplegable = document.getElementById('carrito-desplegable'); // Carrito desplegable
const listaCarrito = document.getElementById('lista-carrito'); // Lista de productos en el carrito
const vaciarCarritoBtn = document.getElementById('vaciar-carrito'); // Botón de vaciar carrito

// Inicialización del carrito desde localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para mostrar el carrito
function mostrarCarrito() {
    carritoDesplegable.style.display = carritoDesplegable.style.display === 'none' ? 'block' : 'none';
}

// Función para actualizar el contador de productos en el carrito
function actualizarContador() {
    carritoContador.textContent = carrito.length;
    carritoContador.style.display = carrito.length > 0 ? 'block' : 'none';
}

// Función para renderizar el carrito en el desplegable
function renderizarCarrito() {
    listaCarrito.innerHTML = ''; // Limpiar la lista antes de renderizar
    carrito.forEach((producto, index) => {
        const li = document.createElement('li');
        li.textContent = `${producto.nombre} - $${producto.precio}`;
        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.onclick = () => eliminarProductoCarrito(index);
        li.appendChild(eliminarBtn);
        listaCarrito.appendChild(li);
    });
}

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
    carrito.push(producto); // Agregar el producto al carrito
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Guardar carrito en localStorage
    actualizarContador(); // Actualizar contador
    renderizarCarrito(); // Renderizar el carrito
}

// Función para eliminar un producto del carrito
function eliminarProductoCarrito(index) {
    carrito.splice(index, 1); // Eliminar el producto del carrito
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar localStorage
    actualizarContador(); // Actualizar contador
    renderizarCarrito(); // Volver a renderizar el carrito
}

// Mostrar el carrito al hacer clic en el icono
carritoIcono.addEventListener('click', mostrarCarrito);

// Vaciar el carrito
vaciarCarritoBtn.addEventListener('click', () => {
    carrito = [];
    localStorage.removeItem('carrito'); // Eliminar el carrito del localStorage
    actualizarContador(); // Actualizar contador
    renderizarCarrito(); // Renderizar el carrito vacío
});

// Agregar productos al carrito desde las tarjetas de productos
const botonesAgregarCarrito = document.querySelectorAll('.btn-agregar');

botonesAgregarCarrito.forEach((boton, index) => {
    boton.addEventListener('click', () => {
        const nombreProducto = document.querySelectorAll('.producto-nombre')[index].textContent;
        const precioProducto = document.querySelectorAll('.precio-nuevo')[index].textContent.replace('$', '').replace(',', '');
        
        const producto = {
            nombre: nombreProducto,
            precio: precioProducto,
        };
        
        agregarAlCarrito(producto); // Agregar el producto al carrito
    });
});

// Inicializar el contador del carrito al cargar la página
actualizarContador();
