import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

/**
 * GET /api/dashboard/stats
 * Return summary stats for the current user's dashboard.
 *
 * Response:
 *   totalPrompts       - total non-deleted prompts owned by user
 *   byStatus           - { DRAFT, REVIEW, PUBLISHED, REJECTED, ARCHIVED }
 *   recentPrompts      - 5 most recently updated prompts
 *   totalCategories    - total categories
 *   totalTags          - total tags
 */
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const baseWhere = { owner_id: userId, deleted_at: null };

    const [
      totalPrompts,
      draftCount,
      reviewCount,
      publishedCount,
      rejectedCount,
      archivedCount,
      recentPrompts,
      totalCategories,
      totalTags,
    ] = await Promise.all([
      prisma.prompts.count({ where: baseWhere }),
      prisma.prompts.count({ where: { ...baseWhere, status: "DRAFT" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "REVIEW" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "PUBLISHED" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "REJECTED" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "ARCHIVED" } }),
      prisma.prompts.findMany({
        where: baseWhere,
        orderBy: { updated_at: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          latest_version_no: true,
          updated_at: true,
          category: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.categories.count(),
      prisma.tags.count(),
    ]);

    return NextResponse.json({
      totalPrompts,
      byStatus: {
        DRAFT: draftCount,
        REVIEW: reviewCount,
        PUBLISHED: publishedCount,
        REJECTED: rejectedCount,
        ARCHIVED: archivedCount,
      },
      recentPrompts,
      totalCategories,
      totalTags,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
