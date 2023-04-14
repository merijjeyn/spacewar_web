const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

// an object containing the configuration for the app
const config = {
    DEBUG: false,
    sunLineCount: params.sun_line_count || 4000,
    beta: params.beta === "true" || false,
    showFps: false,

    // constants
    sunDamage: 0.5, // per second
    sunPull: 0.16, // units per second

    shipAcc: 0.01, // unit^2 per second
    shipMaxSpeed: 1, // units per second
    fireRate: 0.8, // per second
    shipTurnSpeed: 2.094, // radians per second

    bulletSpeed: 1.2, // units per second
    bulletDamage: 50,

    riftDmg: 40,

    // internal
    defaultFps: 60,
};

export default config;