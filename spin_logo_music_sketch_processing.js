import processing.sound.*;

AudioIn in;
Amplitude amp;
PImage logo;
ArrayList<Particle> particles = new ArrayList<Particle>();

int hueIndex = 0;  // Index to track hue color
int hueChangeInterval = 20;  // Change hue every second (assuming 60 FPS)

boolean isSpinning = false;  // Track if the logo is currently spinning
float rotationAngle = 0;     // Current rotation angle of the logo
int spinDirection = 1;       // Spin direction, 1 for clockwise, -1 for counterclockwise
int spinStartTime = 0;       // Start time for the current spin
int spinDuration = 500;      // Duration of each spin in milliseconds
float peakThreshold = 0.25;   // Amplitude level considered as peak

void setup() {
  size(800, 800, P2D);  // Use P2D renderer for better transparency and performance
  colorMode(HSB, 360, 100, 100);  // Use HSB color mode for easy hue control
  
  // Load your logo
  logo = loadImage("ncz.png"); // Replace with your logo file path

  // Setup audio input
  in = new AudioIn(this, 0);  // Default line-in or mic
  in.start();

  // Measure the amplitude
  amp = new Amplitude(this);
  amp.input(in);
}

void draw() {
  // Set chroma key background color (bright green)
  background(120, 100, 100);  // Bright green background in HSB

  // Update hue index every interval to cycle through rainbow colors
  if (frameCount % hueChangeInterval == 0) {
    hueIndex = (hueIndex + 1) % 15;  // Cycle through 15 hues
  }
  
  // Calculate the current hue based on hueIndex, skipping hues near green
  float currentHue = map(hueIndex, 0, 14, 0, 360);
  if (currentHue > 100 && currentHue < 140) { // Avoid hues around green (100 to 140 in HSB)
    currentHue = (currentHue + 40) % 360;     // Shift hue out of green range
  }

  // Get amplitude level and map to size for a dramatic bounce
  float level = amp.analyze();
  float scale = map(level, 0, 0.5, 100, 600);  // Increased scaling effect

  // Check if the audio is at a peak level and start spin if not already spinning
  if (level > peakThreshold && !isSpinning) {
    startSpin();
  }
  
  // Handle the logo spin
  if (isSpinning) {
    updateSpin();
  }
  
  // Display the logo with rotation and scaling
  pushMatrix();
  translate(width / 2, height / 2);  // Move to center
  rotate(radians(rotationAngle));    // Apply rotation
  imageMode(CENTER);
  image(logo, 0, 0, scale, scale);   // Draw logo with scaling
  popMatrix();
  
  // Add new particles based on audio level with current hue color
  int numParticles = int(map(level, 0, 0.5, 0, 10)); // More particles on higher amplitude
  for (int i = 0; i < numParticles; i++) {
    particles.add(new Particle(width / 2, height / 2, currentHue));
  }
  
  // Update and display particles
  for (int i = particles.size() - 1; i >= 0; i--) {
    Particle p = particles.get(i);
    p.update();
    p.display();
    if (p.isFinished()) {
      particles.remove(i); // Remove particles that have faded out
    }
  }
}

// Start the logo spin with a random direction
void startSpin() {
  isSpinning = true;
  spinStartTime = millis();
  rotationAngle = 0;  // Reset rotation
  spinDirection = random(1) > 0.5 ? 1 : -1;  // Randomly choose clockwise or counterclockwise
}

// Update the logo spin, and stop it after spinDuration
void updateSpin() {
  int elapsedTime = millis() - spinStartTime;
  float spinProgress = map(elapsedTime, 0, spinDuration, 0, 360);  // Map time to 360 degrees

  rotationAngle = spinProgress * spinDirection;  // Apply spin direction

  // Stop spinning once the spin duration is complete
  if (elapsedTime >= spinDuration) {
    isSpinning = false;
    rotationAngle = 0;  // Reset angle after spin
  }
}

// Particle class for visual effect with color cycling
class Particle {
  PVector position;
  PVector velocity;
  float lifespan;
  float hue;  // Hue color for this particle

  Particle(float x, float y, float hue) {
    position = new PVector(x, y);
    velocity = PVector.random2D().mult(random(2, 5));
    lifespan = 255;  // Particle life duration
    this.hue = hue;  // Set hue based on current hueIndex color
  }

  void update() {
    position.add(velocity);
    lifespan -= 4;  // Gradually fade out the particle
  }

  void display() {
    noStroke();
    fill(hue, 100, 100, lifespan / 255 * 100);  // Apply HSB color with fading alpha
    ellipse(position.x, position.y, 8, 8);  // Small circular particles
  }

  boolean isFinished() {
    return lifespan < 0;  // Particle is done when fully faded out
  }
}
