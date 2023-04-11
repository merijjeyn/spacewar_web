const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

// an object containing the configuration for the app
const config = {
    DEBUG: false,
    sunLineCount: params.sun_line_count || 3000,
};

export default config;