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
  useNewUrlParser: true, // Uses the new MongoDB connection string parser for compatibility
  useUnifiedTopology: true, // Enables the new server discovery and monitoring engine for better reliability
});

// Define the Task schema, which serves as the blueprint for documents in the 'tasks' collection
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String, // Specifies the field type as String for the task title
      minLength: [3, "Title must be at least 3 characters long"], // Enforces a minimum length of 3 characters, with a custom error message
      required: [true, "Title is required"], // Makes the title field mandatory, with a custom error message
      trim: true, // Automatically removes leading and trailing whitespace from the title
    },
    status: {
      type: String, // Specifies the field type as String for the task status
      enum: {
        values: ["pending", "completed"], // Restricts status to only 'pending' or 'completed'
        message: "{VALUE} is not a valid status", // Custom error message for invalid status values
      },
      default: "pending", // Sets the default status to 'pending' if no value is provided
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields to track document creation and update times
  }
);

// Create the Task model, which maps to the 'tasks' collection in MongoDB
const Task = mongoose.model("Task", taskSchema); // Defines the Task model, linking the schema to the 'tasks' collection (pluralized by Mongoose)

// Middleware: Serve static files (e.g., CSS, images) from the 'public' directory
app.use(express.static("public")); // Allows Express to serve static files like style.css from the 'public' folder

// Middleware: Parse URL-encoded data (form submissions) with extended option for complex objects
app.use(bodyParser.urlencoded({ extended: true })); // Parses form data from HTTP POST requests; 'extended: true' allows parsing of nested objects
// Note: Since Express 4.16.0, body parsing is built-in (express.urlencoded), but body-parser is used here for explicitness

// Set the view engine to EJS for rendering dynamic templates
app.set("view engine", "ejs"); // Configures Express to use EJS for rendering views (e.g., Home.ejs)

// Define a route for the root URL ("/") handling both GET and POST requests
app
  .route("/") // Groups routes for the root URL ("/") to handle multiple HTTP methods
  .get(async (req, res) => {
    // Handles GET requests to display the task list
    try {
      const tasks = await Task.find({}); // Queries MongoDB to retrieve all tasks from the 'tasks' collection
      if (!tasks) {
        // Checks if tasks is falsy (e.g., null or empty)
        return; // Exits the function if no tasks are found (though this check may be unnecessary as an empty array is valid)
      }
      res.render("Home", { data: tasks }); // Renders the 'Home.ejs' template, passing the tasks array as 'data' to the template
    } catch (err) {
      // Catches any errors during the database query
      res.status(400).send("Failed to load tasks"); // Sends a 400 Bad Request response with an error message
    }
  })
  .post(async (req, res) => {
    // Handles POST requests to add a new task
    try {
      // Destructure form data from req.body, mapping to form field names from the HTML form
      const { title_input, status_input } = req.body; // Extracts 'title_input' and 'status_input' from the form submission
      // Create a new Task document using the Task model
      const newTask = new Task({
        title: title_input, // Maps the form's 'title_input' to the schema's 'title' field
        status: status_input, // Maps the form's 'status_input' to the schema's 'status' field
      });
      // Save the new task to the MongoDB database
      await newTask.save(); // Persists the task document to the 'tasks' collection
      // Log the saved task to the console for debugging
      console.log(newTask, "added"); // Outputs the saved task object and "added" to the console
      // Redirect to the root URL after successful save to avoid form resubmission
      res.redirect("/"); // Redirects to the root URL, triggering a GET request to refresh the task list
    } catch (err) {
      // Catches any errors (e.g., validation failures or database issues)
      // Log the error to the console for debugging
      console.log(err); // Outputs the error details
      // Send a 400 Bad Request response with an error message
      res.status(400).send("Error saving task"); // Informs the client of the failure
    }
  });

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message to the console when the server starts successfully
  console.log(`Server started on port ${PORT}`); // Confirms the server is running and listening on port 3000
});
