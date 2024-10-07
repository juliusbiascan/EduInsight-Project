const io = require('socket.io-client');
const assert = require('assert');

describe('Server Authentication Tests', () => {
  let socket;

  before((done) => {
    // Connect to the server
    socket = io('https://localhost:4000', {
      rejectUnauthorized: false // Only for testing, don't use in production
    });
    socket.on('connect', done);
  });

  after(() => {
    // Disconnect the socket after tests
    if (socket.connected) {
      socket.disconnect();
    }
  });

  it('should handle login-user event', function(done) {
    const testDeviceId = 'ad7db6ef-eaaf-4c7a-9b69-7fd1d47791e7';
    const testUserId = 'testuser';

    // Join the server with the test device ID
    socket.emit('join-server', testDeviceId);

    // Listen for the login-user event
    socket.on('login-user', (deviceId, userId) => {
      assert.strictEqual(deviceId, testDeviceId);
      assert.strictEqual(userId, testUserId);
      done();
    });

    // Emit the login-user event
    socket.emit('login-user', { deviceId: testDeviceId, userId: testUserId });
  });

  it('should handle logout-user event', (done) => {
    const testDeviceId = 'ad7db6ef-eaaf-4c7a-9b69-7fd1d47791e7';
    const testUserId = 'testuser';

    // Join the server with the test device ID
    socket.emit('join-server', testDeviceId);

    // Listen for the logout-user event
    socket.on('logout-user', (deviceId, userId) => {
      assert.strictEqual(deviceId, testDeviceId);
      assert.strictEqual(userId, testUserId);
      done();
    });

    // Emit the logout-user event
    socket.emit('logout-user', { deviceId: testDeviceId, userId: testUserId });
  });
});