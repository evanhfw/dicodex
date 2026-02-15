import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

interface CredentialsFormProps {
  onScrapeSuccess?: () => void;
}

export const CredentialsForm = ({ onScrapeSuccess }: CredentialsFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Trigger scraping with credentials
      const response = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Scraping failed');
      }

      const result = await response.json();

      toast({
        title: 'Scraping started!',
        description: 'Data collection is in progress. This may take 2-5 minutes.',
      });

      // Clear password for security
      setPassword('');

      // Poll for completion
      pollScraperStatus();

      onScrapeSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start scraping',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollScraperStatus = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/scrape/status`);
        const status = await response.json();

        if (!status.running && status.last_result) {
          clearInterval(poll);
          
          if (status.last_result.success) {
            toast({
              title: 'Scraping complete!',
              description: `Successfully scraped ${status.last_result.students} students`,
            });
            // Refresh page to show new data
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            toast({
              title: 'Scraping failed',
              description: status.last_result.error || 'Unknown error',
              variant: 'destructive'
            });
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          toast({
            title: 'Timeout',
            description: 'Scraping is taking longer than expected. Please check status manually.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Dicoding Credentials
        </CardTitle>
        <CardDescription>
          Enter your Dicoding account credentials to automatically scrape student data.
          Your credentials are not stored anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@student.devacademy.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your Dicoding password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your credentials are sent securely and not stored anywhere
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping in progress...
              </>
            ) : (
              'Start Scraping'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
