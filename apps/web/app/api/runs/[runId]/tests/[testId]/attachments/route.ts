import { minioClient } from "@/lib/minio";

export async function POST(request: Request, { params }: { params: { runId: string; testId: string } }) {
  const formData = await request.formData();
  const files = formData.get("files") as Blob | null;

  if (files && files instanceof File) {
    const buffer = Buffer.from(await files.arrayBuffer());

    // if the filename has no extension, derive it from the contentType
    let fileName = files.name;
    if (fileName.split(".").length === 1) {
      fileName = fileName + "." + files.type.split("/").pop();
    }

    // * may need to await?
    minioClient.putObject("repertoire", `${params.runId}/${params.testId}/${fileName}`, buffer);
  }

  return new Response("File uploaded", {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
