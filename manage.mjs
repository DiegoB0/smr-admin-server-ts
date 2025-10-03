import { execSync } from "node:child_process";
import * as dotenv from "dotenv";
import { Command } from "commander";

dotenv.config();

function run(cmd, success, fail) {
  try {
    execSync(cmd, { stdio: "inherit", shell: true });
    console.log(`✅ ${success}`);
  } catch (err) {
    console.error(`❌ ${fail}`);
    process.exit(1);
  }
}

function buildBackendCached() {
  run(
    "docker compose build postre_backend",
    "Backend image built (cached).",
    "Failed to build backend image."
  );
}

function buildBackendNoCache() {
  run(
    "docker compose build --no-cache postre_backend",
    "Backend image built (no cache).",
    "Failed to build backend image (no cache)."
  );
}

function upBackendCached() {
  run(
    "docker compose up -d --no-deps postre_backend",
    "Backend started (cached).",
    "Failed to start backend."
  );
}

function upBackendNoCache() {
  buildBackendNoCache();
  run(
    "docker compose up -d --no-deps --force-recreate postre_backend",
    "Backend (re)started with fresh image.",
    "Failed to (re)start backend with fresh image."
  );
}

function runDockerComposeUp() {
  run(
    "docker compose up --build -d",
    "Docker Compose started successfully.",
    "Failed to start Docker Compose."
  );
}

function runDockerComposeUpNoCache() {
  run(
    "docker compose build --no-cache",
    "Docker images rebuilt without cache.",
    "Failed to rebuild images without cache."
  );

  run(
    "docker compose up -d --force-recreate",
    "Containers (re)started with fresh images.",
    "Failed to (re)start containers."
  );
}

function stopDockerCompose(removeVolumes = false) {
  const command = removeVolumes
    ? "docker compose down --volumes"
    : "docker compose down";

  run(
    command,
    "Docker Compose stopped successfully.",
    "Failed to stop Docker Compose."
  );
}

function buildDockerImage() {
  run(
    "docker compose build",
    "Docker image built successfully.",
    "Failed to build Docker image."
  );
}

function buildDockerImageNoCache() {
  run(
    "docker compose build --no-cache",
    "Docker image built successfully (no cache).",
    "Failed to build Docker image (no cache)."
  );
}

function pruneDockerImages() {
  run(
    "docker image prune -f",
    "Unused Docker images removed.",
    "Failed to prune Docker images."
  );
}

function seedDatabase(file = "seed.sql") {
  const dbUser = process.env.DB_USERNAME || "postgres";
  const dbName = process.env.DB_NAME || "postre_docker_v2";
  const dbHost = process.env.DB_HOST || "postgres";
  const dbPort = process.env.DB_PORT || "5432";

  console.log(
    `[DEBUG] host=${dbHost} port=${dbPort} user=${dbUser} db=${dbName}`
  );

  if (dbHost === "localhost" || dbHost === "127.0.0.1") {
    run(
      `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ./seed/${file}`,
      `Database seeded locally with ${file}.`,
      `Failed to seed database locally with ${file}.`
    );
  } else {
    const container = "postgres";
    run(
      `docker exec -i ${container} psql -U ${dbUser} -d ${dbName} -f /seed/${file}`,
      `Database seeded in docker with ${file}.`,
      `Failed to seed database in docker with ${file}.`
    );
  }
}

function backupDatabase() {
  const dbUser = process.env.DB_USERNAME || "postgres";
  const dbName = process.env.DB_NAME || "postre_docker_v2";
  const filename = `backup_${dbName}_$(date +%Y%m%d%H%M%S).sql`;

  run(
    `docker exec postgres pg_dump -U ${dbUser} ${dbName} > ./backups/${filename}`,
    `Backup created successfully: ${filename}`,
    "Failed to create database backup."
  );
}

const program = new Command();

program
  .name("docker-runner")
  .description("Manage Docker Compose and seed DB")
  .version("1.0.0");

program.command("up").action(runDockerComposeUp);
program.command("up:nocache").action(runDockerComposeUpNoCache);

program.command("build:backend").action(buildBackendCached);
program.command("build:backend:nocache").action(buildBackendNoCache);
program.command("up:backend").action(upBackendCached);
program.command("up:backend:nocache").action(upBackendNoCache);

program
  .command("down")
  .option("--remove-volumes", "Remove volumes when stopping", false)
  .action((opts) => stopDockerCompose(!!opts.removeVolumes));

program.command("down:volumes").action(() => stopDockerCompose(true));

program.command("build").action(buildDockerImage);
program.command("build:nocache").action(buildDockerImageNoCache);

program.command("prune").action(pruneDockerImages);

program
  .command("seed")
  .option("--file <file>", "SQL file to run", "seed.sql")
  .action((opts) => seedDatabase(opts.file));

program.command("backup").action(backupDatabase);

program.parse(process.argv);
