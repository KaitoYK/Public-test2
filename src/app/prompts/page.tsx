"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Search } from "lucide-react";

import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Badge } from "@/component/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { Skeleton } from "@/component/ui/skeleton";

type Category = { id: number; name: string };

type Prompt = {
  id: number;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "REVIEW";
  latest_version_no: number;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
  recommended_model: string | null;
};

type ApiResponse = {
  data: Prompt[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function PromptsList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModel, setFilterModel] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append("q", searchQuery);
      if (filterCategory !== "all") searchParams.append("categoryId", filterCategory);
      if (filterStatus !== "all") searchParams.append("status", filterStatus.toUpperCase());
      if (filterModel !== "all") searchParams.append("model", filterModel); // Mock support for model filtering if backend supports

      const [promptsRes, catsRes] = await Promise.all([
        axios.get<ApiResponse>(`/api/prompts?${searchParams.toString()}`),
        categories.length === 0 ? axios.get<Category[]>("/api/categories") : Promise.resolve({ data: categories }),
      ]);

      setPrompts(promptsRes.data.data);
      if (categories.length === 0) setCategories(catsRes.data || []);
    } catch (err) {
      console.error("Failed to load prompts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, filterCategory, filterStatus, filterModel]);

  const getStatusText = (status: Prompt["status"]) => {
    switch (status) {
      case "PUBLISHED": return "APPROVED";
      default: return status;
    }
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prompts</h1>
          <p className="mt-1 text-sm text-muted-foreground">ค้นหา จัดการ และเปิดใช้งาน prompt ในระบบ</p>
        </div>
        <Link href="/prompts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        </Link>
      </div>

      {/* แถบตัวกรอง */}
      <div className="mt-6 rounded-lg border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              className="pl-9 h-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">DRAFT</SelectItem>
              <SelectItem value="review">REVIEW</SelectItem>
              <SelectItem value="published">APPROVED</SelectItem>
              <SelectItem value="archived">ARCHIVED</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All Models" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
              <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
              <SelectItem value="claude-3.5-sonnet">claude-3.5-sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ตารางแสดงรายการ prompts */}
      <div className="mt-6 rounded-lg border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-medium">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Title</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Category</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Status</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Model</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-48" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-32" /></td>
                  </tr>
                ))
              ) : prompts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground border-dashed">
                    ไม่พบ prompt ที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                prompts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-5">
                      <Link href={`/prompts/${p.id}`} className="text-foreground hover:text-primary transition-colors block">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-5 py-5 text-muted-foreground">
                      {p.category ? p.category.name : "-"}
                    </td>
                    <td className="px-5 py-5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                      {getStatusText(p.status)}
                    </td>
                    <td className="px-5 py-5 text-muted-foreground">
                      {p.recommended_model || "-"}
                    </td>
                    <td className="px-5 py-5 text-muted-foreground">
                      {new Date(p.updated_at).toISOString().split('T')[0]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
