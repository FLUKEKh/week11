const connectionLogSchema = new mongoose.Schema({
  agentCode: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['connect', 'disconnect', 'reconnect'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  socketId: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  connectionDuration: {
    type: Number  // เวลาเชื่อมต่อ (วินาที)
  },
  disconnectReason: {
    type: String
  }
}, {
  collection: 'connection_logs',
  timestamps: true
});

// Compound indexes
connectionLogSchema.index({ agentCode: 1, timestamp: -1 });
connectionLogSchema.index({ eventType: 1, timestamp: -1 });