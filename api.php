<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// الاتصال بقاعدة البيانات
$db = new SQLite3('global_knight.db');

// تحديد الإجراء المطلوب
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get-clients':
        $stmt = $db->prepare('SELECT * FROM clients ORDER BY created_at DESC');
        $result = $stmt->execute();
        $clients = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $clients[] = $row;
        }
        echo json_encode($clients);
        break;
        
    case 'add-client':
        $name = $_POST['name'] ?? '';
        $client_id = $_POST['client_id'] ?? '';
        $address = $_POST['address'] ?? '';
        $nationality = $_POST['nationality'] ?? '';
        
        $stmt = $db->prepare('INSERT INTO clients (name, client_id, address, nationality, created_at) 
                             VALUES (:name, :client_id, :address, :nationality, datetime("now"))');
        $stmt->bindValue(':name', $name, SQLITE3_TEXT);
        $stmt->bindValue(':client_id', $client_id, SQLITE3_TEXT);
        $stmt->bindValue(':address', $address, SQLITE3_TEXT);
        $stmt->bindValue(':nationality', $nationality, SQLITE3_TEXT);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'تمت الإضافة بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'خطأ في الإضافة']);
        }
        break;
        
    // يمكنك إضافة المزيد من الحالات هنا
    
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>