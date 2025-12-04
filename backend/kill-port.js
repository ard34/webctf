// Script untuk kill process di port 3000 (Windows)
const { exec } = require('child_process');

console.log('🔍 Checking port 3000...');

exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
  if (error) {
    console.log('✅ Port 3000 is free!');
    return;
  }

  if (stdout) {
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0) {
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    });

    if (pids.size > 0) {
      console.log(`⚠️  Found ${pids.size} process(es) using port 3000`);
      pids.forEach(pid => {
        console.log(`🛑 Killing process ${pid}...`);
        exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Failed to kill process ${pid}:`, error.message);
          } else {
            console.log(`✅ Process ${pid} killed successfully`);
          }
        });
      });
      console.log('✅ Port 3000 should be free now. Try running the server again.');
    }
  } else {
    console.log('✅ Port 3000 is free!');
  }
});

