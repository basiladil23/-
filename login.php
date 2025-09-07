<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $username = $_POST['username'];
  $password = $_POST['password'];

  try {
    $db = new PDO('sqlite:users.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$username, $password]);

    if ($stmt->rowCount() > 0) {
      echo "<script>alert('تم تسجيل الدخول بنجاح!');</script>";
      echo "<script>window.location.href = 'dashbor.html';</script>";
    } else {
      echo "<script>alert('اسم المستخدم أو كلمة المرور غير صحيحة');</script>";
    }

  } catch (PDOException $e) {
    echo "<script>alert('خطأ في قاعدة البيانات');</script>";
  }
}
?><link rel="stylesheet" href="login.html">