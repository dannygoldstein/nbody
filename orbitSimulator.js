const canvas = document.getElementById('orbitCanvas');
const ctx = canvas.getContext('2d');

const G = 6.67430e-11; // gravitational constant
const scaleFactor = 1e9; // Scale factor for rendering (1 unit = 1e9 meters)
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let bodies = [];

function randomNormal() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}


function initializeBodies() {
    // Reset or initialize the bodies array

    let separation = parseFloat(document.getElementById('separation').value) * 1e9;

    bodies = [
        // Sun
        { x: 0, y: 0, vx: 0, vy: 0, mass: 6.417e29  },
        // Earth
        { x: 147.1e9 / scaleFactor, y: 0, vx: 0, vy: -30290, mass: 5.972e24 },
        // Mars
        { x: separation / scaleFactor, y: 0, vx: 0, vy: -10130, mass: 6.417e29 },
        // Add additional bodies as needed
    ];

    // Add 10 more arbitrary bodies with random positions and velocities
    for (let i = 0; i < 500; i++) {
        let distance = (100 + randomNormal() * 15) * 1e9; // Random distance from Sun
        let angle = Math.random() * 2 * Math.PI; // Random angle
        let velocity = Math.sqrt(G * bodies[0].mass / distance); // Approximate circular orbit velocity
        bodies.push({
            x: distance * Math.cos(angle) / scaleFactor,
            y: distance * Math.sin(angle) / scaleFactor,
            vx: -velocity * Math.sin(angle),
            vy: velocity * Math.cos(angle),
            mass: Math.random() * 5e24 + 1e23 // Random mass
        });
    }
    
        // Add 10 more arbitrary bodies with random positions and velocities
    for (let i = 0; i < 500; i++) {
        let distance = (100 + Math.random() * 4) * 1e9; // Random distance from Sun
        let angle = Math.random() * 2 * Math.PI; // Random angle
        let velocity = Math.sqrt(G * bodies[0].mass / distance); // Approximate circular orbit velocity
        bodies.push({
            x: bodies[2].x + distance * Math.cos(angle) / scaleFactor,
            y: bodies[2].y + distance * Math.sin(angle) / scaleFactor,
            vx: -velocity * Math.sin(angle),
            vy: velocity * Math.cos(angle),
            mass: Math.random() * 5e24 + 1e23 // Random mass
        });
    }
}

function updateSeparation() {
    initializeBodies();
    // Optionally reset other aspects of the simulation as needed
}

function updatePositions(dt) {
    // Update velocities, positions, and store acceleration
    for (let i = 0; i < bodies.length; i++) {
        let totalAx = 0;
        let totalAy = 0;

        for (let j = 0; j < bodies.length; j++) {
            if (i !== j) {
                let dx = (bodies[j].x - bodies[i].x) * scaleFactor;
                let dy = (bodies[j].y - bodies[i].y) * scaleFactor;
                let r = Math.sqrt(dx * dx + dy * dy);

                let F = G * bodies[i].mass * bodies[j].mass / (r * r);
                let ax = F * (dx / r) / bodies[i].mass;
                let ay = F * (dy / r) / bodies[i].mass;

                totalAx += ax;
                totalAy += ay;
            }
        }

        bodies[i].vx += totalAx * dt;
        bodies[i].vy += totalAy * dt;
        bodies[i].ax = totalAx; // Store acceleration in x-direction
        bodies[i].ay = totalAy; // Store acceleration in y-direction

        bodies[i].x += bodies[i].vx * dt / scaleFactor;
        bodies[i].y += bodies[i].vy * dt / scaleFactor;
        
        
    }
}

function drawArrow(context, fromx, fromy, tox, toy, arrowWidth, color) {
    var headlen = 10; // length of head in pixels
    var angle = Math.atan2(toy - fromy, tox - fromx);

    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.strokeStyle = color;
    context.lineWidth = arrowWidth;
    context.stroke();

    context.beginPath();
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.strokeStyle = color;
    context.lineWidth = arrowWidth;
    context.stroke();
    context.fillStyle = color;
    context.fill();
}



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let body of bodies) {

        // ctx.shadowBlur = 20;
        // ctx.shadowColor = 'rgba(0, 0, 255, 0.5)'; // Example: blue glow
        
        // Calculate radius based on the logarithm of the mass
        const minRadius = 0.1; // Minimum radius
        const scale = 0.3; // Scale factor to adjust the size visually
        let radius = minRadius + scale * (Math.log10(body.mass) - 20);

    
        ctx.beginPath();
        ctx.arc(body.x + centerX, body.y + centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw acceleration vector
        /*
        const vectorScale = 5e4; // Adjust this scale for a visible vector length
        const endX = body.x + centerX + body.ax * vectorScale;
        const endY = body.y + centerY + body.ay * vectorScale;
        */
        //drawArrow(ctx, body.x + centerX, body.y + centerY, endX, endY, 2, 'red');

    }
    updatePositions(24 * 3600); // Update per day for simplicity
}

canvas.addEventListener('click', function() {
    initializeBodies(); // Reset the simulation when the canvas is clicked
});

initializeBodies(); // Initialize the simulation at start
setInterval(draw, 15);
