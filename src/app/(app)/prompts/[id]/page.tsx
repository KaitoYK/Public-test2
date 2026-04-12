"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  Play, 
  Settings2,
  ShieldAlert
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
          <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
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
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild className="-ml-4">
            <Link href="/prompts"><ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ (Back to Prompts)</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-4 w-4" /> ลองรัน Prompt
            </Button>
            <Button size="sm" asChild>
              <Link href={`/prompts/${id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" /> แก้ไข / สร้าง Draft ใหม่
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {getStatusBadge(prompt.status)}
                <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
                  v{prompt.latest_version_no}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                  <Clock className="h-3 w-3" />
                  อัปเดต {new Date(prompt.updated_at).toLocaleDateString('th-TH')}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{prompt.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {prompt.description || "ไม่มีรายละเอียดระบุไว้"}
              </p>
            </div>

            <Card className="border-primary/20 shadow-sm relative overflow-hidden">
              <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold font-mono flex items-center">
                  Template Content
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 -mr-2" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="p-6 overflow-x-auto text-sm sm:text-base font-mono whitespace-pre-wrap leading-relaxed text-foreground bg-card">
                  {latestVersion?.template_content || "No content"}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Metadata Area */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">หมวดหมู่ & แท็ก</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Category</div>
                  {prompt.category ? (
                    <Badge variant="outline" className="text-sm">{prompt.category.name}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.length > 0 ? prompt.tags.map(tag => (
                      <Badge key={tag.id} variant="secondary" className="font-normal">#{tag.name}</Badge>
                    )) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Settings2 className="h-4 w-4" /> ตัวแปร (Variables)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestVersion?.promptVariables && latestVersion.promptVariables.length > 0 ? (
                  <ul className="space-y-3">
                    {latestVersion.promptVariables.map(v => (
                      <li key={v.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div className="font-mono font-semibold text-primary mb-1">
                          {`{{${v.name}}}`}
                        </div>
                        <div className="text-muted-foreground text-xs">{v.description || "No description"}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Prompt นี้ไม่มีการใช้ตัวแปร</p>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full text-destructive border-transparent bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-colors">
              <Trash2 className="mr-2 h-4 w-4" /> ลบ Prompt ทิ้ง
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
