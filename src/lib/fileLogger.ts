import fs from "fs";
import path from "path";

type LogEntry = {
  adminId: number;
  aksi: string;
  tabelTarget: string;
  dataLama?: string;
  dataBaru?: string;
  ipAddress: string;
  userAgent: string;
};

class FileActivityLogger {
  private queue: string[] = [];
  private isProcessing = false;
  private batchSize = 50;
  private flushInterval = 10000;
  private timer: NodeJS.Timeout | null = null;
  private logDir: string;
  private maxFileSize = 10 * 1024 * 1024;

  constructor() {
    this.logDir =
      process.env.LOG_DIR || path.join(process.cwd(), "logs", "activities");
    this.ensureLogDirectory();
    this.startAutoFlush();
  }

  private ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create log directory:", error);
      this.logDir = path.join("/tmp", "activities");
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  add(entry: LogEntry) {
    const timestamp = new Date().toISOString();
    const logLine = JSON.stringify({
      timestamp,
      ...entry,
    });

    this.queue.push(logLine);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  private startAutoFlush() {
    this.timer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private getLogFilePath(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return path.join(this.logDir, `activities-${year}-${month}-${day}.log`);
  }

  private async rotateIfNeeded(filePath: string) {
    try {
      if (!fs.existsSync(filePath)) return;

      const stats = fs.statSync(filePath);
      if (stats.size >= this.maxFileSize) {
        const timestamp = Date.now();
        const rotatedPath = filePath.replace(".log", `-${timestamp}.log`);
        fs.renameSync(filePath, rotatedPath);
      }
    } catch (error) {
    }
  }

  private async flush() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);
    const logFile = this.getLogFilePath();

    try {
      await this.rotateIfNeeded(logFile);
      const content = batch.join("\n") + "\n";
      fs.appendFileSync(logFile, content, { flag: "a" });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to write activity logs:", error);
      }

      if (this.queue.length < 1000) {
        this.queue.unshift(...batch);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async forceFlush() {
    while (this.queue.length > 0) {
      await this.flush();
    }
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async cleanupOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.startsWith("activities-")) continue;

        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log: ${file}`);
        }
      }
    } catch (error) {
      console.error("Failed to cleanup old logs:", error);
    }
  }
}

export const fileLogger = new FileActivityLogger();

process.on("beforeExit", async () => {
  await fileLogger.forceFlush();
  fileLogger.destroy();
});

process.on("SIGTERM", async () => {
  await fileLogger.forceFlush();
  fileLogger.destroy();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await fileLogger.forceFlush();
  fileLogger.destroy();
  process.exit(0);
});

export function logActivity(entry: LogEntry) {
  fileLogger.add(entry);
}
