# AI Image Generation App

A small full-stack AI illustration generator built as part of a Full-Stack Engineer coding assignment.

The main idea is simple: the user enters a prompt, optionally chooses a style, and submits it. The API saves the request and puts a job on a queue instead of waiting for image generation to finish. A separate worker picks the job up, calls the image-generation provider, saves the result, and the frontend polls for the final status.

## Features

- Prompt-based image generation
- Optional illustration style: Storybook, Cartoon, Watercolor
- Asynchronous image generation with BullMQ + Redis
- Separate worker process
- SQLite persistence
- Generation status: `queued`, `processing`, `completed`, `failed`
- Polling from the frontend
- Generation history
- Generated images stored locally and served by the backend
- Retry handling for failed worker jobs
- Docker Compose setup for the frontend, backend, Redis, and worker

## Technology Stack

- React + TypeScript + Vite
- Tailwind CSS
- Node.js + Express
- SQLite with `better-sqlite3`
- BullMQ + Redis
- Docker / Docker Compose
- Cloudflare Worker + Workers AI for image generation

## Project Structure

```text
AI-Image-Generator/
├── back/
│   └── src/
│       ├── db/
│       ├── queue/
│       ├── routes/
│       ├── services/
│       └── workers/
├── front/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Running Locally

### Requirements

- Docker Desktop
- A Cloudflare image-generation API key for the image provider used by the project

### 1. Clone the repository

```bash
git clone https://github.com/Merouanos/AI-Image-Generator.git
cd AI-Image-Generator
```

### 2. Create the environment file

Create the environment file used by the backend/worker and add the required values:

```env
IMAGE_PROVIDER_URL=https://<your-image-provider-url>
IMAGE_API_KEY=<your-secret-key>
```

Do not commit the real `.env` file or any API keys.

The repository contains `.env.example` as a template.

### 3. Start the application

```bash
docker compose up --build
```

Docker Compose starts four services:

```text
frontend
backend
redis
worker
```

The frontend is available at:

```text
http://localhost:5173
```

The backend API is available at:

```text
http://localhost:3000
```

The database is created automatically from the SQL schema when the backend starts.

## How the Application Works

The full request flow is:

```text
Browser
   |
   v
React / Vite
   |
   | POST /api/generations
   v
Express API
   |
   +----> SQLite
   |       status = queued
   |
   +----> BullMQ
              |
              v
            Redis
              |
              v
            Worker
              |
              v
       Image Generation API
              |
              v
        Save generated image
              |
              v
           SQLite
        status = completed
              |
              v
       Frontend polling
              |
              v
        Display the image
```

### Backend API

#### Create a generation

```http
POST /api/generations
Content-Type: application/json
```

Example:

```json
{
  "prompt": "A small red fox reading a book under a tree.",
  "style": "storybook"
}
```

The API validates the request, stores the generation with `queued` status, adds a BullMQ job, and returns the generation information.

#### Get one generation

```http
GET /api/generations/:id
```

This is used by the frontend polling flow to get the latest status and result.

#### List generations

```http
GET /api/generations
```

This returns the stored generation history from SQLite.

## Image Generation Provider

I use a Cloudflare Worker in front of Cloudflare Workers AI as the real image-generation provider.

I chose it mainly because I wanted a real external image-generation API without adding a paid API to the assignment. The Worker exposes a small HTTP endpoint and keeps the provider-specific details outside of the main application.

The backend calls the provider from the worker process, receives the generated image bytes, saves the image under `back/data/Images`, and stores a browser-accessible image path in SQLite.

One limitation is that the provider depends on the availability and limits of the Cloudflare Workers AI account being used. This is fine for the assignment, but for a production application I would also think about provider quotas, storage, observability, and a fallback provider.

## Error Handling

The application handles the main failure cases at different levels.

### Request validation

The backend rejects invalid requests such as:

- Empty prompts
- Invalid styles
- Invalid generation IDs
- Missing generations

These are returned as client errors instead of letting invalid data reach the worker.

### Image API / worker failures

If image generation fails, the worker records the generation as `failed` and stores an internal error message in the database. The frontend does not show provider-specific or internal errors; it shows a simple message such as:

> Image generation failed. Please try again.

This keeps implementation details and provider errors away from the user interface.

### Polling failures

The frontend polls the generation endpoint while a job is running. If a polling request temporarily fails, the frontend shows a retry message and tries again instead of immediately giving up.

## Retry Handling

I use BullMQ retries for failed generation jobs.

Current configuration:

- Maximum attempts: 3
- Backoff: exponential

The idea is:

```text
Attempt 1
   |
   | failure
   v
wait
   |
   v
Attempt 2
   |
   | failure
   v
wait
   |
   v
Attempt 3
   |
   | failure
   v
mark generation as failed
```

Retries are useful for transient problems such as temporary provider outages, rate limiting, network errors, and server-side failures.

I would not retry permanent client/configuration problems such as an invalid request or invalid API credentials. The current assignment implementation keeps the retry mechanism simple at the BullMQ level; in a production version I would classify provider errors more explicitly so only transient failures are retried.

## Generation History

Generation records are stored in SQLite, so the frontend does not rely on React state for persistence.

When the user opens the history section, the frontend calls:

```http
GET /api/generations
```

This means refreshing the application does not remove previously generated records.

Generated images are stored locally under:

```text
back/data/Images/
```

and served by Express through the `/images` route.

The generated image files and SQLite database are ignored by Git because they are runtime data, not source code.

## Engineering Decisions

### 1. React + Vite for the frontend

**Decision:** React with Vite and TypeScript.

**Why:** I already had experience with React and TypeScript, and Vite gives a simple and fast development setup for a small frontend.

**Alternative:** Next.js.

**Trade-off:** Next.js would give me more built-in application features, but I did not need them for this assignment and it would add more framework complexity.

### 2. SQLite for persistence

**Decision:** SQLite with `better-sqlite3`.

**Why:** The application only needs a small amount of relational data, and SQLite keeps the setup simple. It also works well with Docker for a local assignment.

**Alternative:** PostgreSQL.

**Trade-off:** PostgreSQL would be a better fit for a larger production system and multiple application instances, but SQLite is much easier to run locally and is sufficient for the current scale.

### 3. BullMQ + Redis for background jobs

**Decision:** BullMQ with Redis.

**Why:** Image generation is a long-running operation, so it should not block the HTTP request. BullMQ gives me a clear queue/worker abstraction, while Redis keeps the jobs outside of the API process.

**Alternative:** A database-backed queue or a custom in-memory queue.

**Trade-off:** Redis adds another service to the application, but it gives a much more reliable job system than keeping jobs in a JavaScript array in memory.

### 4. Polling instead of WebSockets

**Decision:** Simple polling using `GET /api/generations/:id`.

**Why:** Generation jobs are relatively infrequent and the assignment does not require real-time sockets. Polling is simple and easy to reason about.

**Alternative:** WebSockets or Server-Sent Events.

**Trade-off:** Polling creates repeated HTTP requests, but it keeps the implementation much simpler for this application.

### 5. Provider integration through a separate service

**Decision:** Keep image-provider logic in `imageGenerationService.ts` instead of putting the HTTP request directly in the worker.

**Why:** The worker should mainly orchestrate the job lifecycle. Keeping provider-specific code in its own service makes it easier to replace the provider later.

**Alternative:** Call the provider directly from the worker.

**Trade-off:** The extra service is a small amount of structure, but it keeps responsibilities separated and makes provider changes easier.

## System Design Questions

### 1. Why use a background queue?

Image generation can take much longer than a normal API request. If the API waited for the image provider before responding, the HTTP request would stay open for the whole generation time.

Instead, the API saves the generation, adds a job to the queue, and returns `queued` quickly. The worker handles the slow operation separately.

### 2. Multiple Workers

If request volume increased, I could run multiple copies of the worker service. BullMQ workers can consume jobs from the same queue, so multiple workers could process different generations concurrently.

I would also consider provider rate limits and worker concurrency so that scaling the workers does not simply overload the image provider.

### 3. Duplicate Processing

If two workers processed the same generation at the same time, they could both call the image provider and potentially overwrite the same database record or create duplicate work.

I would reduce this risk by relying on BullMQ's job locking/worker coordination, keeping job processing idempotent, and making the database update safe. For a larger system, I would also consider explicit job IDs, uniqueness rules, and additional locking where needed.

### 4. Changing the Image Provider

I already keep provider-specific logic in `imageGenerationService.ts`, so the rest of the application does not need to know how the provider works.

If the application grew, I would make that boundary more explicit with an interface such as:

```ts
interface ImageGenerator {
  generate(prompt: string): Promise<ImageResult>;
}
```

Then I could have different implementations such as:

```text
CloudflareImageGenerator
ProviderAImageGenerator
ProviderBImageGenerator
```

The worker would only depend on the interface, not on a specific provider.

### 5. Application Growth

Going from 100 to 1000 generations per day is not a huge architectural jump, but I would review the parts that can become bottlenecks first:

1. Image-provider rate limits and cost/credits
2. Worker count and concurrency
3. Redis reliability and queue depth
4. Database performance and whether SQLite should be replaced with PostgreSQL
5. Image storage, because storing files on the application filesystem would not scale well across multiple servers
6. Monitoring, logging, and failure visibility

The first major architectural change I would probably make would be moving image storage and eventually the database to infrastructure designed for multiple application instances.

## Known Limitations / Possible Improvements

This project was intentionally kept small for the three-day assignment.

Some things I would improve in a production version:

- Use object storage instead of the local filesystem for generated images
- Use PostgreSQL instead of SQLite if the application needs multiple backend instances or larger traffic
- Add stronger request validation with a schema-validation library
- Classify provider errors so only retryable failures are retried
- Add structured logging and monitoring
- Add authentication and rate limiting
- Add automated tests for the API, worker, and important frontend behavior
- Add a provider abstraction/interface so switching image providers is even easier
- Add better job observability and queue metrics
- Use a production deployment setup instead of the local Docker Compose environment

## Demo Flow

The complete expected flow is:

```text
Enter Prompt
     ↓
Choose Style
     ↓
Generate
     ↓
Generation Saved
     ↓
Job Queued
     ↓
Worker Processes Job
     ↓
Real Image API Called
     ↓
Result Saved
     ↓
Frontend Polls Status
     ↓
Frontend Shows Image
```

This is the main flow I would use for the final demo.
