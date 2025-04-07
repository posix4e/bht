// Import Holepunch for synchronization
import * as Hyperswarm from '@hyperswarm/dht';
import Hyperbee from 'hyperbee';
import Hypercore from 'hypercore';
import b4a from 'b4a';

// Global variables
let deviceId = '';
let expirationDays = 30;
let publicKey = '';
let privateKey = '';
let historyCore = null;
let historyBee = null;
let swarm = null;

// Initialize the extension
async function initialize() {
  // Load settings from storage
  const settings = await chrome.storage.local.get(['deviceId', 'expirationDays', 'publicKey', 'privateKey']);
  
  // Set device ID or generate a new one if not exists
  deviceId = settings.deviceId || generateDeviceId();
  if (!settings.deviceId) {
    await chrome.storage.local.set({ deviceId });
  }
  
  // Set expiration days
  expirationDays = settings.expirationDays || 30;
  
  // Set keys or generate new ones if not exists
  if (settings.publicKey && settings.privateKey) {
    publicKey = settings.publicKey;
    privateKey = settings.privateKey;
  } else {
    await generateNewKeys();
  }
  
  // Initialize Holepunch
  await initializeHolepunch();
  
  // Start tracking browser history
  chrome.tabs.onUpdated.addListener(handleTabUpdated);
}

// Generate a unique device ID
function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate new public/private key pair
async function generateNewKeys() {
  const core = new Hypercore(null);
  await core.ready();
  
  publicKey = b4a.toString(core.key, 'hex');
  privateKey = b4a.toString(core.secretKey, 'hex');
  
  await chrome.storage.local.set({ publicKey, privateKey });
}

// Initialize Holepunch for synchronization
async function initializeHolepunch() {
  try {
    // Create a hypercore with the provided keys
    historyCore = new Hypercore('./history-storage', b4a.from(publicKey, 'hex'), {
      secretKey: b4a.from(privateKey, 'hex')
    });
    
    await historyCore.ready();
    
    // Create a hyperbee database on top of the hypercore
    historyBee = new Hyperbee(historyCore, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    });
    
    // Join the swarm to sync with other devices
    swarm = new Hyperswarm();
    
    swarm.on('connection', (conn) => {
      // Replicate the hypercore with peers
      conn.pipe(historyCore.replicate(true)).pipe(conn);
    });
    
    // Join the swarm with the public key as the topic
    const discovery = swarm.join(historyCore.discoveryKey);
    await discovery.flushed();
    
    // Announce ourselves as a host
    swarm.announce(historyCore.discoveryKey);
    
    console.log('Holepunch initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Holepunch:', error);
  }
}

// Handle tab updates to track history
async function handleTabUpdated(tabId, changeInfo, tab) {
  // Only track when the page is loaded and has a URL
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip chrome:// and other internal URLs
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    
    try {
      // Create a history entry
      const historyEntry = {
        device_id: deviceId,
        url: tab.url,
        title: tab.title || '',
        timestamp: Date.now(),
        expiration: Date.now() + (expirationDays * 24 * 60 * 60 * 1000)
      };
      
      // Store in Hyperbee
      if (historyBee) {
        const key = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await historyBee.put(key, historyEntry);
        console.log('History entry saved:', historyEntry);
      }
      
      // Clean up expired entries
      await cleanupExpiredEntries();
    } catch (error) {
      console.error('Failed to save history entry:', error);
    }
  }
}

// Clean up expired entries
async function cleanupExpiredEntries() {
  if (!historyBee) return;
  
  try {
    const now = Date.now();
    const stream = historyBee.createReadStream();
    
    for await (const { key, value } of stream) {
      if (value.expiration < now) {
        await historyBee.del(key);
        console.log('Deleted expired entry:', key);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup expired entries:', error);
  }
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.expirationDays) {
    expirationDays = changes.expirationDays.newValue;
  }
  
  if (changes.publicKey || changes.privateKey) {
    // Reinitialize Holepunch with new keys
    if (swarm) {
      swarm.destroy();
      swarm = null;
    }
    
    if (historyCore) {
      historyCore.close();
      historyCore = null;
      historyBee = null;
    }
    
    publicKey = changes.publicKey ? changes.publicKey.newValue : publicKey;
    privateKey = changes.privateKey ? changes.privateKey.newValue : privateKey;
    
    initializeHolepunch();
  }
});

// Initialize the extension
initialize();