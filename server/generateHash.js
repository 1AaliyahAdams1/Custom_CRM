const bcrypt = require("bcrypt");

async function generateHash() {
  try {
    const password = "P@ssw0rd123";
    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
  } catch (err) {
    console.error("Error generating hash:", err);
  } finally {
    process.exit();  // ensure node exits after running
  }
}

generateHash();
