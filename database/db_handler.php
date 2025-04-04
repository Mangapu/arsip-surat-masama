<?php
header('Content-Type: application/json');

// Simple debug logging
file_put_contents('database/debug.log', date('Y-m-d H:i:s') . " - Request started\n", FILE_APPEND);

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $file = basename($_GET['file'] ?? '');
    
    // Validate filename
    if (!preg_match('/^[a-z_]+\.json$/', $file)) {
        throw new Exception('Invalid filename format');
    }

    $path = __DIR__ . '/' . $file;
    file_put_contents('database/debug.log', "Processing file: $path\n", FILE_APPEND);

    if ($method === 'GET') {
        if (!file_exists($path)) {
            file_put_contents('database/debug.log', "File not found\n", FILE_APPEND);
            http_response_code(404);
            die(json_encode(['error' => 'File not found']));
        }
        readfile($path);
    } 
    elseif ($method === 'POST') {
        $data = file_get_contents('php://input');
        if (json_decode($data) === null) {
            file_put_contents('database/debug.log', "Invalid JSON data\n", FILE_APPEND);
            throw new Exception('Invalid JSON data');
        }
        
        // Simple write operation
        if (file_put_contents($path, $data) === false) {
            file_put_contents('database/debug.log', "Write failed\n", FILE_APPEND);
            throw new Exception('Failed to write file');
        }
        
        file_put_contents('database/debug.log', "Write successful\n", FILE_APPEND);
        echo json_encode(['success' => true]);
    }
    else {
        http_response_code(405);
        throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    file_put_contents('database/debug.log', "Error: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

file_put_contents('database/debug.log', "Request completed\n\n", FILE_APPEND);
?>