import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download as DownloadIcon, FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Download = () => {
  const { token } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid download token",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    setDownloadStatus('downloading');

    try {
      console.log("Downloading with token:", token);
      
      // Use Supabase functions invoke instead of direct fetch
      const { data, error } = await supabase.functions.invoke('download-product', {
        body: JSON.stringify({ token }),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Download failed');
      }

      if (!data) {
        throw new Error('No data received from download function');
      }

      // Convert the response to a blob if it's not already
      let blob;
      if (data instanceof Blob) {
        blob = data;
      } else {
        // If data is base64 or other format, convert it
        blob = new Blob([data], { type: 'application/pdf' });
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `AI-Guide-${token.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadStatus('success');
      toast({
        title: "Download Started",
        description: "Your file should start downloading now.",
      });
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Download failed');
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : 'An error occurred during download',
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = () => {
    switch (downloadStatus) {
      case 'downloading':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  const getStatusMessage = () => {
    switch (downloadStatus) {
      case 'downloading':
        return 'Preparing your download...';
      case 'success':
        return 'Download completed successfully!';
      case 'error':
        return errorMessage || 'Download failed';
      default:
        return 'Ready to download your digital product';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Download Your Product
            </h1>
            <p className="text-xl text-muted-foreground">
              Your AI guide is ready for download
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getStatusIcon()}
                Digital Product Download
              </CardTitle>
              <CardDescription>
                {getStatusMessage()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {downloadStatus === 'idle' && (
                <>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">Download Information</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• High-quality PDF format</li>
                      <li>• Optimized for all devices</li>
                      <li>• Lifetime access to this download</li>
                      <li>• No DRM restrictions</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full"
                    size="lg"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <DownloadIcon className="h-5 w-5 mr-2" />
                    )}
                    {isDownloading ? "Preparing Download..." : "Download Now"}
                  </Button>
                </>
              )}

              {downloadStatus === 'success' && (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200">
                      Your download should have started automatically. If not, click the button below to try again.
                    </p>
                  </div>
                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download Again
                  </Button>
                </div>
              )}

              {downloadStatus === 'error' && (
                <div className="text-center space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-800 dark:text-red-200">
                      {errorMessage}
                    </p>
                  </div>
                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact us at{" "}
                  <a href="mailto:support@jumpinai.com" className="text-primary hover:underline">
                    support@jumpinai.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Download;