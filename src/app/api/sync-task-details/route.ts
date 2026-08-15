import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, details } = await req.json();

    if (!taskId || !details) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify task belongs to user
    const task = await prisma.bootcampTask.findFirst({
      where: {
        id: taskId,
        day: {
          userId: user.id
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updated = await prisma.bootcampTask.update({
      where: { id: taskId },
      data: {
        details
      }
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    console.error("Error syncing task details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
