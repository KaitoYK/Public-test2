"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { 
  Copy, 
  Check
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Badge } from "@/component/ui/badge";
import { Skeleton } from "@/component/ui/skeleton";

type Version = {
  id: number;
  version_no: number;
  template_content: string;
  status: string;
  created_at: string;
  promptVariables: {
    id: number;
    name: string;
    type: string;
    description: string | null;
  }[];
};

type PromptDetail = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  latest_version_no: number;
  updated_at: string;
  category: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
  versions: Version[];
  recommended_model: string | null;
};

export default function PromptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    axios.get<PromptDetail>(`/api/prompts/${id}`)
      .then(res => setPrompt(res.data))
      .catch(err => setError(err.response?.data?.error || "Failed to load prompt details"))
      .finally(() => setLoading(false));
  }, [id]);

  const copyToClipboard = () => {
    if (!prompt?.versions[0]?.template_content) return;
    navigator.clipboard.writeText(prompt.versions[0].template_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <Badge variant="success">Published</Badge>;
      case "DRAFT": return <Badge variant="secondary">Draft</Badge>;
      case "REVIEW": return <Badge variant="warning">Review</Badge>;
      case "ARCHIVED": return <Badge variant="outline">Archived</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="pt-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-2">ไม่พบข้อมูล Prompt</h2>
          <p>{error}</p>
        </div>
        <Button asChild><Link href="/prompts">กลับไปที่คลัง Prompt</Link></Button>
      </div>
    );
  }

  const latestVersion = prompt.versions[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">

      <main className="py-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">{prompt.title}</h1>
            <p className="text-sm text-muted-foreground">
              {prompt.description || "ไม่มีรายละเอียดระบุไว้"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="#">Use Prompt</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/prompts/${id}/edit`}>Edit</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-background pb-2">
                <CardTitle className="text-base font-semibold">Template</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-secondary relative p-4 rounded-md border text-sm font-mono whitespace-pre-wrap text-foreground">
                  {latestVersion?.template_content || "No content"}
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground" onClick={copyToClipboard} title="Copy">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="bg-background pt-4 pb-2">
                <CardTitle className="text-base font-semibold">Examples</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-sm text-muted-foreground p-2">
                  sample input / output จะแสดงตรงนี้
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="bg-background pt-4 pb-2">
                <CardTitle className="text-base font-semibold">Version History</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-sm text-muted-foreground p-2">
                  v1, v2, v3...
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Area - Right Column */}
          <div className="space-y-6">
            
            <Card className="border-border shadow-sm">
              <CardHeader className="pt-4 pb-4 border-b">
                <CardTitle className="text-base font-semibold">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-[100px_1fr] items-baseline">
                  <div className="text-sm font-semibold">Category:</div>
                  <div className="text-sm">{prompt.category ? prompt.category.name : "-"}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-baseline">
                  <div className="text-sm font-semibold">Status:</div>
                  <div className="text-sm capitalize">{prompt.status === 'PUBLISHED' ? 'Approved' : prompt.status.toLowerCase()}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-baseline">
                  <div className="text-sm font-semibold">Model:</div>
                  <div className="text-sm">{prompt.recommended_model || "gpt-4.1"}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-baseline">
                  <div className="text-sm font-semibold">Owner:</div>
                  <div className="text-sm">Admin</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pt-4 pb-4 border-b">
                <CardTitle className="text-base font-semibold">Variables</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {latestVersion?.promptVariables && latestVersion.promptVariables.length > 0 ? (
                  <ul className="space-y-3">
                    {latestVersion.promptVariables.map(v => (
                      <li key={v.id} className="text-sm">
                        <div className="font-mono text-foreground">{v.name}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">ไม่มีตัวแปร</p>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      </main>
    </div>
  );
}
