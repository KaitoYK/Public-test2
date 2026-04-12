import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/tags/[id]
 * Delete a tag (ADMIN only). Removes all prompt-tag associations.
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can delete tags" }, { status: 403 });
    }

    const { id } = await params;
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    // Delete associated prompt_tags first, then the tag
    await prisma.$transaction(async (tx) => {
      await tx.prompt_tags.deleteMany({
        where: { tag_id: tagId },
      });

      await tx.tags.delete({
        where: { id: tagId },
      });
    });

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
