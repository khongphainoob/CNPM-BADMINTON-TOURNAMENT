import { execSync } from 'child_process';

const port = process.argv[2] || '3000';

try {
  if (process.platform === 'win32') {
    const out = execSync(`netstat -ano -p tcp | findstr LISTENING | findstr :${port}`, {
      encoding: 'utf8',
    });
    const pids = [
      ...new Set(
        out
          .trim()
          .split(/\r?\n/)
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && pid !== '0')
      ),
    ];
    pids.forEach((pid) => {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Killed PID ${pid} on port ${port}`);
    });
  } else {
    execSync(`lsof -ti tcp:${port} | xargs -r kill -9`, { stdio: 'inherit' });
  }
} catch {
  // No process on port — nothing to kill
  console.log(`Port ${port} is free`);
}
