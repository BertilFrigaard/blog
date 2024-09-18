document.getElementById("post-submit").addEventListener("click", async () => {
    const usernameFieldOld = document.getElementById("username-old");
    const passwordFieldOld = document.getElementById("password-old");
    const usernameFieldNew = document.getElementById("username-new");
    const passwordFieldNew = document.getElementById("password-new");
    if (usernameFieldOld.value == "" || passwordFieldOld.value == "") {
        setErrorText("old", "Credentials required");
        return;
    }
    
    if (usernameFieldNew.value == "" || passwordFieldNew.value == "") {
        setErrorText("new", "Credentials required");
        return;
    }
    var jsonObj = {
        oldUsername: usernameFieldOld.value,
        oldPassword: passwordFieldOld.value,
        newUsername: usernameFieldNew.value,
        newPassword: passwordFieldNew.value
    }

    var request = new XMLHttpRequest();
    request.open("POST", "/changeCredentials");
	request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(jsonObj));
    request.onload = () => {
        if (request.status == 200) {
            window.location.replace("/admin");
        } else {
            setErrorText("old", "Incorrect credentials")
        }
    };
});

function setErrorText(suffix, text) {
    var errorText = document.getElementById("error-text-" + suffix);
    errorText.innerText = text;
}
