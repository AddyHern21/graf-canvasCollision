const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
//Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#ff8";

class Circle {
constructor(x, y, radius, color, text, speed) {
this.posX = x;
this.posY = y;
this.radius = radius;
this.color = color;
this.originalColor = color; // Guarda el color original
this.text = text;
this.speed = speed;
this.dx = 1 * this.speed;
this.dy = 1 * this.speed;
this.flashFrames = 0; // Controla cuántos fotogramas dura el color azul
}
draw(context) {
context.beginPath();
context.strokeStyle = this.color;
context.textAlign = "center";
context.textBaseline = "middle";
context.font = "20px Arial";
context.fillText(this.text, this.posX, this.posY);
context.lineWidth = 2;
context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
context.stroke();
context.closePath();
}

// Método para resolver la física del rebote entre dos círculos
resolveCollision(otherCircle) {
    let dx = otherCircle.posX - this.posX; // se vuelven a calcular la distancia entre los centros
    let dy = otherCircle.posY - this.posY; // se vuelven a calcular la distancia entre los centros
    let distance = Math.sqrt(dx * dx + dy * dy); // calcula la distancia entre los circulos

        // Calcular el vector normal (dirección del choque)
    let nx = dx / distance;
    let ny = dy / distance;

        // Calcular la velocidad relativa entre los dos círculos
    let dvx = this.dx - otherCircle.dx;
    let dvy = this.dy - otherCircle.dy;

        // Producto punto de la velocidad relativa y la normal (Fuerza total de cada circulo)
    let speed = dvx * nx + dvy * ny;

        // Si 'speed' es mayor a 0, los círculos se están acercando. 
        // Si es menor a 0, ya se están separando (evita que se queden pegados).
    if (speed > 0) {
        // Intercambio de velocidades
        // 
        this.dx -= speed * nx;
        this.dy -= speed * ny;
        otherCircle.dx += speed * nx;
        otherCircle.dy += speed * ny;
    }
}

// Verificar colisiones con otros círculos
checkCollisions(allCircles) {
    // Por defecto, regresamos al color original en cada fotograma
    this.color = this.originalColor; 

    for (let i = 0; i < allCircles.length; i++) {
        let otherCircle = allCircles[i];

        // Evitamos que el círculo se compare consigo mismo
        if (this !== otherCircle) {
            // Aplicación de la fórmula de distancia entre dos puntos
            let dx = this.posX - otherCircle.posX; // calcula la distancia horizontal (en el eje X) 
            let dy = this.posY - otherCircle.posY; // Calcula la distancia vertical (en el eje Y)
            let distance = Math.sqrt(dx * dx + dy * dy); // Aplica el Teorema de Pitágoras

            // Si la distancia es menor a la suma de los radios, hay colisión
            if (distance < this.radius + otherCircle.radius) {
                // Si hay colisión, activamos el temporizador en ambos círculos
                // 15 fotogramas equivalen a un cuarto de segundo visible
                this.flashFrames = 15;  // activa destello durante 15 segundos
                otherCircle.flashFrames = 15;  // activa destello durante 15 segundos
                this.resolveCollision(otherCircle); // se llama al metodo encargado de calcular el rebote          
                }
        }
    }
}

update(context, allCircles) {
        this.checkCollisions(allCircles); // Verificar colisiones antes de dibujar
        // Lógica para gestionar el destello azul
            if (this.flashFrames > 0) {
                this.color = "#0000FF"; // Mantener en azul
                this.flashFrames--;     // Restar un fotograma al contador
            } else {
                this.color = this.originalColor; // Regresar a la normalidad
            }
        
        this.draw(context);

        // Actualizar la posición X
        this.posX += this.dx;
        // Cambiar la dirección si el círculo llega al borde del canvas en X
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Actualizar la posición Y
        this.posY += this.dy;
        // Cambiar la dirección si el círculo llega al borde del canvas en Y
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }
}
// Crear un array para almacenar N círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
    let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;
    let color = `#${Math.floor(Math.random()*16777215).toString(16)}`; // Color aleatorio
    let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 3
    let text = `C${i + 1}`; // Etiqueta del círculo
    circles.push(new Circle(x, y, radius, color, text, speed));
    }
}
// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas
    circles.forEach(circle => {
        // Ahora pasamos el arreglo 'circles' al método update
        circle.update(ctx, circles);
    });
    requestAnimationFrame(animate); // Repetir la animación
}
// Generar N círculos y comenzar la animación
generateCircles(20); // Puedes cambiar el número de círculos aquí
animate();