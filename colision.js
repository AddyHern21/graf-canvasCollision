const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

//Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = 'linear-gradient(to bottom, white, pink)';

// --- NUEVO: Cargar la imagen ---
const myImage = new Image();
// Puedes reemplazar esta URL por la ruta de tu propia imagen local (ej. 'asteroide.png')
myImage.src = "kirbyy.png";


// Variables globales para el juego
let score = 0; // Contador de círculos eliminados
let globalSpeedMultiplier = 1; // Multiplicador para las 3 fases de velocidad

class GameObject {
    constructor(x, y, radius, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;

    this.text = text;

    // Velocidad aleatoria asignada a cada objeto
    this.speed = speed;
    // Movimiento aleatorio en X (diagonalidad) entre -2 y 2
    this.dx = (Math.random() - 0.5) * 4; 
    this.dy = this.speed; // Velocidad de caída base
    this.flashFrames = 0; // Controla cuántos fotogramas dura el color azul
}


draw(context) {
    // 1. Efecto de "Flash Azul" adaptado para imágenes
        if (this.flashFrames > 0) {
            context.beginPath();
            context.arc(this.posX, this.posY, this.radius + 5, 0, Math.PI * 2);
            context.fillStyle = "rgba(128, 6, 77, 0.39)"; // Aura azul semitransparente
            context.fill();
            context.closePath();
            this.flashFrames--;
        }

        // 2. Dibujar la imagen centrada
        // El tamaño de la imagen será el diámetro (radius * 2)
        context.drawImage(
            myImage, 
            this.posX - this.radius, // Ajuste X para centrar
            this.posY - this.radius, // Ajuste Y para centrar
            this.radius * 2,         // Ancho
            this.radius * 2          // Alto
        );

        // 3. Opcional: Dibujar el texto encima de la imagen
        context.fillStyle = "white"; // Cambiado a blanco para que resalte
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 14px Arial";
        context.fillText(this.text, this.posX, this.posY);
}

// MÉTODO: Reinicia el círculo en la parte superior con nuevos valores
resetPosition() {
    this.radius = Math.random() * 25 + 20; // Imágenes entre 40px y 90px de ancho    this.posY = this.radius + 2; 
    this.posY = this.radius + 2; 
    this.posX = Math.random() * (window_width - this.radius * 2) + this.radius; // Zona X aleatoria
    this.speed = Math.random() * 3 + 1; // Nueva velocidad aleatoria
    this.dy = this.speed;
    this.dx = (Math.random() - 0.5) * 4;
    this.flashFrames = 0;
}



// Método para resolver la física del rebote entre dos círculos
resolveCollision(otherObject) {
    let dx = otherObject.posX - this.posX; // se vuelven a calcular la distancia entre los centros
    let dy = otherObject.posY - this.posY; // se vuelven a calcular la distancia entre los centros
    let distance = Math.sqrt(dx * dx + dy * dy); // calcula la distancia entre los circulos

        // Calcular el vector normal (dirección del choque)
    let nx = dx / distance;
    let ny = dy / distance;

        // Calcular la velocidad relativa entre los dos círculos
    let dvx = this.dx - otherObject.dx;
    let dvy = this.dy - otherObject.dy;

        // Producto punto de la velocidad relativa y la normal (Fuerza total de cada circulo)
    let speed = dvx * nx + dvy * ny;

        // Si 'speed' es mayor a 0, los círculos se están acercando. 
        // Si es menor a 0, ya se están separando (evita que se queden pegados).
    if (speed > 0) {
        // Intercambio de velocidades
        // 
        this.dx -= speed * nx;
        this.dy -= speed * ny;
        otherObject.dx += speed * nx;
        otherObject.dy += speed * ny;
    }
}

// Verificar colisiones con otros círculos
checkCollisions(allObjects) {
    for (let i = 0; i < allObjects.length; i++) {
        let otherObject = allObjects[i];

        // Evitamos que el círculo se compare consigo mismo
        if (this !== otherObject) {
            // Aplicación de la fórmula de distancia entre dos puntos
            let dx = this.posX - otherObject.posX; // calcula la distancia horizontal (en el eje X) 
            let dy = this.posY - otherObject.posY; // Calcula la distancia vertical (en el eje Y)
            let distance = Math.sqrt(dx * dx + dy * dy); // Aplica el Teorema de Pitágoras

            // Si la distancia es menor a la suma de los radios, hay colisión
            if (distance < this.radius + otherObject.radius) {
                // Si hay colisión, activamos el temporizador en ambos círculos
                // 15 fotogramas equivalen a un cuarto de segundo visible
                this.flashFrames = 15;  // activa destello durante 15 segundos
                otherObject.flashFrames = 15;  // activa destello durante 15 segundos
                this.resolveCollision(otherObject); // se llama al metodo encargado de calcular el rebote          
                }
        }
    }
}

update(context, allObjects) {
        this.checkCollisions(allObjects); // Verificar colisiones antes de dibujar
        this.draw(context);

        // Actualizar posiciones aplicando el multiplicador de velocidad global del juego
        this.posX += this.dx * globalSpeedMultiplier;
        this.posY += this.dy * globalSpeedMultiplier; 

        // Rebote en paredes laterales
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Si el círculo desaparece por el fondo, se recicla arriba para que el número nunca disminuya
        if (this.posY - this.radius > window_height) {
            this.resetPosition();
        } 
        else if (this.posY - this.radius < 0) {
            this.posY = this.radius;
            this.dy = Math.abs(this.dy); 
        }

    }
}

// Crear un array para almacenar N círculos
let gameObjects = [];

// Función para generar círculos aleatorios
function generateObjects(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = radius + 2; // Iniciar siempre justo después del margen superior
        let speed = Math.random() * 3 + 1; // Velocidades iniciales diferentes (1 a 4)    
        let text = `C${i + 1}`; // Etiqueta del círculo
        gameObjects.push(new GameObject(x, y, radius, text, speed));    
    }
}

// NUEVA FUNCIÓN: Dibuja el contador en la esquina superior derecha
function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`Puntuación: ${score}`, window_width - 30, 30);
    
    // Opcional: Mostrar la fase actual de velocidad
    let phaseText = "Normal";
    if (globalSpeedMultiplier === 1.5) phaseText = "Media";
    if (globalSpeedMultiplier === 2.5) phaseText = "Alta";
    
    ctx.font = "18px Arial";
    ctx.fillText(`Velocidad: ${phaseText}`, window_width - 30, 60);
}


// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas
    
    gameObjects.forEach(obj => {
        // Ahora pasamos el arreglo 'circles' al método update
        obj.update(ctx, gameObjects);
    });

    drawScore(); // Dibujar el marcador encima de los círculos

    requestAnimationFrame(animate); // Repetir la animación
}


// Generar N círculos y comenzar la animación
generateObjects(20); // Puedes cambiar el número de círculos aquí
animate();

// --- NUEVO ALGORITMO: Detección de clics para eliminar círculos ---
canvas.addEventListener('click', function(event) {
    // 1. Obtener las coordenadas exactas del mouse dentro del canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left; // se le resta el borde del lienzo asegurando que el clic sea exacto
    const mouseY = event.clientY - rect.top;

    // 2. Recorrer el arreglo de círculos en reversa
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        let obj = gameObjects[i];
        
        // 3. Calcular la distancia entre el clic y el centro del círculo actual
        let dx = mouseX - obj.posX;
        let dy = mouseY - obj.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // 4. Si la distancia es menor o igual al radio, el clic fue adentro
        if (distance <= obj.radius) {
            // 1. Aumentar el contador
            score++;
            
            // 2. Aplicar reglas de velocidad según el contador
            if (score > 15) {
                globalSpeedMultiplier = 2.5; // Velocidad Alta
            } else if (score > 10) {
                globalSpeedMultiplier = 1.5; // Velocidad Media
            }

            // 3. En lugar de eliminarlo (splice), lo "reciclamos" enviándolo de vuelta arriba
            obj.resetPosition();            
            break; 
        }
    }
});