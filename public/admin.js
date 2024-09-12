var images = new Map();
var imagesTotal = 0;
var mousedown = false;
var mouseX = 0;
var mouseY = 0;
var startMouseX = 0;
var startMouseY = 0;
var startImgX = 0;
var startImgY = 0;

document.addEventListener("mouseup", (event) => {
	mousedown = false;
});
document.addEventListener("mousemove", (event) => {
	mouseX = event.clientX;
	mouseY = event.clientY;
});

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
	let id = "imageTarget" + imagesTotal;
	let imageHtml = document.createElement("img");
	imagesTotal++;
	imageHtml.setAttribute("src", images.get(UUID));
	imageHtml.setAttribute("draggable", false);
	imageHtml.onload = () => {
		imageHtml.setAttribute("id", id);

		imageHtml.style.display = "block";
		imageHtml.style.position = "absolute";
		imageHtml.style.width = imageHtml.naturalWidth + "px";
		imageHtml.style.height = imageHtml.naturalHeight + "px";

		imageHtml.addEventListener("mousedown", (event) => {
			startImgX = parseInt(document.getElementById(id).style.left);
			if (!startImgX) {
				startImgX = 0;
			}
			startImgY = parseInt(document.getElementById(id).style.top);
			if (!startImgY) {
				startImgY = 0;
			}
			mousedown = true;
			startMouseX = mouseX;
			startMouseY = mouseY;
			handleDragAnimation(id);
		});

		let resizerHtml = document.createElement("div");
		resizerHtml.setAttribute("id", "resizer-" + id);
		resizerHtml.setAttribute("contentEditable", "false");
		resizerHtml.classList.add("resizer");
		resizerHtml.style.left = parseInt(imageHtml.style.width) - 10 + "px";
		resizerHtml.style.top = parseInt(imageHtml.style.height) - 10 + "px";

		resizerHtml.addEventListener("mousedown", (event) => {
			console.log("TESTTEST");
			mousedown = true;
			startMouseX = mouseX;
			startMouseY = mouseY;
			handleResizeAnimation(id);
		});

		document.getElementById("post-content").prepend(resizerHtml);
		document.getElementById("post-content").prepend(imageHtml);
	};
}

function handleResizeAnimation(id) {
	if (mousedown) {
		let diffX = mouseX - startMouseX;
		let diffY = mouseY - startMouseY;
		startMouseX = mouseX;
		startMouseY = mouseY;
		let diffLen = Math.sqrt(Math.pow(diffX, 2), Math.pow(diffY, 2));
		if (diffX < 0 && diffY < 0) {
			diffLen *= -1;
		}
		if (diffLen < 1 && diffLen > -1) {
			requestAnimationFrame(() => handleResizeAnimation(id));
			return;
		}
		const imageHtml = document.getElementById(id);
		const forhold =
			parseInt(imageHtml.style.width) / parseInt(imageHtml.style.height);

		imageHtml.style.width =
			parseInt(imageHtml.style.width) + diffLen * forhold + "px";
		imageHtml.style.height = parseInt(imageHtml.style.height) + diffLen + "px";
		requestAnimationFrame(() => handleResizeAnimation(id));
	} else {
		const imageHtml = document.getElementById(id);
		const resizerHtml = document.getElementById("resizer-" + id);
		resizerHtml.style.left = parseInt(imageHtml.style.width) - 10 + "px";
		resizerHtml.style.top = parseInt(imageHtml.style.height) - 10 + "px";
	}
}

function handleDragAnimation(id) {
	if (mousedown) {
		let diffX = mouseX - startMouseX;
		let diffY = mouseY - startMouseY;
		document.getElementById(id).style.left = startImgX + diffX + "px";
		document.getElementById(id).style.top = startImgY + diffY + "px";
		document.getElementById("resizer-" + id).style.top =
			parseInt(document.getElementById(id).style.height) -
			10 +
			parseInt(document.getElementById(id).style.top) +
			"px";

		document.getElementById("resizer-" + id).style.left =
			parseInt(document.getElementById(id).style.width) -
			10 +
			parseInt(document.getElementById(id).style.left) +
			"px";
		requestAnimationFrame(() => handleDragAnimation(id));
	}
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
