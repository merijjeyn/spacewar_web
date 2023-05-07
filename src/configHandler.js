import config from "./config.js";

function formHandler() {
    config.shipAcc = document.getElementById("acc-slider").value;
    config.shipMaxSpeed = document.getElementById("maxspeed-slider").value;
    config.shipTurnSpeed = document.getElementById("turnspeed-slider").value;
    config.fireRate = document.getElementById("rate-slider").value;
    config.bulletSpeed = document.getElementById("bullspeed-slider").value;
    config.bulletDamage = document.getElementById("bulldmg-slider").value;
    config.riftDmg = document.getElementById("riftdmg-slider").value;
    config.sunPull = document.getElementById("pull-slider").value;
    config.sunDamage = document.getElementById("sundmg-slider").value;
    config.DEBUG = document.getElementById("debug-switch").checked;
    config.showFps = document.getElementById("fps-switch").checked;
    config.beta = document.getElementById("beta-switch").checked;
};

function resetForm(event) {
    event.preventDefault();
    document.getElementById("constant-form-element").reset();
    document.getElementById("debug-switch").checked = false;
    document.getElementById("fps-switch").checked = false;
    document.getElementById("beta-switch").checked = false;
    formHandler();
    addSliderValues();
};

function showForm() {
    document.getElementById("constants-form").style.display = "block";
    document.getElementById("start-button").textContent = "X";
}

function hideForm() {
    document.getElementById("constants-form").style.display = "none";
    document.getElementById("start-button").textContent = "Config";
}

function toggleForm() {
    var x = document.getElementById("constants-form");
    if (x.style.display === "none") {
        showForm();
    } else {
        hideForm();
    }
}

function addEventListeners() {
    document.getElementById("reset-button").addEventListener('click', resetForm);
    document.getElementById("start-button").addEventListener('click', toggleForm);
    document.getElementById("beta-switch").addEventListener('change', formHandler);
    document.getElementById("fps-switch").addEventListener('change', formHandler);
    document.getElementById("debug-switch").addEventListener('change', formHandler);
    document.getElementById("constant-form-element").addEventListener('change', formHandler);	
}

function addSliderValues() {
    var sliders = document.getElementsByClassName("slider");
    
    for (var i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        let output = document.getElementById(slider.id + "-value");
        output.innerHTML = slider.value;
    
        slider.oninput = function() {
            output.innerHTML = slider.value;
        }
    }
}

addEventListeners();
addSliderValues();
	
