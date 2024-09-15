var imageMap = new Map();
var index = 0;

document
	.getElementById("post-load-button")
	.addEventListener("click", async () => {
		const response = await fetch("/getPost?index=" + index);

		switch (response.status) {
			case 200:
				const json1 = await response.json();
				index++;
				await downloadImages(json1);
				break;
			case 204:
				document.getElementById("post-load-button").style.display = "none";
				break;
			default:
				document.getElementById("post-load-button").style.color = "red";
				console.error("Something went wrong trying to fetch more posts");
				break;
		}
	});

async function downloadImages(postJson) {
	if (postJson.images.length <= 0) {
		addPost(postJson);
		return;
	}
	const downloadPromises = postJson.images.map(async (image) => {
		if (imageMap.has(image.UUID)) {
			return;
		}
		imageMap.set(image.UUID, "loading");
		const response = await fetch("/getImage?uuid=" + image.UUID);

		if (response.ok) {
			let responseJson = await response.json();
			imageMap.set(responseJson.UUID, responseJson.src);
			console.log("image downloaded");
		} else {
			console.error("Something went wrong trying to fetch images");
		}
	});
	await Promise.all(downloadPromises);
	addPost(postJson);
}

function addPost(postJson) {
	console.log("making post");
	postSection = document.getElementById("post-container");

	newPost = document.createElement("section");
	newPost.classList.add("post");

	title = document.createElement("h2");
	title.innerHTML = postJson.title;
	newPost.appendChild(title);

	newPostContent = document.createElement("div");
	newPostContent.classList.add("post-content");

	contentArr = postJson.content.split("\n");
	let last = false;
	contentArr.forEach((element) => {
		console.log(element);
		if (element != "\r" && element != "") {
			last = false;
			let txt = document.createElement("p");
			txt.innerHTML = element;
			newPostContent.appendChild(txt);
		} else {
			if (last) {
				last = false;
				return;
			}
			last = true;
			let space = document.createElement("div");
			space.classList.add("emptyParagraph");
			newPostContent.appendChild(space);
		}
	});

	newPost.appendChild(newPostContent);

	date = document.createElement("h3");
	date.innerHTML = postJson.date;
	newPost.appendChild(date);

	postSection.appendChild(newPost);

	if (postJson.images.length > 0) {
		postJson.images.forEach((image) => {
			createImage(
				newPostContent,
				image.UUID,
				image.left,
				image.top,
				image.width
			);
		});
	}
}

function createImage(postContainer, UUID, left, top, width) {
	console.log("creating image");
	console.log(width);
	let image = document.createElement("img");
	image.setAttribute("src", imageMap.get(UUID));
	image.style.position = "absolute";
	image.style.display = "block";
	image.style.left = left;
	image.style.top = top;
	image.style.width = width;
	postContainer.prepend(image);
}
