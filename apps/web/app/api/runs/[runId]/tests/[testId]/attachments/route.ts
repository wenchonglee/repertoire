import { minioClient } from "@/lib/minio";

type RequestContext = {
  params: {
    runId: string;
    testId: string;
  };
};

/**
 * POST /api/runs/:runId/tests/:testId/attachments
 *
 * Upload a single file for the test, the filename and content type must be set appropriately
 */
export async function POST(request: Request, context: RequestContext) {
  const { params } = context;

  const formData = await request.formData();
  const files = formData.get("files") as Blob | null;

  if (files && files instanceof File) {
    const buffer = Buffer.from(await files.arrayBuffer());

    // if the filename has no extension, derive it from the contentType
    let fileName = files.name;
    if (fileName.split(".").length === 1) {
      fileName = fileName + "." + files.type.split("/").pop();
    }

    // TODO: may need to await?
    minioClient.putObject("repertoire", `${params.runId}/${params.testId}/${fileName}`, buffer);
  }

  return new Response("File uploaded", {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}
