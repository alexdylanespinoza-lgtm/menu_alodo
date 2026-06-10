// 1. Estructura del carrito: Empezamos con el arreglo vacío
let carrito = [];

// 2. Esperar a que el HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    inicializarBotonesMenu();
    inyectarEstructuraCarritoDOM();
});

// 3. Asignar eventos a los botones "+" del menú de forma automática
function inicializarBotonesMenu() {
    const botonesAgregar = document.querySelectorAll(".btn-agregar");

    botonesAgregar.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            // Buscamos el contenedor del producto más cercano
            const contenedorProducto = e.target.closest(".item-producto");
            const nombre = contenedorProducto.querySelector(".nombre").textContent.trim();
            
            // Obtener el precio correcto dependiendo de si es normal o sección múltiple/combo
            let precioTexto = "";
            const precioAccionContenedor = e.target.closest(".precio-accion");
            if (precioAccionContenedor) {
                precioTexto = precioAccionContenedor.querySelector(".precio").textContent;
            } else {
                precioTexto = contenedorProducto.querySelector(".precio").textContent;
            }
            
            // Limpiamos el texto para dejar solo el número entero
            const precio = parseInt(precioTexto.replace("$", ""), 10);

            // Identificar si es un combo en la sección de personalizar
            let nombreFinal = nombre;
            const esCombo = e.target.closest(".precios-multiples");
            if (esCombo) {
                nombreFinal = `${nombre} (Combo)`;
            }

            agregarProducto(nombreFinal, precio);
        });
    });
}

// 4. Función para agregar productos al carrito (Controlando cantidades)
function agregarProducto(nombre, precio) {
    // Si el producto ya existe, aumentamos su cantidad
    const productoExistente = carrito.find(item => item.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        // Si es nuevo, lo empujamos con cantidad 1 y un ID único basado en el tiempo
        carrito.push({
            id: Date.now(),
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    console.log(`✅ ${nombre} agregado.`);
    actualizarInterfazCarrito();
}

// 5. Función para restar o quitar productos del carrito
function restarOQuitarProducto(id) {
    const producto = carrito.find(item => item.id === id);

    if (producto) {
        if (producto.cantidad > 1) {
            producto.cantidad -= 1;
        } else {
            // Si la cantidad llega a 0, lo eliminamos por completo del arreglo
            carrito = carrito.filter(item => item.id !== id);
        }
    }
    actualizarInterfazCarrito();
}

// 6. Inyectar la interfaz visual del Carrito flotante en el DOM de forma dinámica
function inyectarEstructuraCarritoDOM() {
    // Buscamos el icono del carrito que ya tienes en tu HTML para enlazarlo
    const iconoCarrito = document.querySelector(".icono-carrito");
    
    // Crear el contenedor principal de la ventanita del carrito
    const carritoModal = document.createElement("div");
    carritoModal.id = "carrito-modal";
    carritoModal.className = "carrito-modal-oculto"; // Se controla la visibilidad por CSS
    
    carritoModal.innerHTML = `
        <div class="carrito-contenido">
            <div class="carrito-top">
                <h3>Tu Pedido Alodog</h3>
                <button id="cerrar-carrito">✕</button>
            </div>
            <div id="carrito-items-lista">
                <p class="carrito-vacio-txt">El carrito está vacío. ¡Agrega unas K-Corn Dogs! 🌭</p>
            </div>
            <div class="carrito-resumen">
                <div class="total-contenedor">
                    <span>Total:</span>
                    <span id="carrito-total-pago">$0</span>
                </div>
                <button id="btn-enviar-whatsapp" disabled>Pedir por WhatsApp 💬</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(carritoModal);

    // Eventos para abrir y cerrar la ventana del carrito
    iconoCarrito.addEventListener("click", (e) => {
        e.preventDefault();
        carritoModal.classList.toggle("carrito-modal-visible");
    });

    document.getElementById("cerrar-carrito").addEventListener("click", () => {
        carritoModal.classList.remove("carrito-modal-visible");
    });

    // Configurar la acción del botón final de WhatsApp
    document.getElementById("btn-enviar-whatsapp").addEventListener("click", enviarPedidoWhatsApp);
}

// 7. Renderizar y actualizar los elementos visuales dentro del carrito
function actualizarInterfazCarrito() {
    const listaItemsDOM = document.getElementById("carrito-items-lista");
    const totalDOM = document.getElementById("carrito-total-pago");
    const btnWhatsapp = document.getElementById("btn-enviar-whatsapp");
    const iconoCarrito = document.querySelector(".icono-carrito");

    // Actualizar el contador numérico visual en el icono de compras
    const totalProductos = carrito.reduce((acumulador, item) => acumulador + item.cantidad, 0);
    iconoCarrito.innerHTML = `🛒 <span class="badge-carrito">${totalProductos}</span>`;

    if (carrito.length === 0) {
        listaItemsDOM.innerHTML = `<p class="carrito-vacio-txt">El carrito está vacío. ¡Agrega unas K-Corn Dogs! 🌭</p>`;
        totalDOM.textContent = "$0";
        btnWhatsapp.disabled = true;
        return;
    }

    // Si hay artículos, limpiamos y mapeamos los productos
    listaItemsDOM.innerHTML = "";
    let cuentaTotal = 0;

    carrito.forEach((item) => {
        const subtotal = item.precio * item.cantidad;
        cuentaTotal += subtotal;

        const filaItem = document.createElement("div");
        filaItem.className = "carrito-item-renglon";
        filaItem.innerHTML = `
            <div class="info-item-car">
                <span class="car-nombre">${item.nombre}</span>
                <span class="car-precio">$${item.precio} x ${item.cantidad}</span>
            </div>
            <div class="car-acciones">
                <span class="car-subtotal">$${subtotal}</span>
                <button class="btn-restar-car" data-id="${item.id}">-</button>
                <button class="btn-sumar-car" data-nombre="${item.nombre}" data-precio="${item.precio}">+</button>
            </div>
        `;
        listaItemsDOM.appendChild(filaItem);
    });

    totalDOM.textContent = `$${cuentaTotal}`;
    btnWhatsapp.disabled = false;

    // Asignar eventos a los botones internos de cambiar cantidad dentro del carrito
    document.querySelectorAll(".btn-restar-car").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"), 10);
            restarOQuitarProducto(id);
        });
    });

    document.querySelectorAll(".btn-sumar-car").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const nombre = e.target.getAttribute("data-nombre");
            const precio = parseInt(e.target.getAttribute("data-precio"), 10);
            agregarProducto(nombre, precio);
        });
    });
}

// 8. Construir el mensaje formateado y redirigir a WhatsApp
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;

    // Puedes cambiar este número por el de tu negocio (Formato internacional sin el signo +)
    // Ejemplo: 521477XXXXXXX para León/Guanajuato
    const numeroTelefono = "524770000000"; 

    let textoMensaje = "¡Hola Alodog! 🌭 Me gustaría armar el siguiente pedido:\n\n";
    let cuentaTotal = 0;

    carrito.forEach((item) => {
        const subtotal = item.precio * item.cantidad;
        cuentaTotal += subtotal;
        textoMensaje += `• *${item.cantidad}x* ${item.nombre} -> _$${subtotal}_\n`;
    });

    textoMensaje += `\n💰 *Total a pagar: $${cuentaTotal}*\n`;
    textoMensaje += "¿Me confirman el tiempo de entrega? ¡Gracias! ✨";

    // Codificamos los caracteres especiales para la URL
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(textoMensaje)}`;
    
    // Abrir pestaña de WhatsApp
    window.open(urlWhatsApp, "_blank");
}


