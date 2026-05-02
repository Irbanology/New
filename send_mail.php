<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden."]);
    exit;
}

$name    = strip_tags(trim($_POST["name"] ?? ''));
$email   = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
$message = strip_tags(trim($_POST["message"] ?? ''));

if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please fill all fields correctly."]);
    exit;
}

$to      = "support@wibeit.co";
$from    = "support@wibeit.co";
$subject = "New Contact Form Message from " . $name;

$body  = "You have received a new message from the Wibeit contact form.\n\n";
$body .= "-----------------------------------\n";
$body .= "Name:    " . $name . "\n";
$body .= "Email:   " . $email . "\n";
$body .= "-----------------------------------\n\n";
$body .= "Message:\n" . $message . "\n";

$headers  = "From: " . $from . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Return-Path: " . $from . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $body, $headers)) {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Message sent successfully!"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Mail failed. Please try again."]);
}
?>
