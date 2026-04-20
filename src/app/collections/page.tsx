"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card";
import { Skeleton } from "@/component/ui/skeleton";
import axios from "axios";

import { Badge } from "@/component/ui/badge"; 

type Collection = {
  prompts?: any[];
  id: number;
  name: string;
  description: string;
  visibility: string;
  _count?: {
    prompts: number;
  };
};

type Prompt = {
  id: number;
  name: string;
  description: string;
}

function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-1.5 mt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="pt-3 border-t border-border flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

 function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold">{collection.name}</CardTitle>
            {collection.visibility === 'PUBLIC' && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">Public</Badge>
            )}
          </div>
          <CardDescription>{collection.description}</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </Link>
  );
}



export default function CollectionsPage() {

    useEffect(() => {
    const fetchData = async () => {
      try {
        const [colRes, promptRes] = await Promise.all([
          axios.get<Collection[]>("/api/collections"),
          axios.get<Prompt[]>("/api/prompts")
        ]);
        setCollections(colRes.data || []);
        setPrompts(promptRes.data || []);
      } catch (err) {
        console.error("Failed to load settings data:", err);
      } finally {
        setLoading(false);
      }
    };
        fetchData();
  }, []);


  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);


   const isLoading = loading || setLoading;

  return (

    <div className="pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Folder className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Collections
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            จัดกลุ่ม prompts เพื่อแชร์ให้ทีม
          </p>
        </div>

      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Folder className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">
            ยังไม่มี Collection
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Link key={col.id} href={`/collections/${col.id}`}>
              <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">{col.name}</CardTitle>
                    {col.visibility === 'PUBLIC' && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">Public</Badge>
                    )}
                  </div>
                  <CardDescription>{col.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-2">
                        <Folder className="w-4 h-4" />
                        {col._count?.prompts || 0} Prompts
                      </p>
                    </div>
                  </div>
                </CardContent>

               </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
