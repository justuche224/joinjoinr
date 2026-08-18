import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  eventImage: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })


    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
