import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration URL parse
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}

// Parse MySQL URL: mysql://username:password@host:port/database
const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = dbUrl.match(regex);

if (!match) {
  console.error("Invalid DATABASE_URL format. Expected: mysql://user:pass@host:port/db");
  process.exit(1);
}

const [, username, password, host, port, database] = match;

const projectRoot = path.resolve(__dirname, "..");
const backupDir = path.join(projectRoot, "backups");

// Ensure backup folder exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFilename = `${database}-backup-${timestamp}.sql`;
const backupFilePath = path.join(backupDir, backupFilename);

// Construct mysqldump command
// Note: using --result-file or standard redirection depending on OS
const cmd = `mysqldump --host=${host} --port=${port} --user=${username} --password=${password} ${database} > "${backupFilePath}"`;

console.log(`Starting backup for database "${database}"...`);

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error("Backup failed:", error.message);
    process.exit(1);
  }
  if (stderr && !stderr.includes("Warning")) {
    console.warn("Backup warning/stderr:", stderr);
  }

  console.log(`Backup completed successfully! Saved to: ${backupFilePath}`);

  // Delete backups older than 7 days
  const retentionDays = 7;
  const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error("Failed to read backup directory for cleanup:", err.message);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(backupDir, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error(`Failed to stat file ${filePath}:`, statErr.message);
          return;
        }

        if (stats.isFile() && stats.mtimeMs < cutoffTime) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Failed to delete old backup file ${filePath}:`, unlinkErr.message);
            } else {
              console.log(`Retention policy: deleted expired backup: ${file}`);
            }
          });
        }
      });
    });
  });
});
