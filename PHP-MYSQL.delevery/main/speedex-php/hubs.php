<?php
require_once __DIR__ . '/config/db.php';
include __DIR__ . '/includes/header.php';

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$selectedId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

try {
    if ($q !== '') {
        $stmt = $pdo->prepare("SELECT * FROM hubs WHERE name LIKE :q OR address LIKE :q ORDER BY name ASC");
        $stmt->execute([':q' => "%{$q}%"]);
    } else {
        $stmt = $pdo->query("SELECT * FROM hubs ORDER BY name ASC");
    }
    $hubs = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    $hubs = [];
}

$selected = null;
if ($selectedId) {
    foreach ($hubs as $h) {
        if ((int)$h['id'] === $selectedId) { $selected = $h; break; }
    }
}
?>
<section class="page-header">
  <h1>Find a Hub</h1>
  <p class="muted">Locate the nearest SpeedEx hub for pickup, drop-off, or scheduled collection.</p>
</section>

<form method="get" action="/hubs.php" class="search-bar" style="margin:16px 0;display:flex;gap:8px;">
  <input type="text" name="q" value="<?= htmlspecialchars($q) ?>" placeholder="Search by hub name, city, or address..." class="input" style="flex:1;">
  <button type="submit" class="btn">Search</button>
  <?php if ($q): ?><a href="/hubs.php" class="btn ghost">Clear</a><?php endif; ?>
</form>

<div class="hubs-layout" style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
  <div class="hubs-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
    <?php if (empty($hubs)): ?>
      <div class="card"><p class="muted">No hubs found<?= $q ? ' for "' . htmlspecialchars($q) . '"' : '' ?>.</p></div>
    <?php else: foreach ($hubs as $hub): ?>
      <a href="/hubs.php?<?= http_build_query(['q'=>$q,'id'=>$hub['id']]) ?>#details" class="card hub-card" style="display:block;text-decoration:none;color:inherit;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;"><?= htmlspecialchars($hub['name']) ?></h3>
          <span class="badge">Pickup</span>
        </div>
        <p class="muted" style="margin:8px 0 4px;font-size:13px;">Hub #<?= (int)$hub['id'] ?></p>
        <p style="margin:4px 0;font-size:14px;">📍 <?= htmlspecialchars($hub['address']) ?></p>
        <p class="muted" style="margin:4px 0;font-size:13px;">🕒 Sun–Thu, 9:00 AM – 8:00 PM</p>
      </a>
    <?php endforeach; endif; ?>
  </div>

  <aside id="details" class="card" style="height:fit-content;position:sticky;top:20px;">
    <?php if ($selected): ?>
      <h2 style="margin-top:0;"><?= htmlspecialchars($selected['name']) ?></h2>
      <p class="muted">Hub #<?= (int)$selected['id'] ?></p>
      <hr>
      <p><strong>Address</strong><br><?= htmlspecialchars($selected['address']) ?></p>
      <?php
        // Look up assigned manager from users table
        try {
            $m = $pdo->prepare("SELECT name, phone, email FROM users WHERE hub_id = :id AND role='hub_manager' LIMIT 1");
            $m->execute([':id' => $selected['id']]);
            $mgr = $m->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable $e) { $mgr = null; }
      ?>
      <p><strong>Manager</strong><br>
        <?= $mgr ? htmlspecialchars($mgr['name']) : '<span class="muted">Not assigned</span>' ?>
      </p>
      <?php if ($mgr && !empty($mgr['phone'])): ?>
        <p><strong>Phone</strong><br><?= htmlspecialchars($mgr['phone']) ?></p>
      <?php endif; ?>
      <p><strong>Hours</strong><br>Sun–Thu: 9:00 AM – 8:00 PM<br>Fri–Sat: 10:00 AM – 6:00 PM</p>
      <p><strong>Services</strong><br>Pickup • Drop-off • COD</p>
      <a href="/index.php#send" class="btn" style="display:block;text-align:center;margin-top:12px;">Schedule Pickup</a>
    <?php else: ?>
      <h3 style="margin-top:0;">Hub Details</h3>
      <p class="muted">Select a hub from the list to see its address, manager, hours, and pickup options.</p>
    <?php endif; ?>
  </aside>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
