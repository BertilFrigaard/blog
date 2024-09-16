require("dotenv").config();

const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const bCrypt = require("bcrypt");
const session = require("express-session");

const postFolder = "posts";
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true
}))

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.get("/admin", isSignedIn, (req, res) => {
	res.render("admin.ejs");
});

app.get("/admin", (req, res) => {
	res.render("login.ejs");
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

app.post("/newPost", isSignedIn, (req, res) => {
	const date = new Date();
	const dateString =
		date.getDate() + " / " + (date.getMonth() + 1) + " - " + date.getFullYear();
	createNewPost(req.body.title, req.body.content, req.body.images, dateString);
});

app.post("/newPost", (req, res) => {
	res.redirect("/");
})

app.post("/newImage", isSignedIn, (req, res) => {
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

app.post("/newImage", (req, res) => {
	res.redirect("/");
})

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

//Session and login
function isSignedIn(req, res, next) {
	if (req.session.access) next();
	else next('route');
}

app.post("/authenticate", async (req, res) => {
	const username = req.body.username.toLowerCase();
	if (username == process.env.ACC_USERNAME) {
		if (bCrypt.compareSync(req.body.password, process.env.PASSWORDHASH)) {
			req.session.regenerate((err) => {
				if(err) {
					res.sendStatus(500);
					console.error(err);
					return;
				}

				req.session.access = true;

				req.session.save((err) => {
					if(err) {
						res.sendStatus(500);
						console.error(err);
						return;
					} else {
						res.sendStatus(200);
						return;
					}
				})
				
			})
		} else {
			res.sendStatus(401);
		}
	} else {
		res.sendStatus(401);
	}
})