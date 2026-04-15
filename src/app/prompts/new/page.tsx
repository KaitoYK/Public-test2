"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { LayoutGrid, ArrowLeft, Save, ShieldAlert, Sparkles } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import { Textarea } from "@/component/ui/textarea";

type Category = { id: number; name: string };

type VariableConfig = {
  name: string;
  type: string;
  label: string;
  description: string;
};

export default function CreatePromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [templateContent, setTemplateContent] = useState("");
  
  // Variables State
  const [variables, setVariables] = useState<VariableConfig[]>([]);
  
  // Categories lookup
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories on mount
    axios.get<Category[]>("/api/categories")
      .then(res => setCategories(res.data || []))
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  // Detect variables from template {{var_name}}
  useEffect(() => {
    const rawMatches = Array.from(templateContent.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g));
    const detectedNames = Array.from(new Set(rawMatches.map(m => m[1])));

    setVariables(prev => {
      // Keep existing configurations, add new ones, remove deleted ones
      const nextVars = detectedNames.map(name => {
        const existing = prev.find(v => v.name === name);
        if (existing) return existing;
        return { name, type: "TEXT", label: name, description: "" };
      });
      return nextVars;
    });
  }, [templateContent]);

  const updateVariable = (name: string, field: keyof VariableConfig, value: string) => {
    setVariables(prev => prev.map(v => v.name === name ? { ...v, [field]: value } : v));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !templateContent) {
      setError("กรุณากรอกหัวข้อ และเนื้อหาของ Prompt");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        description: description || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tags,
        templateContent,
        variables: variables.length > 0 ? variables : undefined
      };

      const res = await axios.post("/api/prompts", payload);
      router.push(`/prompts/${res.data.id}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("ไม่สามารถสร้าง Prompt ได้ เกิดข้อผิดพลาด");
      }
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <main className="py-4">
        <Button variant="ghost" className="mb-6 -ml-4" asChild>
          <Link href="/prompts"><ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ (Back to Prompts)</Link>
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">สร้าง Prompt ใหม่</h1>
              <p className="text-muted-foreground mt-1">ตั้งค่าชื่อ และโครงสร้าง Prompt ให้พร้อมสำหรับการใช้งาน</p>
            </div>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "กำลังบันทึก..." : "บันทึกและสร้าง"}
            </Button>
          </div>

          {error && (
             <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 font-medium flex items-center gap-2">
               <ShieldAlert className="h-5 w-5" /> {error}
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลทั่วไป (General Info)</CardTitle>
                  <CardDescription>รายละเอียดพื้นฐานที่จะช่วยให้คุณจำได้ว่า Prompt นี้มีไว้ทำอะไร</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">ชื่อ Prompt <span className="text-destructive">*</span></Label>
                    <Input 
                      id="title" 
                      placeholder="เช่น: เขียนเรซูเม่สมัครงาน, สรุปบทความ..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">รายละเอียด (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="อธิบายสั้นๆ ว่า Prompt นี้ใช้งานยังไง..." 
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">หมวดหมู่</Label>
                      <div className="relative">
                        <select 
                          id="category"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                        >
                          <option value="">-- ไม่ระบุ --</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (พิมพ์แล้วกด Enter)</Label>
                      <Input 
                        id="tags" 
                        placeholder="เพิ่ม tag..." 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map(t => (
                            <div key={t} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">
                              {t}
                              <button type="button" onClick={() => removeTag(t)} className="text-muted-foreground hover:text-foreground">
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>เนื้อหาคำสั่ง (Template Content)</CardTitle>
                  <CardDescription>รูปแบบคำสั่ง Prompt พร้อมใส่ตัวแปร (เช่น {"{{name}}"}, {"{{topic}}"})</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 flex-1">
                  <Textarea 
                    id="templateContent" 
                    placeholder="พิมพ์ข้อความ prompt ของคุณที่นี่..." 
                    className="font-mono text-sm leading-relaxed flex-1 min-h-[250px]"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    required
                  />

                  {variables.length > 0 && (
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Sparkles className="h-4 w-4 text-primary" /> ตัวแปรที่ตรวจพบ ({variables.length})
                      </div>
                      <div className="space-y-4">
                        {variables.map(v => (
                          <div key={v.name} className="grid grid-cols-[1fr_2fr] gap-4 items-start border-l-2 border-primary/50 pl-3">
                            <div>
                              <div className="font-mono text-sm font-bold text-primary mb-2">{"{{"}{v.name}{"}}"}</div>
                              <select 
                                className="w-full text-xs h-8 rounded-md border border-input bg-background px-2"
                                value={v.type}
                                onChange={(e) => updateVariable(v.name, "type", e.target.value)}
                              >
                                <option value="TEXT">ข้อความ (TEXT)</option>
                                <option value="TEXTAREA">ข้อความยาว (TEXTAREA)</option>
                                <option value="NUMBER">ตัวเลข (NUMBER)</option>
                                <option value="BOOLEAN">ใช่/ไม่ใช่ (BOOLEAN)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Input 
                                placeholder="ชื่อที่แสดง (Label)" 
                                className="h-8 text-xs" 
                                value={v.label} 
                                onChange={(e) => updateVariable(v.name, "label", e.target.value)} 
                              />
                              <Input 
                                placeholder="คำอธิบาย (Description)" 
                                className="h-8 text-xs" 
                                value={v.description} 
                                onChange={(e) => updateVariable(v.name, "description", e.target.value)} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
