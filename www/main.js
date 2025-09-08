// Pure 3D Sphere Particle System
class SphereParticle {
    constructor(canvas, index, totalParticles) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.index = index;
        
        // Distribute particles evenly on sphere using golden spiral
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
        const y = 1 - (index / (totalParticles - 1)) * 2; // Range from 1 to -1
        const radius = Math.sqrt(1 - y * y);
        const theta = goldenAngle * index;
        
        // Sphere parameters
        this.sphereRadius = 100; // Adjusted for better fit within the container
        this.baseX = radius * Math.cos(theta);
        this.baseY = y;
        this.baseZ = radius * Math.sin(theta);
        
        // Animation - smoother, more elegant
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.speedX = 0.003 + Math.random() * 0.007;
        this.speedY = 0.005 + Math.random() * 0.01;
        this.speedZ = 0.002 + Math.random() * 0.005;
        
        // Visual properties - refined
        this.size = 0.1 + Math.random() * 1.5;
        this.baseOpacity = 1 + Math.random() * 0.3;
        
        // Colors - refined palette for AI agent
        this.colors = [
            '#a6cbdeff' 
        ];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Pulsing effect
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
    }
    
    update() {
        // Continuous rotation for sphere effect
        this.rotationX += this.speedX;
        this.rotationY += this.speedY;
        this.rotationZ += this.speedZ;
        
        // Apply rotations to base position
        let x = this.baseX;
        let y = this.baseY;
        let z = this.baseZ;
        
        // Rotation around Y axis (main sphere rotation)
        let cosY = Math.cos(this.rotationY);
        let sinY = Math.sin(this.rotationY);
        let newX = x * cosY - z * sinY;
        let newZ = x * sinY + z * cosY;
        x = newX;
        z = newZ;
        
        // Rotation around X axis (secondary rotation)
        let cosX = Math.cos(this.rotationX);
        let sinX = Math.sin(this.rotationX);
        let newY = y * cosX - z * sinX;
        newZ = y * sinX + z * cosX;
        y = newY;
        z = newZ;
        
        // Scale to sphere radius (relative to container size)
        const containerSize = Math.min(this.canvas.displayWidth || this.canvas.width, this.canvas.displayHeight || this.canvas.height);
        const relativeRadius = this.sphereRadius * (containerSize / 350); // Scale based on container size
        this.x = x * relativeRadius;
        this.y = y * relativeRadius;
        this.z = z * relativeRadius;
        
        // Project 3D to 2D with proper centering - use display dimensions
        const centerX = (this.canvas.displayWidth || this.canvas.width) / 2;
        const centerY = (this.canvas.displayHeight || this.canvas.height) / 2;
        const perspective = 400;
        const distance = perspective + this.z;
        
        this.projectedX = centerX + (this.x * perspective) / distance;
        this.projectedY = centerY + (this.y * perspective) / distance;
        
        // Calculate depth-based scaling and opacity
        this.scale = perspective / distance;
        this.projectedSize = this.size * this.scale;
        
        // Pulsing opacity effect
        this.pulsePhase += this.pulseSpeed;
        const pulseMultiplier = 0.7 + 0.3 * Math.sin(this.pulsePhase);
        this.projectedOpacity = this.baseOpacity * this.scale * pulseMultiplier;
    }
    
    draw() {
        if (this.projectedOpacity <= 0.1) return; // Don't draw nearly invisible particles
        
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0.15, this.projectedOpacity);
        
        // Refined glow effect
        this.ctx.shadowBlur = 6 * this.scale;
        this.ctx.shadowColor = this.color;
        this.ctx.fillStyle = this.color;
        
        // Draw main particle
        this.ctx.beginPath();
        this.ctx.arc(this.projectedX, this.projectedY, Math.max(0.8, this.projectedSize), 0, Math.PI * 2);
        this.ctx.fill();
        
        // Subtle inner core
        this.ctx.globalAlpha = Math.max(0.08, this.projectedOpacity * 0.6);
        this.ctx.shadowBlur = 5 * this.scale;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(this.projectedX, this.projectedY, Math.max(0.3, this.projectedSize * 0.4), 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}

// Initialize 3D Sphere System
function initPerfectSphere() {
    // Remove default particles.js
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;
    
    // Clear any existing content
    particlesContainer.innerHTML = '';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create particles - optimized count for performance
    const particleCount = 150; // Balanced for beauty and performance
    const particles = [];
    
    // Set canvas size to match container with proper scaling
    function resizeCanvas() {
        const rect = particlesContainer.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set actual size
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // Scale back down using CSS
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        // Scale the drawing context so everything draws at the higher resolution
        ctx.scale(dpr, dpr);
        
        // Update canvas dimensions for particles
        canvas.displayWidth = rect.width;
        canvas.displayHeight = rect.height;
    }
    
    resizeCanvas();
    
    // Improved resize handler with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
        }, 100);
    });
    
    // Append canvas to container
    particlesContainer.appendChild(canvas);
    
    // Initialize particles after canvas is ready
    for (let i = 0; i < particleCount; i++) {
        particles.push(new SphereParticle(canvas, i, particleCount));
    }
    
    // Animation loop with enhanced smoothness and visibility handling
    let animationId;
    let isVisible = true;
    
    function animate() {
        if (!isVisible) return; // Pause animation when tab is not visible
        
        // Use display dimensions for consistent clearing
        const width = canvas.displayWidth || canvas.width;
        const height = canvas.displayHeight || canvas.height;
        
        // Clear canvas with subtle trail for elegance
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
        
        // Update and draw all particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connection lines between nearby particles
        drawConnections(particles, ctx);
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Handle visibility changes to optimize performance
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible && !animationId) {
            animate(); // Resume animation when tab becomes visible
        } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    // Start animation
    animate();
}

// Draw elegant connections between nearby particles
function drawConnections(particles, ctx) {
    const maxDistance = 60; // Slightly closer connections for cleaner look
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].projectedX - particles[j].projectedX;
            const dy = particles[i].projectedY - particles[j].projectedY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * 0.1; // More subtle connections
                const avgScale = (particles[i].scale + particles[j].scale) / 2;
                
                ctx.save();
                ctx.globalAlpha = opacity * avgScale;
                ctx.strokeStyle = '#799abfff'; // Professional blue for connections
                ctx.lineWidth = 0.2; // Thinner, more elegant lines
                ctx.beginPath();
                ctx.moveTo(particles[i].projectedX, particles[i].projectedY);
                ctx.lineTo(particles[j].projectedX, particles[j].projectedY);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initPerfectSphere, 1000);
});

// jQuery textillate animation
$(document).ready(function () {
    
    $('.text').textillate({
        loop: true,
        sync: true,
        in:{
            effect: "bounceIn",
        },
        out:{
            effect: "bounceOut",
        },
    });
});


