import { Client } from "minio";

const globalForMinio = global as unknown as {
  minio: Client | undefined;
};

export const minioClient =
  globalForMinio.minio ??
  new Client({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY as string,
    secretKey: process.env.MINIO_SECRET_KEY as string,
  });

if (process.env.NODE_ENV !== "production") globalForMinio.minio = minioClient;
