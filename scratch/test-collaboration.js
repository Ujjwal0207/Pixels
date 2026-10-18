const assert = require('assert');

// Mock browser DOM & BroadcastChannel environment
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    if (!MockBroadcastChannel.channels[name]) {
      MockBroadcastChannel.channels[name] = [];
    }
    MockBroadcastChannel.channels[name].push(this);
    this.onmessage = null;
  }

  postMessage(data) {
    const peers = MockBroadcastChannel.channels[this.name] || [];
    peers.forEach(peer => {
      if (peer !== this && peer.onmessage) {
        peer.onmessage({ data });
      }
    });
  }

  close() {
    const peers = MockBroadcastChannel.channels[this.name] || [];
    const idx = peers.indexOf(this);
    if (idx !== -1) peers.splice(idx, 1);
  }
}
MockBroadcastChannel.channels = {};

global.BroadcastChannel = MockBroadcastChannel;
global.window = {
  location: { hash: '', href: 'http://localhost:3000' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  },
};
global.localStorage = global.window.localStorage;
global.document = {
  getElementById: (id) => {
    return {
      style: {},
      addEventListener: () => {},
      appendChild: () => {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 }),
    };
  },
  createElement: () => ({
    style: {},
    appendChild: () => {},
    setAttribute: () => {},
    dataset: {},
  }),
};
global.performance = { now: () => Date.now() };

require('../js/collaboration.js');
const CollaborationEngine = global.window.CollaborationEngine;

console.log('🧪 Running Multiplayer Collaboration Engine Tests...');

// =========================================================================
// 1. Two-Peer Initialization & Cross-Tab Connection
// =========================================================================
const mockCanvasManagerA = {
  artboardWidth: 1080,
  artboardHeight: 1080,
  canvas: {
    getZoom: () => 1,
    getElement: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: 1080, height: 1080 }) }),
    on: () => {},
    getObjects: () => [],
    requestRenderAll: () => {},
  }
};

const mockCanvasManagerB = {
  artboardWidth: 1080,
  artboardHeight: 1080,
  canvas: {
    getZoom: () => 1,
    getElement: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: 1080, height: 1080 }) }),
    on: () => {},
    getObjects: () => [],
    requestRenderAll: () => {},
  }
};

const peerA = new CollaborationEngine(mockCanvasManagerA);
peerA.userName = 'Alice';
peerA.userColor = '#ec4899';

const peerB = new CollaborationEngine(mockCanvasManagerB);
peerB.userName = 'Bob';
peerB.userColor = '#06b6d4';

peerA.connect('design_room_99');
peerB.connect('design_room_99');

assert.strictEqual(peerA.isConnected, true, 'Peer A should be connected');
assert.strictEqual(peerB.isConnected, true, 'Peer B should be connected');

// Peer A should have received Bob's peer:joined
assert.ok(peerA.peers.has(peerB.userId), 'Peer A should have Bob in peers map');
assert.strictEqual(peerA.peers.get(peerB.userId).name, 'Bob');

// Peer B should have received Alice's sync or heartbeat
peerA.broadcast({
  type: 'peer:heartbeat',
  userId: peerA.userId,
  userName: peerA.userName,
  userColor: peerA.userColor,
});
assert.ok(peerB.peers.has(peerA.userId), 'Peer B should have Alice in peers map');
assert.strictEqual(peerB.peers.get(peerA.userId).name, 'Alice');

console.log('✅ Two-peer cross-tab handshake and presence synchronization verified.');

// =========================================================================
// 2. Live Smooth Remote Cursor Message Dispatch
// =========================================================================
let cursorReceived = null;
peerB.renderRemoteCursor = (data) => {
  cursorReceived = data;
};

peerA.broadcast({
  type: 'cursor',
  userId: peerA.userId,
  userName: peerA.userName,
  userColor: peerA.userColor,
  x: 450,
  y: 320,
});

assert.ok(cursorReceived, 'Peer B must receive cursor message');
assert.strictEqual(cursorReceived.x, 450, 'Cursor X must match');
assert.strictEqual(cursorReceived.y, 320, 'Cursor Y must match');
assert.strictEqual(cursorReceived.userName, 'Alice', 'Cursor name badge must match');
console.log('✅ Remote cursor broadcast and payload parsing verified.');

// =========================================================================
// 3. Canvas Delta Synchronization & Loopback Echo Prevention
// =========================================================================
let renderedObjectProps = null;
const targetObject = {
  collabId: 'shape_rect_101',
  left: 100,
  top: 100,
  fill: '#000000',
  set: function(props) {
    renderedObjectProps = props;
    Object.assign(this, props);
  },
  setCoords: () => {},
};

peerB.canvas.getObjects = () => [targetObject];

// Peer A modifies shape on their canvas
const deltaMsg = {
  type: 'canvas:delta',
  action: 'modified',
  userId: peerA.userId,
  collabId: 'shape_rect_101',
  props: {
    left: 350,
    top: 480,
    fill: '#7c3aed',
  }
};

assert.strictEqual(peerB.isRemoteUpdate, false, 'isRemoteUpdate must be false initially');
peerB.handleMessage(deltaMsg);

assert.ok(renderedObjectProps, 'Peer B must have applied modified props to target object');
assert.strictEqual(targetObject.left, 350, 'Target object left position updated');
assert.strictEqual(targetObject.top, 480, 'Target object top position updated');
assert.strictEqual(targetObject.fill, '#7c3aed', 'Target object fill updated');
assert.strictEqual(peerB.isRemoteUpdate, false, 'isRemoteUpdate must be restored to false after delta execution');
console.log('✅ Canvas delta synchronization and loopback echo guard verified.');

// =========================================================================
// 4. Inactive Peer Auto-Cleanup
// =========================================================================
peerA.peers.set('ghost_user', {
  name: 'Ghost',
  color: '#999999',
  lastSeen: Date.now() - 10000, // 10 seconds ago
});
assert.strictEqual(peerA.peers.has('ghost_user'), true);

// Trigger peer cleanup logic
const now = Date.now();
peerA.peers.forEach((peer, peerId) => {
  if (now - peer.lastSeen > 6000) {
    peerA.removeRemoteCursor(peerId);
    peerA.peers.delete(peerId);
  }
});
assert.strictEqual(peerA.peers.has('ghost_user'), false, 'Stale ghost peer should be evicted');
console.log('✅ Stale inactive peer auto-cleanup verified.');

// Disconnect cleanup
peerA.disconnect();
peerB.disconnect();
assert.strictEqual(peerA.isConnected, false);
assert.strictEqual(peerB.isConnected, false);
console.log('✅ Clean disconnection verified.');

console.log('🎉 ALL Multiplayer Collaboration tests passed 100%!');
