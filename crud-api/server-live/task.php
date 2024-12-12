<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "eneg1777_designtest", "jsxvstsx2024", "eneg1777_designtest");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        if (isset($_GET['project_id'])) {
            $project_id = $_GET['project_id'];
            $result = $conn->query("SELECT * FROM tasks WHERE project_id=$project_id");
        } else {
            $result = $conn->query("SELECT * FROM projects");
        }
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    case 'POST':
    // Handle file uploads for tasks
    if (isset($_POST['project_id'])) {
        $project_id = $_POST['project_id'];
        $name = $_POST['name'];
        $imagePath = '';

        // Check if an image file was uploaded
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';
            $imageName = basename($_FILES['image']['name']);
            
            // Generate a unique filename by appending a timestamp or a random string
            $uniqueImageName = time() . '_' . $imageName; // You can also use uniqid() for a unique string
            
            // Move the uploaded file to the target directory
            move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $uniqueImageName);
            
            // Use the unique image name in the database
            $imagePath = $uniqueImageName;
        } else {
            $imagePath = ''; // Handle case if no image is uploaded
        }

        $stmt = $conn->prepare("INSERT INTO tasks (project_id, name, image) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $project_id, $name, $imagePath);
        $stmt->execute();

        echo json_encode(["id" => $conn->insert_id]);
    } else {
        // Handle project creation
        $name = $input['name'];
        $conn->query("INSERT INTO projects (name) VALUES ('$name')");
        echo json_encode(["id" => $conn->insert_id]);
    }
    break;

    case 'PUT':
    if (isset($input['id'])) {
        $id = $input['id'];
        $status = isset($input['status']) ? $input['status'] : null;
        $pelapor = isset($input['pelapor']) ? $input['pelapor'] : null;

        $updates = [];
        $params = [];
        $types = '';

        // Validate and prepare the status field
        if ($status !== null) {
            if (in_array($status, ['pending', 'completed', 'ongoing'])) {
                $updates[] = "status=?";
                $params[] = $status;
                $types .= 's';
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid status value"]);
                break;
            }
        }

        // Validate and prepare the pelapor field
        if ($pelapor !== null) {
            if (in_array($pelapor, ['ivan', 'drajat'])) {
                $updates[] = "pelapor=?";
                $params[] = $pelapor;
                $types .= 's';
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid pelapor value"]);
                break;
            }
        }

        // Ensure at least one field is being updated
        if (!empty($updates)) {
            $params[] = $id;
            $types .= 'i';
            $stmt = $conn->prepare("UPDATE tasks SET " . implode(", ", $updates) . " WHERE id=?");
            $stmt->bind_param($types, ...$params);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "No rows updated or invalid ID"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "No valid fields to update"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing id"]);
    }
    break;

    case 'DELETE':
    $id = $input['id'];
    $table = isset($input['project_id']) ? "tasks" : "projects";
    
    // Fetch the image path before deleting the task
    if ($table === "tasks") {
        $result = $conn->query("SELECT image FROM tasks WHERE id=$id");
        $task = $result->fetch_assoc();
        
        // Check if an image exists for this task
        if ($task && $task['image']) {
            $imagePath = "uploads/" . $task['image'];
            echo "Image path: $imagePath"; // Debugging line to check the image path

            // Delete the image file from the uploads folder if it exists
            if (file_exists($imagePath)) {
                if (unlink($imagePath)) {
                    echo "File deleted successfully"; // Debugging line to confirm file deletion
                } else {
                    echo "Failed to delete the file"; // Debugging line for failure
                }
            } else {
                echo "File does not exist"; // Debugging line for missing file
            }
        }
    }

    // Delete the task (or project)
    $conn->query("DELETE FROM $table WHERE id=$id");
    echo json_encode(["success" => true]);
    break;

}

$conn->close();