#version 330 core

uniform float firstPass;
uniform sampler2D prevPos;
uniform sampler2D prevVel;
uniform int numParticles;

// output from quad.vert
in vec2 uv;

// TODO [Task 15] setup the output locations
layout(location = 0) out vec4 pos;
layout(location = 1) out vec4 vel;

const float PI = 3.14159;
const float dt = 0.00167; // 1 sec/60 fps

/*
    A particle has the following properties:
        - pos.xyz = clip space position
        - pos.w = lifetime in seconds (doesn't change)
        - vel.xyz = clip space velocity
        - vel.w = current age in seconds
*/

// A helpful procedural "random" number generator
float hash(float n) { return fract(sin(n)*753.5453123); }

// Helper functions to procedurally generate lifetimes and initial velocities
// based on particle index
float calculateLifetime(int index) {
    const float MAX_LIFETIME = 5.0;
    const float MIN_LIFETIME = 0.5;
    return MIN_LIFETIME + (MAX_LIFETIME - MIN_LIFETIME) * hash(index * 2349.2693);
}

vec2 calculateInitialVelocity(int index) {
    float theta = PI * hash(index * 872.0238);
    const float MAX_VEL = 0.3;
    float velMag = MAX_VEL * hash(index * 98723.345);
    return velMag * vec2(cos(theta), sin(theta));
//    const float MAX_VEL = 0.3;
//    return MAX_VEL * hash(index * 98723.345);
}

vec4 initPosition(int index) {
    const vec3 spawn = vec3(uv.x,0.0,0.0);

    return vec4(spawn, calculateLifetime(index));
}

vec4 initVelocity(int index) {
    return vec4(calculateInitialVelocity(index), 0, 0);
}

vec4 updatePosition(int index) {
    // TODO [Task 16]
    // - sample prevPos and prevVel at uv
    // - xyz: pos + vel * dt
    vec4 pos1;
    pos1.x = texture(prevPos,uv).x + (texture(prevVel,uv).x * dt);
    pos1.y = texture(prevPos,uv).y + (texture(prevVel,uv).y * dt);
    pos1.z = texture(prevPos,uv).z + (texture(prevVel,uv).z * dt);
    // - w component is lifetime, so keep it from the previous position
    pos1.w = texture(prevPos,uv).w;
    return pos1;
//    return vec4(0,0,0,1);
}

vec4 updateVelocity(int index) {
    const float G = -0.1;
    // TODO [Task 16]
    // - sample prevVel at uv
    // - only force is gravity in y direction.  Add G * dt.
    vec4 vel1;
    vel1.x = texture(prevVel, uv).x;
    vel1.y = texture(prevVel, uv).y + (-dt);
    vel1.z = texture(prevVel, uv).z;
    // - w component is age, so add dt
    vel1.w = texture(prevVel, uv).w + dt;
    return vel1;
//    return vec4(0);
}

void main() {
    int index = int(uv.x * numParticles);
    if (firstPass > 0.5) {
        pos = initPosition(index);
        vel = initVelocity(index);
    } else {
        pos = updatePosition(index);
        vel = updateVelocity(index);

        if (pos.w < vel.w) {
            pos = initPosition(index);
            vel = initVelocity(index);
        }
    }
}
