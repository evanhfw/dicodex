import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useStudentData } from '@/contexts/StudentDataContext';
import { parseStudentHTML, readFileAsText, validateFileSize } from '@/lib/htmlParser';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedHtml, setPastedHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setStudentData } = useStudentData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.html')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an HTML file (.html)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleParse = async () => {
    setIsLoading(true);

    try {
      let htmlContent = '';

      // Get HTML content from file or textarea
      if (selectedFile) {
        htmlContent = await readFileAsText(selectedFile);
      } else if (pastedHtml) {
        htmlContent = pastedHtml;
      } else {
        toast({
          title: 'No input',
          description: 'Please upload a file or paste HTML content',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Parse the HTML
      const result = parseStudentHTML(htmlContent);

      if (result.success && result.students) {
        // Save to context
        setStudentData(result.students);

        // Show success message
        toast({
          title: 'Success!',
          description: `Successfully parsed data for ${result.students.length} students`,
        });

        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        // Show error message
        toast({
          title: 'Parsing failed',
          description: result.error || 'Failed to parse HTML',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error parsing HTML:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canParse = (selectedFile !== null || pastedHtml.trim().length > 0) && !isLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-card-foreground">
          <span className="text-primary">Coding Camp</span> — Upload Student Data
        </h1>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Student Data</CardTitle>
            <CardDescription>
              Upload an HTML file or paste HTML content to import student progress data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="paste">Paste HTML</TabsTrigger>
              </TabsList>

              {/* Tab 1: Upload File */}
              <TabsContent value="upload" className="space-y-4">
                <div
                  className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drag and drop your HTML file here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-muted p-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="ml-2 h-6 px-2"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Paste HTML */}
              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste your HTML content here..."
                    value={pastedHtml}
                    onChange={(e) => setPastedHtml(e.target.value)}
                    className="min-h-[300px] font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {pastedHtml.length.toLocaleString()} characters
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Parse Button */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleParse}
                disabled={!canParse}
                className="min-w-[200px]"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Parse & View Dashboard
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Upload an HTML file containing student progress data or paste the HTML content</li>
              <li>The HTML should contain student information with names, status, and course progress</li>
              <li>Click "Parse & View Dashboard" to process the data</li>
              <li>You will be automatically redirected to the dashboard with the imported data</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UploadPage;
