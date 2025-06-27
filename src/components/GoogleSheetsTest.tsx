
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { contactsService } from '@/services/contactsService';
import { useToast } from "@/hooks/use-toast";

export const GoogleSheetsTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testSyncSingle = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      // Get first contact to test with
      const contacts = await contactsService.getAllContacts();
      if (contacts.length === 0) {
        toast({
          title: "No contacts found",
          description: "Add some contacts first to test the sync",
          variant: "destructive"
        });
        return;
      }

      const firstContact = contacts[0];
      console.log("Testing sync with contact:", firstContact.email);
      
      await contactsService.syncContactToSheets(firstContact.email);
      
      toast({
        title: "Sync test completed",
        description: `Attempted to sync ${firstContact.email} to Google Sheets`,
      });
      
      setResult({
        type: 'single',
        contact: firstContact.email,
        status: 'completed'
      });
      
    } catch (error: any) {
      console.error("Sync test error:", error);
      toast({
        title: "Sync test failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
      
      setResult({
        type: 'single',
        status: 'failed',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSyncAll = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log("Testing sync all contacts...");
      
      await contactsService.syncAllContactsToSheets();
      
      toast({
        title: "Bulk sync test completed",
        description: "Attempted to sync all contacts to Google Sheets",
      });
      
      setResult({
        type: 'bulk',
        status: 'completed'
      });
      
    } catch (error: any) {
      console.error("Bulk sync test error:", error);
      toast({
        title: "Bulk sync test failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
      
      setResult({
        type: 'bulk',
        status: 'failed',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Google Sheets Sync Test</CardTitle>
        <CardDescription>
          Test the Google Sheets integration to debug any issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testSyncSingle} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Testing..." : "Test Sync Single Contact"}
          </Button>
          
          <Button 
            onClick={testSyncAll} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? "Testing..." : "Test Sync All Contacts"}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="font-medium">Test Result:</div>
            <div>Type: {result.type}</div>
            <div>Status: {result.status}</div>
            {result.contact && <div>Contact: {result.contact}</div>}
            {result.error && <div className="text-red-600">Error: {result.error}</div>}
            <div className="mt-2 text-xs text-gray-500">
              Check the browser console and Supabase function logs for more details
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Open browser console to see detailed logs</div>
          <div>• Check Supabase function logs for errors</div>
          <div>• Verify your Google Apps Script is deployed correctly</div>
        </div>
      </CardContent>
    </Card>
  );
};
