var images = new Map();
var imagesOnPage = new Map();
var imagesTotal = 0;
var mousedown = false;
var mouseX = 0;
var mouseY = 0;
var startMouseX = 0;
var startMouseY = 0;
var startImgX = 0;
var startImgY = 0;
var startImgWidth = 0;

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
	imagesOnPage.set(id, UUID);
	imageHtml.setAttribute("src", images.get(UUID));
	imageHtml.setAttribute("draggable", false);
	imageHtml.onload = () => {
		imageHtml.setAttribute("id", id);

		imageHtml.style.display = "block";
		imageHtml.style.position = "absolute";
		imageHtml.naturalWidth < 300
			? (imageHtml.style.width = imageHtml.naturalWidth + "px")
			: (imageHtml.style.width = "300px");

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

		resizerHtml.addEventListener("mousedown", (event) => {
			mousedown = true;
			startMouseX = mouseX;
			startImgWidth = parseInt(imageHtml.style.width);
			handleResizeAnimation(id);
		});

		document.getElementById("post-content").prepend(resizerHtml);
		document.getElementById("post-content").prepend(imageHtml);
	};
}

function handleResizeAnimation(id) {
	if (mousedown) {
		let diffX = mouseX - startMouseX;
		if (diffX == 0) {
			requestAnimationFrame(() => handleResizeAnimation(id));
			return;
		}
		const imageHtml = document.getElementById(id);

		imageHtml.style.width = startImgWidth + diffX + "px";
		requestAnimationFrame(() => handleResizeAnimation(id));
	} else {
		const imageHtml = document.getElementById(id);
		const resizerHtml = document.getElementById("resizer-" + id);

		let imgLeft = parseInt(imageHtml.style.left);
		if (!imgLeft) {
			imgLeft = 0;
		}
		resizerHtml.style.left =
			parseInt(imageHtml.style.width) - 10 + imgLeft + "px";
	}
}

function handleDragAnimation(id) {
	if (mousedown) {
		let diffX = mouseX - startMouseX;
		let diffY = mouseY - startMouseY;
		document.getElementById(id).style.left = startImgX + diffX + "px";
		document.getElementById(id).style.top = startImgY + diffY + "px";
		document.getElementById("resizer-" + id).style.top =
			parseInt(document.getElementById(id).style.top) + "px";

		document.getElementById("resizer-" + id).style.left =
			parseInt(document.getElementById(id).style.width) -
			10 +
			parseInt(document.getElementById(id).style.left) +
			"px";
		requestAnimationFrame(() => handleDragAnimation(id));
	}
}

function postImages() {
	images.forEach((value, key) => {
		let jsonObj = {
			UUID: key,
			src: value,
		};
		var request = new XMLHttpRequest();
		request.open("POST", "/newImage");
		request.setRequestHeader("Content-Type", "application/json");
		request.send(JSON.stringify(jsonObj));
	});
}

document.getElementById("post-submit").addEventListener("click", () => {
	postImages();
	let imagesToSend = [];
	imagesOnPage.forEach((value, key) => {
		let curElement = document.getElementById(key);
		let styleLeft = curElement.style.left;
		let styleTop = curElement.style.top;
		if (!styleLeft) {
			styleLeft = "0px";
		}
		if (!styleTop) {
			styleTop = "0px";
		}
		let curImageJson = {
			UUID: value,
			left: styleLeft,
			top: styleTop,
			width: curElement.style.width,
		};
		imagesToSend.push(curImageJson);
	});

	let jsonObj = {
		title: document.getElementById("post-title").innerText,
		content: document.getElementById("post-content").innerText,
		images: imagesToSend,
	};

	var request = new XMLHttpRequest();
	request.open("POST", "/newPost");
	request.setRequestHeader("Content-Type", "application/json");
	request.send(JSON.stringify(jsonObj));
	window.location.reload();
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
