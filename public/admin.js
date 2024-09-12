var images = new Map();

document.getElementById("post-content").addEventListener("paste", (event) => {
	const items = event.clipboardData.items;
	for (let i = 0; i < items.length; i++) {
		if (items[i].type == "image/png") {
			event.preventDefault(true);
			var imageFile = items[i].getAsFile();

			hashImage(imageFile).then((UUID) => {
				if (!images.has(UUID)) {
					const reader = new FileReader();

					reader.onload = (event) => {
						const base64image = event.target.result;
						images.set(UUID, base64image);
						createImage(UUID);
					};

					reader.readAsDataURL(imageFile);
				} else {
					createImage(UUID);
				}
			});
		}
	}
});

function createImage(UUID) {
	console.log(UUID);

	var imageHtml = document.createElement("img");
	imageHtml.setAttribute("src", images.get(UUID));
	document.getElementById("post-content").appendChild(imageHtml);
}

document.getElementById("post-submit").addEventListener("click", () => {
	let jsonObj = {
		title: document.getElementById("post-title").innerHTML,
		content: document.getElementById("post-content").innerHTML,
	};

	var request = new XMLHttpRequest();
	request.open("POST", "/newPost");
	request.setRequestHeader("Content-Type", "application/json");
	request.send(JSON.stringify(jsonObj));
});

async function hashImage(imageFile) {
	const arrayBuffer = await imageFile.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
}
