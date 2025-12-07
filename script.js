// simple form validation

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", (event) => {
        const username = document.querySelector("input[type='text']").value.trim();
        const password = document.querySelector("input[type='password']").value.trim();

        if (username === "" || password === ""){
            alert("Please fill in both fields.");
            event.preventDefault();
        } else {
            alert("Form submitted successfully!");
        }
    });
});