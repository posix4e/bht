// Import Hypercore for key generation
// Using dynamic imports to ensure compatibility with browser extensions
const importHolepunch = async () => {
  try {
    const Hypercore = await import('hypercore');
    const b4a = await import('b4a');
    
    return { Hypercore, b4a };
  } catch (error) {
    console.error('Failed to import Holepunch modules:', error);
    return null;
  }
};

// DOM elements
const deviceIdInput = document.getElementById('device-id');
const publicKeyInput = document.getElementById('public-key');
const privateKeyInput = document.getElementById('private-key');
const expirationDaysInput = document.getElementById('expiration-days');
const statusMessage = document.getElementById('status-message');

// Button elements
const regenerateDeviceIdButton = document.getElementById('regenerate-device-id');
const copyPublicKeyButton = document.getElementById('copy-public-key');
const copyPrivateKeyButton = document.getElementById('copy-private-key');
const generateNewKeysButton = document.getElementById('generate-new-keys');
const importKeysButton = document.getElementById('import-keys');
const saveSettingsButton = document.getElementById('save-settings');
const resetSettingsButton = document.getElementById('reset-settings');

// Modal elements
const importModal = document.getElementById('import-modal');
const closeModalButton = document.querySelector('.close');
const importPublicKeyInput = document.getElementById('import-public-key');
const importPrivateKeyInput = document.getElementById('import-private-key');
const confirmImportButton = document.getElementById('confirm-import');
const cancelImportButton = document.getElementById('cancel-import');

// Load settings
async function loadSettings() {
  const settings = await chrome.storage.local.get(['deviceId', 'expirationDays', 'publicKey', 'privateKey']);
  
  // Set device ID
  deviceIdInput.value = settings.deviceId || '';
  
  // Set keys
  publicKeyInput.value = settings.publicKey || '';
  privateKeyInput.value = settings.privateKey || '';
  
  // Set expiration days
  expirationDaysInput.value = settings.expirationDays || 30;
}

// Generate a unique device ID
function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate new public/private key pair
async function generateNewKeys() {
  try {
    const modules = await importHolepunch();
    if (!modules) {
      showStatusMessage('Failed to load Holepunch modules', 'error');
      return;
    }
    
    const { Hypercore, b4a } = modules;
    
    const core = new Hypercore.default(null);
    await core.ready();
    
    const publicKey = b4a.default.toString(core.key, 'hex');
    const privateKey = b4a.default.toString(core.secretKey, 'hex');
    
    publicKeyInput.value = publicKey;
    privateKeyInput.value = privateKey;
    
    showStatusMessage('New keys generated successfully.', 'success');
  } catch (error) {
    console.error('Failed to generate new keys:', error);
    showStatusMessage('Failed to generate new keys: ' + error.message, 'error');
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      deviceId: deviceIdInput.value,
      publicKey: publicKeyInput.value,
      privateKey: privateKeyInput.value,
      expirationDays: parseInt(expirationDaysInput.value, 10)
    };
    
    await chrome.storage.local.set(settings);
    showStatusMessage('Settings saved successfully.', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatusMessage('Failed to save settings: ' + error.message, 'error');
  }
}

// Reset settings to defaults
async function resetSettings() {
  try {
    const deviceId = generateDeviceId();
    deviceIdInput.value = deviceId;
    
    // Generate new keys
    await generateNewKeys();
    
    // Reset expiration days
    expirationDaysInput.value = 30;
    
    showStatusMessage('Settings reset to defaults.', 'success');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    showStatusMessage('Failed to reset settings: ' + error.message, 'error');
  }
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Show status message
function showStatusMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message ' + type;
  
  // Hide message after 3 seconds
  setTimeout(() => {
    statusMessage.className = 'status-message';
  }, 3000);
}

// Event listeners
regenerateDeviceIdButton.addEventListener('click', () => {
  deviceIdInput.value = generateDeviceId();
  showStatusMessage('Device ID regenerated.', 'success');
});

copyPublicKeyButton.addEventListener('click', async () => {
  const success = await copyToClipboard(publicKeyInput.value);
  if (success) {
    showStatusMessage('Public key copied to clipboard.', 'success');
  } else {
    showStatusMessage('Failed to copy public key.', 'error');
  }
});

copyPrivateKeyButton.addEventListener('click', async () => {
  const success = await copyToClipboard(privateKeyInput.value);
  if (success) {
    showStatusMessage('Private key copied to clipboard.', 'success');
  } else {
    showStatusMessage('Failed to copy private key.', 'error');
  }
});

generateNewKeysButton.addEventListener('click', generateNewKeys);

importKeysButton.addEventListener('click', () => {
  importModal.style.display = 'block';
});

closeModalButton.addEventListener('click', () => {
  importModal.style.display = 'none';
});

cancelImportButton.addEventListener('click', () => {
  importModal.style.display = 'none';
});

confirmImportButton.addEventListener('click', () => {
  const publicKey = importPublicKeyInput.value.trim();
  const privateKey = importPrivateKeyInput.value.trim();
  
  if (!publicKey || !privateKey) {
    showStatusMessage('Both public and private keys are required.', 'error');
    return;
  }
  
  publicKeyInput.value = publicKey;
  privateKeyInput.value = privateKey;
  
  importModal.style.display = 'none';
  showStatusMessage('Keys imported successfully.', 'success');
});

saveSettingsButton.addEventListener('click', saveSettings);
resetSettingsButton.addEventListener('click', resetSettings);

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === importModal) {
    importModal.style.display = 'none';
  }
});

// Load settings when the page loads
document.addEventListener('DOMContentLoaded', loadSettings);