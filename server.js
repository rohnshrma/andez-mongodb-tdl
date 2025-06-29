// Import the Express framework for building the web server
import express from "express";

// Import body-parser middleware to parse incoming request bodies (e.g., form data)
import bodyParser from "body-parser";

// Import Mongoose for MongoDB object modeling
import mongoose from "mongoose";

// Define the port number where the server will listen
const PORT = 3000;

// Initialize an Express application
const app = express();

// Connect to the local MongoDB database named 'andez_tdlDB' on port 27017
mongoose.connect("mongodb://localhost:27017/andez_tdlDB", {
  useNewUrlParser: true, // Uses new MongoDB connection string parser
  useUnifiedTopology: true, // Uses new server discovery and monitoring engine
});

// Define the Task schema for the 'tasks' collection
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String, // Task title as String
      minLength: [3, "Title must be at least 3 characters long"], // Minimum length of 3
      required: [true, "Title is required"], // Mandatory field
      trim: true, // Removes whitespace
    },
    status: {
      type: String, // Task status as String
      enum: {
        values: ["pending", "completed"], // Restricts to 'pending' or 'completed'
        message: "{VALUE} is not a valid status", // Error for invalid status
      },
      default: "pending", // Default status is 'pending'
    },
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
  }
);

// Create the Task model, mapping to the 'tasks' collection
const Task = mongoose.model("Task", taskSchema);

// Middleware: Serve static files from the 'public' directory
app.use(express.static("public")); // Serves files like style.css

// Middleware: Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true })); // Parses form submissions

// Set EJS as the view engine for rendering templates
app.set("view engine", "ejs");

// Define routes for the root URL ("/") for GET and POST
app
  .route("/")
  .get(async (req, res) => {
    // Handles GET requests to display tasks
    try {
      const tasks = await Task.find({}); // Fetches all tasks from MongoDB
      if (!tasks) {
        // Checks if tasks is falsy (redundant, as find returns an array)
        return; // Exits if no tasks (could be removed)
      }
      res.render("Home", { data: tasks.length > 0 ? tasks : "No tasks" }); // Renders Home.ejs with tasks or "No tasks" string
    } catch (err) {
      // Handles database query errors
      res.status(400).send("Failed to load tasks"); // Sends 400 error
    }
  })
  .post(async (req, res) => {
    // Handles POST requests to add tasks
    try {
      const { title_input, status_input } = req.body; // Extracts form data
      const newTask = new Task({
        title: title_input, // Maps form title to schema
        status: status_input, // Maps form status to schema
      });
      await newTask.save(); // Saves task to MongoDB
      console.log(newTask, "added"); // Logs saved task
      res.redirect("/"); // Redirects to root to refresh task list
    } catch (err) {
      // Handles errors (e.g., validation failures)
      console.log(err); // Logs error details
      res.status(400).send("Error saving task"); // Sends 400 error
    }
  });

// Define a route for deleting a task by ID
app.route("/delete/:id").get(async (req, res) => {
  // Handles GET requests to the /delete/:id route, where :id is a URL parameter
  const { id } = req.params; // Extracts the 'id' parameter from the URL
  try {
    const task = await Task.findByIdAndDelete(id); // Finds and deletes the task with the specified ID in MongoDB
    console.log("deleted task"); // Logs a confirmation message to the console
    res.redirect("/"); // Redirects to the root URL to refresh the task list
  } catch (err) {
    // Catches errors (e.g., invalid ID or database issues)
    res.status(400).send("Error deleting task"); // Sends a 400 Bad Request response with an error message
  }
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`); // Logs server start confirmation
});
