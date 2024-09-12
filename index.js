const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const postFolder = "posts";
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.get("/admin", (req, res) => {
	res.render("admin.ejs");
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
	const images = req.body.images;
	console.log(images);

	const date = new Date();
	const dateString =
		date.getDate() + " / " + (date.getMonth() + 1) + " - " + date.getFullYear();
	createNewPost(req.body.title, req.body.content, dateString);
	res.redirect("/");
});

app.listen(3000, () => {
	console.log("Now listening on port 3000");
});

function createNewPost(title, content, date) {
	let blogFiles = fs.readdirSync(postFolder);
	const newFileName = blogFiles.length + 1 + ".json";
	const json = { title: title, content: content, date: date };
	fs.writeFile("posts/" + newFileName, JSON.stringify(json), (err) => {
		if (err) {
			console.error(err);
		}
	});
}
