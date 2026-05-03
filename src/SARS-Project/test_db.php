<?php
$hosts = [
    'aws-0-ap-south-1.pooler.supabase.com',
    'uswitzynedobgymnzoud.pooler.supabase.com',
    'uswitzynedobgymnzoud.supabase.co',
];

$configs = [
    ['port' => 6543, 'user' => 'postgres.uswitzynedobgymnzoud'],
    ['port' => 5432, 'user' => 'postgres.uswitzynedobgymnzoud'],
    ['port' => 6543, 'user' => 'postgres'],
];

foreach ($hosts as $host) {
    foreach ($configs as $cfg) {
        $port = $cfg['port'];
        $user = $cfg['user'];
        echo "Testing: $host:$port user=$user ... ";
        try {
            $dsn = "pgsql:host=$host;port=$port;dbname=postgres;sslmode=require";
            $db = new PDO($dsn, $user, 'Hariyono890098!@#', [PDO::ATTR_TIMEOUT => 3]);
            echo "SUCCESS!\n";
            // Run a quick query to verify
            $stmt = $db->query("SELECT current_database()");
            echo "  Database: " . $stmt->fetchColumn() . "\n";
            exit(0);
        } catch (Exception $e) {
            $msg = $e->getMessage();
            // Shorten the message
            if (preg_match('/FATAL:\s+(.+)$/m', $msg, $m)) {
                echo "FAIL: " . trim($m[1]) . "\n";
            } elseif (preg_match('/failed:\s+(.+)$/m', $msg, $m)) {
                echo "FAIL: " . trim($m[1]) . "\n";
            } else {
                echo "FAIL: $msg\n";
            }
        }
    }
}
