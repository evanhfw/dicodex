import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useStudentData } from '@/contexts/StudentDataContext';
import { Loader2, Shield, CheckCircle2 } from 'lucide-react';

interface CredentialsFormProps {
  onScrapeSuccess?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

/** Build headers with optional API Key */
function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
}

export const CredentialsForm = ({ onScrapeSuccess }: CredentialsFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const { toast } = useToast();
  const { setStudentData } = useStudentData();
  const navigate = useNavigate();

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
      // Trigger scraping with credentials
      const response = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Scraping failed');
      }

      const result = await response.json();
      const jobId = result.job_id;

      toast({
        title: 'Scraping started!',
        description: 'Data collection is in progress. This may take 2-5 minutes.',
      });

      // Clear password for security
      setPassword('');

      // Initialize progress
      setProgress(5);
      setStatusMessage('Initializing scraper...');

      // Poll for completion using job_id
      pollScraperStatus(jobId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start scraping',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  const pollScraperStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/scrape/status/${jobId}`, {
          headers: apiHeaders(),
        });
        const status = await response.json();

        // Update progress based on time elapsed
        // Estimated 2-3 minutes for completion
        const estimatedProgress = Math.min(10 + (attempts * 1.5), 95);
        
        if (status.running) {
          setProgress(estimatedProgress);
          
          // Update status messages based on ARQ status and progress
          if (status.status === 'queued') {
            setStatusMessage('Waiting in queue...');
          } else if (estimatedProgress < 20) {
            setStatusMessage('Logging in to Dicoding...');
          } else if (estimatedProgress < 40) {
            setStatusMessage('Loading student list...');
          } else if (estimatedProgress < 60) {
            setStatusMessage('Extracting student data...');
          } else if (estimatedProgress < 80) {
            setStatusMessage('Processing course progress...');
          } else {
            setStatusMessage('Finalizing data collection...');
          }
        }

        if (!status.running && status.result) {
          clearInterval(poll);
          setProgress(100);
          setStatusMessage('Complete!');
          
          setTimeout(() => {
            setIsLoading(false);
            
            if (status.result.success) {
              // Fetch the scraped data from backend and save to context
              fetchAndSaveData(status.result.file, status.result.students);
            } else {
              toast({
                title: 'Scraping failed',
                description: status.result.error || 'Unknown error',
                variant: 'destructive'
              });
              setProgress(0);
              setStatusMessage('');
            }
          }, 500);
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsLoading(false);
          setProgress(0);
          setStatusMessage('');
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

  const fetchAndSaveData = async (filename: string, studentCount: number) => {
    try {
      // Fetch the latest scraped data (backend already transforms to frontend format)
      const response = await fetch(`${API_URL}/api/students`, {
        headers: apiHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }

      const data = await response.json();
      
      // Backend already returns data in correct format
      const parsedStudents = data.students || [];

      // Save to context (which auto-saves to localStorage)
      setStudentData(parsedStudents);

      toast({
        title: 'Scraping complete!',
        description: `Successfully scraped ${studentCount} students. Redirecting to dashboard...`,
      });

      // Call success callback
      onScrapeSuccess?.();

      // Now redirect to dashboard with data in context
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setProgress(0);
      setStatusMessage('');
      
      toast({
        title: 'Error loading data',
        description: error instanceof Error ? error.message : 'Failed to load scraped data',
        variant: 'destructive'
      });
    }
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

          {/* Progress indicator when scraping */}
          {isLoading && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  {progress === 100 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">{statusMessage}</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{statusMessage}</span>
                    </>
                  )}
                </span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                This may take 2-5 minutes. Please don't close this page.
              </p>
            </div>
          )}

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
