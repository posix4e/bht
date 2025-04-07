// Import Holepunch for reading history
import * as Hyperswarm from '@hyperswarm/dht';
import Hyperbee from 'hyperbee';
import Hypercore from 'hypercore';
import b4a from 'b4a';

// DOM elements
const deviceIdElement = document.getElementById('device-id');
const entryCountElement = document.getElementById('entry-count');
const expirationDaysElement = document.getElementById('expiration-days');
const historyEntriesElement = document.getElementById('history-entries');
const openOptionsButton = document.getElementById('open-options');

// Global variables
let historyCore = null;
let historyBee = null;
let swarm = null;

// Initialize the popup
async function initialize() {
  // Load settings from storage
  const settings = await chrome.storage.local.get(['deviceId', 'expirationDays', 'publicKey', 'privateKey']);
  
  // Display device ID
  deviceIdElement.textContent = settings.deviceId || 'Not set';
  
  // Display expiration days
  expirationDaysElement.textContent = `${settings.expirationDays || 30} days`;
  
  // Initialize Holepunch if keys are available
  if (settings.publicKey && settings.privateKey) {
    await initializeHolepunch(settings.publicKey, settings.privateKey);
    await loadHistoryEntries();
  } else {
    historyEntriesElement.innerHTML = '<div class="loading">No keys available. Please set up in settings.</div>';
  }
  
  // Add event listener for options button
  openOptionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Initialize Holepunch for reading history
async function initializeHolepunch(publicKey, privateKey) {
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
    
    console.log('Holepunch initialized successfully in popup');
  } catch (error) {
    console.error('Failed to initialize Holepunch in popup:', error);
    historyEntriesElement.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
  }
}

// Load history entries from Hyperbee
async function loadHistoryEntries() {
  if (!historyBee) return;
  
  try {
    historyEntriesElement.innerHTML = '<div class="loading">Loading history...</div>';
    
    // Get all entries
    const entries = [];
    const stream = historyBee.createReadStream();
    
    for await (const { key, value } of stream) {
      entries.push(value);
    }
    
    // Update entry count
    entryCountElement.textContent = entries.length;
    
    // Sort entries by timestamp (newest first)
    entries.sort((a, b) => b.timestamp - a.timestamp);
    
    // Display entries
    if (entries.length === 0) {
      historyEntriesElement.innerHTML = '<div class="loading">No history entries found.</div>';
    } else {
      historyEntriesElement.innerHTML = '';
      
      // Display the 20 most recent entries
      const recentEntries = entries.slice(0, 20);
      
      for (const entry of recentEntries) {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry';
        
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleString();
        
        entryElement.innerHTML = `
          <div class="entry-title">${entry.title || 'Untitled'}</div>
          <div class="entry-url">${entry.url}</div>
          <div class="entry-meta">
            <span>${entry.device_id}</span>
            <span>${formattedDate}</span>
          </div>
        `;
        
        historyEntriesElement.appendChild(entryElement);
      }
    }
  } catch (error) {
    console.error('Failed to load history entries:', error);
    historyEntriesElement.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
  }
}

// Clean up resources when popup is closed
window.addEventListener('unload', () => {
  if (swarm) {
    swarm.destroy();
  }
  
  if (historyCore) {
    historyCore.close();
  }
});

// Initialize the popup
initialize();