"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Folder, Hash, Plus, Trash2, X, Save } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Skeleton } from "@/component/ui/skeleton";
import { Badge } from "@/component/ui/badge";
import { Input } from "@/component/ui/input";

type Category = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
};

type Tag = {
  id: number;
  name: string;
};

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagSaving, setTagSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          axios.get<Category[]>("/api/categories"),
          axios.get<Tag[]>("/api/tags")
        ]);
        setCategories(catRes.data || []);
        setTags(tagRes.data || []);
      } catch (err) {
        console.error("Failed to load settings data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCategorySaving(true);
    try {
      const res = await axios.post("/api/categories", { name: newCategoryName.trim() });
      setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create category");
    } finally {
      setCategorySaving(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setTagSaving(true);
    try {
      const res = await axios.post("/api/tags", { name: newTagName.trim() });
      setTags(prev => {
        // Prevent duplicate in UI if upsert returned existing one not already in state
        if (prev.some(t => t.id === res.data.id)) return prev;
        return [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name));
      });
      setNewTagName("");
      setIsAddingTag(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create tag");
    } finally {
      setTagSaving(false);
    }
  };

  // We omit the outer div wrapper so it takes the structure of AppLayout
  return (
    <div className="pb-20 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">จัดการข้อมูลระบบ</h1>
        <p className="text-muted-foreground mt-1">ตั้งค่าหมวดหมู่และป้ายกำกับสำหรับ Prompts ทั้งหมด</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Manager */}
        <Card className="flex flex-col h-full border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" /> หมวดหมู่ (Categories)
              </CardTitle>
              <CardDescription className="mt-1.5">จัดกลุ่ม Prompt ตามประเภทการใช้งาน</CardDescription>
            </div>
            {!isAddingCategory && (
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingCategory(true)}>
                <Plus className="h-4 w-4 mr-1" /> เพิ่ม
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {isAddingCategory && (
              <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border">
                <Input 
                  placeholder="ชื่อหมวดหมู่ใหม่..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={categorySaving}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                />
                <Button size="sm" onClick={handleCreateCategory} disabled={categorySaving || !newCategoryName.trim()}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsAddingCategory(false)} disabled={categorySaving}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : categories.length === 0 && !isAddingCategory ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                ยังไม่ได้สร้าง Category
              </div>
            ) : (
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-medium text-sm">{cat.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{cat.description || "ไม่มีรายละเอียด"}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Tags Manager */}
        <Card className="flex flex-col h-full border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-green-500" /> ป้ายกำกับ (Tags)
              </CardTitle>
              <CardDescription className="mt-1.5">จัดการ Tag ที่ใช้งานในระบบทั้งหมด</CardDescription>
            </div>
            {!isAddingTag && (
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingTag(true)}>
                <Plus className="h-4 w-4 mr-1" /> เพิ่ม
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {isAddingTag && (
              <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border">
                <Input 
                  placeholder="พิมพ์ tag ใหม่..." 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  disabled={tagSaving}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
                />
                <Button size="sm" onClick={handleCreateTag} disabled={tagSaving || !newTagName.trim()}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsAddingTag(false)} disabled={tagSaving}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-24" />
              </div>
            ) : tags.length === 0 && !isAddingTag ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                ยังไม่ได้สร้าง Tag
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="px-3 py-1 flex items-center gap-1.5 group">
                    #{tag.name}
                    <span className="cursor-pointer text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      &times;
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
