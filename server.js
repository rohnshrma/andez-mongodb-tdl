// Import the Express framework for building the web server
import express from "express";

// Import body-parser middleware to parse incoming request bodies (e.g., form data)
import bodyParser from "body-parser";

// Import Mongoose for MongoDB object modeling
import mongoose from "mongoose"; // Simplified import, removed unused { mongo } import

// Define the port number where the server will listen
const PORT = 3000;

// Initialize an Express application
const app = express();

// Connect to the local MongoDB database named 'andez_tdlDB' on port 27017
mongoose.connect("mongodb://localhost:27017/andez_tdlDB", {
  useNewUrlParser: true, // Ensures compatibility with newer MongoDB drivers
  useUnifiedTopology: true, // Uses the new server discovery and monitoring engine
});

// Define the Task schema, which serves as the blueprint for documents in the 'tasks' collection
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String, // Field type is String (corrected from "String" for consistency)
      minLength: [3, "Title must be at least 3 characters long"], // Enforces minimum length of 3 characters
      required: [true, "Title is required"], // Makes the field mandatory
      trim: true, // Removes leading/trailing whitespace from the title
    },
    status: {
      type: String, // Field type is String
      enum: {
        values: ["pending", "completed"], // Restricts status to 'pending' or 'completed'
        message: "{VALUE} is not a valid status", // Custom error message for invalid values
      },
      default: "pending", // Sets default status to 'pending' if none provided
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Create the Task model, which maps to the 'tasks' collection in MongoDB
const Task = mongoose.model("Task", taskSchema); // Corrected: Removed 'new' as mongoose.model doesn't require it

// Middleware: Serve static files (e.g., CSS, images) from the 'public' directory
app.use(express.static("public"));

// Middleware: Parse URL-encoded data (form submissions) with extended option for complex objects
app.use(bodyParser.urlencoded({ extended: true })); // Note: Express has built-in body parsing since 4.16.0, but body-parser is used here

// Set the view engine to EJS for rendering dynamic templates
app.set("view engine", "ejs");

// Define a route for the root URL ("/") handling both GET and POST requests
app
  .route("/")
  .get((req, res) => {
    // Handle GET requests: Render the "Home.ejs" template (likely contains the form from your HTML)
    res.render("Home.ejs");
  })
  .post(async (req, res) => {
    try {
      // Destructure form data from req.body, mapping to form field names
      const { new_task, status } = req.body; // Corrected: Changed 'title_input' to 'new_task' and 'status_input' to 'status' to match HTML form
      // Create a new Task document using the Task model
      const newTask = new Task({
        title: new_task, // Maps form's 'new_task' to schema's 'title' field
        status: status, // Maps form's 'status' to schema's 'status' field
      });
      // Save the new task to the MongoDB database
      await newTask.save();
      // Log the saved task to the console for debugging
      console.log(newTask, "added");
      // Redirect to the root URL after successful save to avoid form resubmission
      res.redirect("/");
    } catch (err) {
      // Log any errors (e.g., validation failures) to the console
      console.log(err);
      // Send a 400 Bad Request response with an error message
      res.status(400).send("Error saving task");
    }
  });

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message to the console when the server starts successfully
  console.log(`Server started on port ${PORT}`);
});