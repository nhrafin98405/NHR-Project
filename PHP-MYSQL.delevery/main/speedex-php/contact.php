<?php
require_once __DIR__ . '/config/db.php';

$sent = false;
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name && $email && $message) {
        // Persist message — assumes a `contact_messages` table (see sql/schema.sql additions below)
        try {
            $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, created_at)
                                   VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$name, $email, $phone, $subject, $message]);
            $sent = true;
        } catch (Throwable $e) {
            $error = 'Could not save your message. Please try again later.';
        }
    } else {
        $error = 'Name, email and message are required.';
    }
}

include __DIR__ . '/includes/header.php';
?>
<section class="hero">
  <div>
    <h1>Contact <span class="accent">SpeedEx</span></h1>
    <p>We'd love to hear from you. Reach our team 24/7.</p>
  </div>
</section>

<section class="grid-2" style="gap:24px">
  <div class="card">
    <h2>Get in Touch</h2>
    <p><strong>Head Office</strong><br>
       Plot 45, Gulshan Avenue<br>
       Dhaka 1212, Bangladesh</p>
    <p><strong>Hotline:</strong> 16263 (24/7)<br>
       <strong>Phone:</strong> +880 1711-100200<br>
       <strong>Email:</strong> support@speedex.com.bd</p>
    <p><strong>Hours:</strong> Sat – Thu, 8:00 AM – 10:00 PM</p>
  </div>

  <div class="card">
    <h2>Send us a Message</h2>
    <?php if ($sent): ?>
      <p class="accent"><strong>Thank you!</strong> Your message has been received. We'll reply within 24 hours.</p>
    <?php endif; ?>
    <?php if ($error): ?>
      <p style="color:#ef4444"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>
    <form method="POST">
      <input name="name" placeholder="Your Name" required>
      <input name="email" type="email" placeholder="Email Address" required>
      <input name="phone" placeholder="Phone (optional)">
      <input name="subject" placeholder="Subject">
      <textarea name="message" rows="5" placeholder="How can we help?" required></textarea>
      <button type="submit" class="btn">Send Message</button>
    </form>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
