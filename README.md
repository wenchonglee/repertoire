# Repertoire

Work in progress

## Contributing

### Local setup

Start both minio and mongodb instances with `docker-compose`

```sh
cd apps/web
docker-compose up
```

> This step should not be required in a later update

Go into the minio console (http://localhost:9001/access-keys) and get an access key.  
Create a `.env` file in `apps/web` with the following string

```
DATABASE_URL="mongodb://localhost:27017/repertoire?directConnection=true"
MINIO_ACCESS_KEY="YOUR_ACCESS_KEY"
MINIO_SECRET_KEY="YOUR_SECRET_KEY"
```

Now you should be able to run `pnpm dev` in the root directory and run tests in the `packages/reporter` folder
