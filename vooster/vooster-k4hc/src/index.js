const config = require('../config/config.json');

console.log(`Starting Vooster project: ${config.project.name}`);
console.log(`Project code: ${config.project.code}`);
console.log(`Version: ${config.project.version}`);

function main() {
    console.log('Vooster K4HC initialized successfully!');
}

if (require.main === module) {
    main();
}

module.exports = { main };