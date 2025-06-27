
import React from 'react';
import { GoogleSheetsTest } from '@/components/GoogleSheetsTest';

const TestSync = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Google Sheets Sync Testing
          </h1>
          <p className="text-gray-600">
            Use this page to test and debug your Google Sheets integration
          </p>
        </div>
        
        <div className="flex justify-center">
          <GoogleSheetsTest />
        </div>
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debugging Checklist:</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">1.</span>
              <span>Verify GOOGLE_SHEETS_WEBHOOK_URL secret is set correctly in Supabase</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">2.</span>
              <span>Check that Google Apps Script is deployed as Web App with "Anyone" access</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">3.</span>
              <span>Ensure Google Sheet has the correct headers in row 1</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">4.</span>
              <span>Test the webhook URL directly with a tool like Postman</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">5.</span>
              <span>Check Supabase Edge Function logs for detailed error messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSync;
