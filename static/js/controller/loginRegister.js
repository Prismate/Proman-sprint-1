loginForm = document.querySelector("#loginForm")
errors = document.querySelector("#errors")
errorsRegister = document.querySelector("#errorsRegister")
statusRegister = document.querySelector("#registerStatus")
loginModal = document.querySelector("#loginModal")
registerModal = document.querySelector("#registerModal")
loginButton = document.querySelector("#loginButton")
logoutButton = document.querySelector("#logoutButton")
registerButton = document.querySelector("#registerButton")
registerForm = document.querySelector("#registerForm")

document.querySelector('#loginForm').addEventListener("submit", event => {
    event.preventDefault()

    const formData = new FormData(event.target)

    const request = new Request("/api/v1/login", {method: "POST", body: formData})

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                /*zamknąć modal, toast - poinformować użytkownika, że jest zalogowany,
usunąć guzik login i register, a wyświetlić jesteś zalogowany jako, guziczek logout
plus wyświetlanie wszystkich bordów włącznie z prywatnymi - Navs & tabs -bootstrap

*/
                console.log('zalogowano')
                loginButton.style.display = "none";
                registerButton.style.display = "none";
                logoutButton.style.display = "block"; // Pokaż przycisk wylogowania po zalogowaniu
            } else if (response.status === 404 || response.status === 401) {
                console.log("znanny błąd")
            } else {
                console.log("nieznany inny bład")
            }

            response.json()
                .then(data => {
                    errors.textContent = data
                    errors.style.display = "block"
                })
        })
        .catch(reason => {
            console.log(reason)
        })

})


logoutButton.addEventListener("click", event => {
    fetch("/api/v1/logout", {
        method: "POST",
    })
    .then(response => {
        if (response.status === 200) {
            console.log("Wylogowano"); // Możesz dodać odpowiednią obsługę na podstawie odpowiedzi serwera
            loginButton.style.display = "block";
            registerButton.style.display = "block";
            logoutButton.style.display = "none"; // Ukryj przycisk wylogowania po wylogowaniu
        } else {
            console.log("Błąd wylogowywania");
        }
    })
    .catch(error => {
        console.error("Błąd podczas wylogowywania:", error);
    });
});


document.querySelector('#registerForm').addEventListener("submit", event => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const request = new Request("/api/v1/register", {method: "POST", body: formData})

    fetch(request)
        .then(response => {
            if (response.status === 200) {

            } else if (response.status === 404 || response.status === 401) {
                console.log("znany blad")/*błędy wszystkie*/
            } else {
                console.log("nieznany blad")
            }

            response.json()
                .then(data => {
                    errorsRegister.textContent = data
                    if (response.status != 200) {
                        errorsRegister.style.display = "block"
                    }
                })
        })
        .catch(reason => {
            console.log(reason)
        })

})

document.addEventListener("DOMContentLoaded", function() {
    const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
    const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));

    // Pokaż modale automatycznie
    setTimeout(function() {
        loginModal.hide();
        registerModal.hide();
    }, 3000); // Ukryj modale po 3 sekundach (możesz dostosować czas do swoich potrzeb)
});
