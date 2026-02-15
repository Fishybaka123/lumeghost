
// Debug script to inspect remainingSessions
const clients = ClientDataService.getAll();
const target = clients.find(c => c.name.includes('Jennifer') || c.remainingSessions > 100);

if (target) {
    console.log('Found Client:', target.name);
    console.log('Remaining Sessions:', target.remainingSessions);
    console.log('Type:', typeof target.remainingSessions);
    console.log('Comparison (== 999):', target.remainingSessions == 999);
    console.log('Comparison (=== 999):', target.remainingSessions === 999);
} else {
    console.log('No matching client found');
}
