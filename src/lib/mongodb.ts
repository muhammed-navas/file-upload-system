import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {

    await mongoose.connect(uri);
    isConnected = true;
    
    mongoose.connection.on('error', (error: Error) => {
      console.error(' MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
      isConnected = true;
    });

    return mongoose.connection;
  } catch (error) {
    console.error(' Failed to connect to MongoDB:', error);
    isConnected = false;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`MongoDB connection failed: ${errorMessage}`);
  }
}

export function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.db?.databaseName || 'Not connected',
    host: mongoose.connection.host || 'Not connected',
    port: mongoose.connection.port || 'Not connected'
  };
}

export function logConnectionStatus() {
  const status = getConnectionStatus();
} 