#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Preload nvm if available so `nvm use` works in non-interactive shells.
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
fi
if [ -s "$HOME/.nvm/bash_completion" ]; then
  # shellcheck disable=SC1090
  source "$HOME/.nvm/bash_completion"
fi

REQUIRED_NODE_VERSION="24.8.0"
PORT="4001"
ENV_FILE=".env.local"
SUMMARY=()
OVERALL_FAIL=0

usage() {
  cat <<'EOF'
Usage: ./start.sh [--update]

  --update    Fetch and pull the latest changes from the tracked remote
EOF
}

log_section() {
  local icon="$1"
  local title="$2"
  printf "\n%s  %s\n" "$icon" "$title"
  printf '%s\n' "────────────────────────────────────────────────────"
}

log_info() { printf "   • %s\n" "$1"; }
log_success() { printf "   ✅ %s\n" "$1"; }
log_warn() { printf "   ⚠️  %s\n" "$1"; }
log_error() { printf "   ❌ %s\n" "$1"; }

add_summary() {
  SUMMARY+=("$1|$2|$3")
}

print_summary() {
  printf "\n📊  Environment Health Summary\n"
  printf " %-28s | %-6s | %s\n" "Check" "Status" "Details"
  printf " %s\n" "---------------------------------------------------------------"
  local row
  for row in "${SUMMARY[@]}"; do
    IFS='|' read -r name status detail <<<"$row"
    printf " %-28s | %-6s | %s\n" "$name" "$status" "$detail"
  done
}

perform_update() {
  log_section "🔄" "Updating repository from remote"

  if ! command -v git >/dev/null 2>&1; then
    log_error "git is not installed."
    exit 1
  fi

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log_error "This directory is not a Git repository."
    exit 1
  fi

  if [ -n "$(git status --porcelain)" ]; then
    log_warn "Working tree has uncommitted changes."
    log_error "Commit or stash local changes before running --update."
    exit 1
  fi

  if ! git remote get-url origin >/dev/null 2>&1; then
    log_error "Remote 'origin' is not configured."
    exit 1
  fi

  current_branch=$(git rev-parse --abbrev-ref HEAD)
  if [ "$current_branch" = "HEAD" ]; then
    log_warn "Detached HEAD detected; defaulting to 'main'."
    current_branch="main"
  fi

  log_info "Fetching latest refs from all remotes..."
  if git fetch --all --prune; then
    log_success "Fetch completed."
  else
    log_error "git fetch failed."
    exit 1
  fi

  log_info "Pulling latest changes for ${current_branch} from origin..."
  if git pull --ff-only origin "$current_branch"; then
    log_success "Repository is up to date with origin/${current_branch}."
    git status -sb
    exit 0
  else
    log_error "git pull failed (non-fast-forward or network error)."
    exit 1
  fi
}

if [ $# -gt 0 ]; then
  case "$1" in
    --update)
      perform_update
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n\n' "$1"
      usage
      exit 1
      ;;
  esac
fi

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  elif command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
  else
    date +%s%N | sha1sum | cut -c1-64
  fi
}

ensure_env_var() {
  local key="$1"
  local value="$2"
  local note="$3"
  local existing_line
  existing_line=$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)

  if [ -z "$existing_line" ]; then
    printf '%s="%s"\n' "$key" "$value" >>"$ENV_FILE"
    log_warn "Added ${key} to ${ENV_FILE} ${note}"
    ENV_UPDATES+=("$key")
  else
    local existing_value="${existing_line#${key}=}"
    existing_value="${existing_value%\"}"
    existing_value="${existing_value#\"}"
    if [ -z "$existing_value" ]; then
      sed -i "s/^${key}=.*/${key}=\"${value}\"/" "$ENV_FILE"
      log_warn "Updated empty ${key} in ${ENV_FILE} ${note}"
      ENV_UPDATES+=("$key")
    fi
  fi
}

# 1. Node.js runtime check
log_section "🧰" "Checking Node.js runtime"
if ! command -v node >/dev/null 2>&1; then
  log_error "Node.js is not installed."
  add_summary "Node.js" "❌" "Install Node.js ${REQUIRED_NODE_VERSION} and re-run."
  OVERALL_FAIL=1
else
  current_node=$(node -v 2>/dev/null | sed 's/^v//')
  if [ "$current_node" != "$REQUIRED_NODE_VERSION" ]; then
    log_warn "Detected Node.js v${current_node}; expected v${REQUIRED_NODE_VERSION}."
    if command -v nvm >/dev/null 2>&1; then
      log_info "Attempting to activate Node.js ${REQUIRED_NODE_VERSION} via nvm..."
      if nvm install "$REQUIRED_NODE_VERSION" >/dev/null 2>&1 && nvm use "$REQUIRED_NODE_VERSION" >/dev/null 2>&1; then
        current_node=$(node -v 2>/dev/null | sed 's/^v//')
        log_success "Switched to Node.js v${current_node}."
      fi
    fi
  fi

  if [ "$current_node" = "$REQUIRED_NODE_VERSION" ]; then
    log_success "Node.js v${current_node} confirmed."
    add_summary "Node.js" "✅" "v${current_node}"
  else
    log_error "Unable to use required Node.js version ${REQUIRED_NODE_VERSION}."
    add_summary "Node.js" "❌" "Found v${current_node}; requires v${REQUIRED_NODE_VERSION}."
    OVERALL_FAIL=1
  fi
fi

# 2. npm availability check
log_section "📦" "Checking npm availability"
if ! command -v npm >/dev/null 2>&1; then
  log_error "npm is not available."
  add_summary "npm" "❌" "Install npm (bundled with Node.js ${REQUIRED_NODE_VERSION})."
  OVERALL_FAIL=1
else
  npm_version=$(npm -v 2>/dev/null)
  log_success "npm v${npm_version} detected."
  add_summary "npm" "✅" "v${npm_version}"
fi

# 3. Dependency installation check
log_section "🧱" "Verifying project dependencies"
if [ ! -d "node_modules" ]; then
  log_warn "node_modules directory not found; installing dependencies..."
  if npm install; then
    log_success "Dependencies installed successfully."
    add_summary "Dependencies" "✅" "npm install completed"
  else
    log_error "npm install failed."
    add_summary "Dependencies" "❌" "npm install failed"
    OVERALL_FAIL=1
  fi
else
  log_success "Dependencies already installed."
  add_summary "Dependencies" "✅" "node_modules present"
fi

# 4. Environment configuration
log_section "🪪" "Validating environment configuration"
ENV_UPDATES=()
if [ ! -f "$ENV_FILE" ]; then
  log_warn "${ENV_FILE} not found; creating with development defaults."
  cat <<EOF >"$ENV_FILE"
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="$(generate_secret)"
NEXTAUTH_URL="http://localhost:${PORT}"
DEFAULT_ADMIN_EMAIL="admin@example.com"
DEFAULT_ADMIN_PASSWORD="password"
EOF
  ENV_UPDATES+=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "DEFAULT_ADMIN_EMAIL" "DEFAULT_ADMIN_PASSWORD")
fi

ensure_env_var "DATABASE_URL" "file:./dev.db" "(SQLite development database)."
ensure_env_var "NEXTAUTH_SECRET" "$(generate_secret)" "(generated development secret)."
ensure_env_var "NEXTAUTH_URL" "http://localhost:${PORT}" "(default localhost URL)."
ensure_env_var "DEFAULT_ADMIN_EMAIL" "admin@example.com" "(bootstrap credentials)."
ensure_env_var "DEFAULT_ADMIN_PASSWORD" "password" "(bootstrap credentials)."

if [ ${#ENV_UPDATES[@]} -gt 0 ]; then
  log_warn "Review ${ENV_FILE}; sensitive defaults were added or updated."
  ENV_STATUS="⚠️"
  ENV_DETAIL="Updated ${#ENV_UPDATES[@]} values in ${ENV_FILE}"
else
  log_success "${ENV_FILE} already satisfied required variables."
  ENV_STATUS="✅"
  ENV_DETAIL="All required env vars present"
fi

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  log_error "DATABASE_URL is not configured; cannot continue."
  add_summary "Environment" "❌" "DATABASE_URL missing in ${ENV_FILE}"
  OVERALL_FAIL=1
else
  add_summary "Environment" "$ENV_STATUS" "$ENV_DETAIL"
fi

# 5. Database migrations & seeding
log_section "🗄️" "Preparing Prisma database"
DB_SUMMARY_DETAIL=""
DB_STATUS="✅"

if [ -z "${DATABASE_URL:-}" ]; then
  log_error "Skipping Prisma checks because DATABASE_URL is undefined."
  DB_STATUS="❌"
  DB_SUMMARY_DETAIL="Missing DATABASE_URL"
  OVERALL_FAIL=1
else
  if npx prisma generate; then
    log_success "Prisma client generated."
  else
    log_error "prisma generate failed."
    DB_STATUS="❌"
    DB_SUMMARY_DETAIL="prisma generate failed"
    OVERALL_FAIL=1
  fi

  if [ "$DB_STATUS" = "✅" ]; then
    if npx prisma migrate deploy; then
      log_success "Applied Prisma migrations (deploy)."
    else
      log_error "prisma migrate deploy failed."
      DB_STATUS="❌"
      DB_SUMMARY_DETAIL="migrate deploy failed"
      OVERALL_FAIL=1
    fi
  fi

  db_path=""
  if [[ "${DATABASE_URL}" == file:* ]]; then
    db_path="${DATABASE_URL#file:}"
    db_path="${db_path%%\?*}"
    if [[ ! "$db_path" = /* ]]; then
      db_path="$ROOT_DIR/${db_path#./}"
    fi
  fi

  if [ "$DB_STATUS" = "✅" ]; then
    if [ -n "$db_path" ] && [ ! -f "$db_path" ]; then
      log_warn "Database file not found; running seed script."
      if npm run seed; then
        log_success "Database seeded successfully."
        DB_SUMMARY_DETAIL="Database created & seeded"
      else
        log_error "Database seed script failed."
        DB_STATUS="❌"
        DB_SUMMARY_DETAIL="Seed script failed"
        OVERALL_FAIL=1
      fi
    else
      if [ -n "$db_path" ]; then
        log_success "SQLite database present at ${db_path}."
        DB_SUMMARY_DETAIL="Database ready (${db_path##*/})"
      else
        DB_SUMMARY_DETAIL="Migrations applied"
      fi
    fi
  fi
fi

add_summary "Database" "$DB_STATUS" "${DB_SUMMARY_DETAIL:-See logs above}"

# 6. Determine URLs for final summary
LOCAL_URL="http://localhost:${PORT}"
NETWORK_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -n "$NETWORK_IP" ]; then
  NETWORK_URL="http://${NETWORK_IP}:${PORT}"
else
  NETWORK_URL="Unavailable"
fi
add_summary "Dev server" "▶️" "${LOCAL_URL} | ${NETWORK_URL}"

print_summary

if [ "$OVERALL_FAIL" -ne 0 ]; then
  printf "\n❌  One or more checks failed. Resolve the issues above and re-run ./start.sh.\n"
  exit 1
fi

printf "\n🚀  Launching Next.js development server on %s...\n\n" "$LOCAL_URL"
exec npm run dev
