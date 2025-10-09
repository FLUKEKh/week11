const messageSchema = new mongoose.Schema({
  fromCode: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  toCode: {
    type: String,
    uppercase: true,
    index: true  // สำหรับ direct messages
  },
  toTeamId: {
    type: Number,
    index: true  // สำหรับ broadcast messages
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['direct', 'broadcast'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  collection: 'messages',
  timestamps: true
});

// Compound indexes สำหรับ query ที่เร็ว
messageSchema.index({ toCode: 1, timestamp: -1 });
messageSchema.index({ toTeamId: 1, timestamp: -1 });
messageSchema.index({ fromCode: 1, timestamp: -1 });