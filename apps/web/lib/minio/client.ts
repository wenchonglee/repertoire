import { Client } from "minio";

const globalForMinio = globalThis as unknown as {
  minio: Client | undefined;
};

export const minioClient =
  globalForMinio.minio ??
  new Client({
    endPoint: process.env.MINIO_ENDPOINT as string,
    port: Number(process.env.MINIO_PORT as string),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY as string,
    secretKey: process.env.MINIO_SECRET_KEY as string,
  });

if (process.env.NODE_ENV !== "production") globalForMinio.minio = minioClient;
