const mysql = require("mysql2/promise");

async function main() {
  const c = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_ROOT_PASSWORD || "",
  });
  await c.query(
    "CREATE DATABASE IF NOT EXISTS `Imtiaz-bios` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  );
  const [rows] = await c.query("SHOW DATABASES LIKE 'Imtiaz-bios'");
  console.log("OK", rows);
  await c.end();
}

main().catch((e) => {
  console.error("FAIL", e.message);
  console.error(
    "Tip: Start MySQL from XAMPP (D:\\web-enginering\\New folder\\mysql_start.bat), then retry.",
  );
  process.exit(1);
});
