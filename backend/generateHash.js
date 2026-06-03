const bcrypt = require('bcrypt');

async function generate() {
  const hash = await bcrypt.hash('Admin@1234', 10);
  console.log('Your hash:', hash);
}

generate();