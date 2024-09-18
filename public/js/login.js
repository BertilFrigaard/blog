document.getElementById("post-submit").addEventListener("click", async () => {
    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    if (usernameField.value == "" || passwordField.value == "") {
        setErrorText("Credentials required");
        return;
    }
    var jsonObj = {
        username: usernameField.value,
        password: passwordField.value
    }
    var request = new XMLHttpRequest();
    request.open("POST", "/authenticate");
	request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(jsonObj));
    request.onload = () => {
        if (request.status == 200) {
            window.location.replace("/admin");
        } else {
            setErrorText("Incorrect credentials")
        }
    };
});

function setErrorText(text) {
    var errorText = document.getElementById("error-text");
    errorText.innerText = text;
}
