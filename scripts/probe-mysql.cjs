const mysql = require("mysql2/promise");

async function tryConnect(label, config) {
  try {
    const c = await mysql.createConnection(config);
    const [rows] = await c.query("SELECT 1 AS ok, DATABASE() AS db");
    console.log(label, "OK", rows);
    await c.query(
      "CREATE DATABASE IF NOT EXISTS `Imtiaz-bios` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    );
    const [dbs] = await c.query("SHOW DATABASES LIKE 'Imtiaz-bios'");
    console.log(label, "DB", dbs);
    await c.end();
    return true;
  } catch (e) {
    console.log(label, "FAIL", e.message);
    return false;
  }
}

(async () => {
  const base = { user: "root", password: "", port: 3306 };
  const ok =
    (await tryConnect("127.0.0.1", { ...base, host: "127.0.0.1" })) ||
    (await tryConnect("localhost", { ...base, host: "localhost" })) ||
    (await tryConnect("::1", { ...base, host: "::1" }));
  process.exit(ok ? 0 : 1);
})();
