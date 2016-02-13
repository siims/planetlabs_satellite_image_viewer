
requirejs.config({
    baseUrl: "scripts/lib",
    paths: {
        app: "../app",
        jquery: "jquery-2.1.4",
        planet: "planet"
    }
});

requirejs(["app/main"]);
