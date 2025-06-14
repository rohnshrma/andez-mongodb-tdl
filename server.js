// Import the Express framework for building the web server
import express from "express";

// Import body-parser middleware to parse incoming request bodies (e.g., form data)
import bodyParser from "body-parser";

// Import Mongoose for MongoDB object modeling (though not used in this code snippet)
import mongoose from "mongoose";

// Define the port number where the server will listen
const PORT = 3000;

// Initialize an Express application
const app = express();

// Middleware: Serve static files (e.g., CSS, images) from the "public" directory
app.use(express.static("public"));

// Middleware: Parse URL-encoded data (form submissions) with extended option for complex objects
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS for rendering dynamic templates
app.set("view engine", "ejs");

// Define a route for the root URL ("/") with HTTP GET method
app.route("/")
  .get((req, res) => {
    // Render the "Home.ejs" template when a GET request is made to "/"
    res.render("Home.ejs");
  });

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message to the console when the server starts successfully
  console.log("Server started on port", PORT);
});