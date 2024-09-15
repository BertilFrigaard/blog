const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const postFolder = "posts";
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "50mb" }));

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.get("/admin", (req, res) => {
	res.render("admin.ejs");
});

app.get("/getImage", (req, res) => {
	if (!req.query.hasOwnProperty("uuid")) {
		res.sendStatus(400);
	}
	let UUID = req.query.uuid;
	fs.readFile("images/" + UUID + ".txt", "utf-8", (err, data) => {
		if (!err) {
			const json = {
				UUID: UUID,
				src: data,
			};
			res.send(json);
		} else {
			console.error(err);
			res.sendStatus(404);
		}
	});
});

app.get("/getPost", (req, res) => {
	let index = 0;
	if (req.query.hasOwnProperty("index")) {
		index = parseInt(req.query.index);
	}
	if (index < 0) {
		index = 0;
	}

	let blogFiles = fs.readdirSync(postFolder);

	let fileNumber = blogFiles.length - index;

	if (fileNumber < 1) {
		res.sendStatus(204);
		return;
	}

	fs.readFile("posts/" + fileNumber + ".json", "utf-8", (err, data) => {
		if (!err) {
			const json = JSON.parse(data);
			res.send(json);
		} else {
			res.sendStatus(400);
		}
	});
});

app.post("/newPost", (req, res) => {
	const date = new Date();
	const dateString =
		date.getDate() + " / " + (date.getMonth() + 1) + " - " + date.getFullYear();
	createNewPost(req.body.title, req.body.content, req.body.images, dateString);
});

app.post("/newImage", (req, res) => {
	let imageFiles = fs.readdirSync("images");
	imageFiles.forEach((fileName) => {
		if (fileName == req.body.UUID) {
			return;
		}
	});
	fs.writeFile("images/" + req.body.UUID + ".txt", req.body.src, (err) => {
		if (err) {
			console.error(err);
		}
	});
});

app.listen(3000, () => {
	console.log("Now listening on port 3000");
});

function createNewPost(title, content, imagesT, date) {
	let blogFiles = fs.readdirSync(postFolder);
	const newFileName = blogFiles.length + 1 + ".json";
	const json = { title: title, content: content, date: date, images: imagesT };
	fs.writeFile("posts/" + newFileName, JSON.stringify(json), (err) => {
		if (err) {
			console.error(err);
		}
	});
}
