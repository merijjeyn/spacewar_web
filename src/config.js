const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

// an object containing the configuration for the app
const config = {
    DEBUG: false,
    sunLineCount: params.sun_line_count || 4000,
    beta: params.beta === "true" || false,

    // constants
    sunDamage: 0.5, // per second
    sunPull: 0.16, // units per second

    // internal
    defaultFps: 60,
};

export default config;