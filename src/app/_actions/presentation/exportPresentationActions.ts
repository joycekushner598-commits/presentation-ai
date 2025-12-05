"use server";

import { convertPlateJSToPPTX } from "@/components/presentation/utils/exportToPPT";
import { type PlateSlide } from "@/components/presentation/utils/parser";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function exportPresentation(
  presentationId: string,
  fileName?: string,
  theme?: Partial<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    heading: string;
    muted: string;
  }>,
) {
  try {
    const skipAuth = process.env.SKIP_AUTH === "true";
    let userId = "development-user";

    if (!skipAuth) {
      const session = await auth();
      if (!session?.user) {
        return { success: false, error: "Unauthorized" };
      }
      userId = session.user.id;
    }

    // Here you would fetch the presentation data from your database
    // This is a placeholder - implement actual data fetching based on your data model
    const presentationData = await fetchPresentationData(
      presentationId,
      userId,
    );

    console.log("[Export] Presentation data:", {
      id: presentationData.id,
      title: presentationData.title,
      slidesCount: presentationData.slides?.length ?? 0,
    });

    if (!presentationData.slides || presentationData.slides.length === 0) {
      console.error("[Export] No slides found for presentation:", presentationId);
      return { success: false, error: "No slides found in presentation" };
    }

    // Generate the PPT file (ArrayBuffer)
    const arrayBuffer = await convertPlateJSToPPTX(
      { slides: presentationData.slides },
      theme,
    );

    // Convert ArrayBuffer to Base64 string for transmission to the client
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Return base64 data so client can download it
    return {
      success: true,
      data: base64,
      fileName: `${fileName ?? "presentation"}.pptx`,
    };
  } catch (error) {
    console.error("[Export] Error exporting presentation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to export presentation" };
  }
}

// Helper function to fetch presentation data
async function fetchPresentationData(presentationId: string, userId: string) {
  const skipAuth = process.env.SKIP_AUTH === "true";

  // In development mode, don't filter by userId
  const presentation = await db.baseDocument.findFirst({
    where: skipAuth
      ? { id: presentationId }
      : { id: presentationId, userId: userId },
    include: { presentation: true },
  });

  return {
    id: presentation?.id,
    title: presentation?.title,
    slides: (
      presentation?.presentation?.content as unknown as { slides: PlateSlide[] }
    )?.slides,
  };
}
