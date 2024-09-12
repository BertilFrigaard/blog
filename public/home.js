var index = 0;

document
	.getElementById("post-load-button")
	.addEventListener("click", async () => {
		const response = await fetch("/getPost?index=" + index);

		switch (response.status) {
			case 200:
				const json1 = await response.json();
				index++;
				addPost(json1);
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

function addPost(postJson) {
	postSection = document.getElementById("post-container");

	newPost = document.createElement("section");
	newPost.classList.add("post");

	title = document.createElement("h2");
	title.innerHTML = postJson.title;
	newPost.appendChild(title);

	contentArr = postJson.content.split("\n");
	console.log(contentArr);
	contentArr.forEach((element) => {
		if (element != "\r") {
			let txt = document.createElement("p");
			txt.innerHTML = element;
			newPost.appendChild(txt);
		} else {
			let space = document.createElement("div");
			space.classList.add("emptyParagraph");
			newPost.appendChild(space);
		}
	});

	date = document.createElement("h3");
	date.innerHTML = postJson.date;
	newPost.appendChild(date);

	postSection.appendChild(newPost);
}
