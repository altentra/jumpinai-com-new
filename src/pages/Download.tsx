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
  const [productInfo, setProductInfo] = useState<any>(null);
  const { toast } = useToast();

  // Get product info when component loads
  useEffect(() => {
    const getProductInfo = async () => {
      if (!token) return;
      
      try {
        // Call our edge function to get product info
        const response = await fetch(`https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/download-product/${token}`, {
          method: 'HEAD' // Just check if token is valid without downloading
        });
        
        if (response.ok) {
          // Extract product info from headers if available, or set defaults
          const productName = response.headers.get('x-product-name') || 'Digital Product';
          const fileName = response.headers.get('x-file-name') || 'Download.pdf';
          const description = response.headers.get('x-product-description') || 'Your digital download is ready';
          
          setProductInfo({
            name: productName,
            fileName: fileName,
            description: description,
            downloadCount: 0,
            maxDownloads: 50
          });
        } else {
          setErrorMessage("Invalid or expired download link");
          setDownloadStatus('error');
        }
      } catch (error) {
        console.error('Error checking download:', error);
        setErrorMessage("Unable to verify download link");
        setDownloadStatus('error');
      }
    };
    
    getProductInfo();
  }, [token]);

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
      // Simple direct download
      window.location.href = `https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/download-product/${token}`;
      
      setDownloadStatus('success');
      toast({
        title: "Download Started",
        description: "Your file should start downloading now.",
      });
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setErrorMessage('Download failed');
      toast({
        title: "Download Failed",
        description: "Please try again or contact support",
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
              {productInfo ? productInfo.name : "Your AI guide is ready for download"}
            </p>
            {productInfo && (
              <div className="text-sm text-muted-foreground mt-4 space-y-2">
                <p className="font-medium">{productInfo.fileName}</p>
                {productInfo.description && (
                  <p className="text-muted-foreground/80">{productInfo.description}</p>
                )}
              </div>
            )}
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
                <div className="text-center space-y-6">
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
                </div>
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