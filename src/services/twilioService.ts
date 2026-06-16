import axios from 'axios';

// Twilio configuration
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;

// Twilio REST API base URL
const TWILIO_BASE_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;

// Create Twilio API client
const twilioClient = axios.create({
  baseURL: TWILIO_BASE_URL,
  auth: {
    username: TWILIO_ACCOUNT_SID,
    password: TWILIO_AUTH_TOKEN,
  },
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

interface SMSOptions {
  to: string;
  from?: string;
  body: string;
}

interface CallOptions {
  to: string;
  from?: string;
  url?: string;
}

export const twilioService = {
  // Send SMS
  sendSMS: async (options: SMSOptions) => {
    try {
      const params = new URLSearchParams();
      params.append('From', options.from || '+1234567890'); // Set your Twilio number
      params.append('To', options.to);
      params.append('Body', options.body);

      const response = await twilioClient.post('/Messages', params);
      
      console.log('SMS sent successfully:', response.data.sid);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('SMS error:', error);
      return { data: null, error };
    }
  },

  // Send Emergency Alert SMS
  sendEmergencyAlert: async (phoneNumber: string, deviceLocation: string) => {
    const message = `🚨 EMERGENCY ALERT: Your anti-theft device detected a security issue. Location: ${deviceLocation}. Visit your app for details.`;
    return twilioService.sendSMS({
      to: phoneNumber,
      body: message,
    });
  },

  // Send Location Update SMS
  sendLocationSMS: async (phoneNumber: string, address: string, coordinates: string) => {
    const message = `📍 Device Location Update: ${address} (${coordinates}). Track in real-time via app.`;
    return twilioService.sendSMS({
      to: phoneNumber,
      body: message,
    });
  },

  // Send Threat Alert SMS
  sendThreatAlert: async (phoneNumber: string, threatType: string) => {
    const message = `⚠️ THREAT DETECTED: ${threatType}. Your device security score decreased. Check your app immediately.`;
    return twilioService.sendSMS({
      to: phoneNumber,
      body: message,
    });
  },

  // Make phone call to ring device
  makeCall: async (options: CallOptions) => {
    try {
      const params = new URLSearchParams();
      params.append('From', options.from || '+1234567890');
      params.append('To', options.to);
      params.append('Url', options.url || 'http://demo.twilio.com/docs/voice.xml');

      const response = await twilioClient.post('/Calls', params);
      
      console.log('Call initiated:', response.data.sid);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Call error:', error);
      return { data: null, error };
    }
  },

  // Send WhatsApp message
  sendWhatsApp: async (to: string, message: string) => {
    try {
      const params = new URLSearchParams();
      params.append('From', 'whatsapp:+1234567890'); // Set your WhatsApp number
      params.append('To', `whatsapp:${to}`);
      params.append('Body', message);

      const response = await twilioClient.post('/Messages', params);
      
      console.log('WhatsApp sent:', response.data.sid);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('WhatsApp error:', error);
      return { data: null, error };
    }
  },
};

export default twilioService;
