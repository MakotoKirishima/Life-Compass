#!/usr/bin/env python3
"""
Check production environment variables for Life Compass.
Usage: python3 scripts/check_production_env.py [--path backend/.env]

This script checks that required env variables are present.
It NEVER prints secret values — only checks if they exist and are non-empty.
"""

import os
import sys
import argparse

REQUIRED = [
    "APP_ENV",
    "FRONTEND_URL",
    "API_PUBLIC_URL",
    "SECRET_KEY",
    "REFRESH_TOKEN_SECRET",
    "REFLECTION_ENCRYPTION_KEY",
]

GOOGLE_OAUTH = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
]

RECOMMENDED = [
    "COOKIE_DOMAIN",
    "CORS_ALLOWED_ORIGINS",
    "GEMINI_API_KEY",
    "INITIAL_ADMIN_EMAIL",
    "INITIAL_ADMIN_PASSWORD",
]


def load_env_file(path: str) -> dict:
    """Load a .env file into a dict. Silently ignores malformed lines."""
    env = {}
    if not os.path.isfile(path):
        print(f"  ERROR: File not found: {path}")
        sys.exit(1)
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            env[key.strip()] = value.strip().strip("\"'")
    return env


def check(category: str, keys: list[str], env: dict, required: bool) -> int:
    """Check env keys. Returns count of missing keys."""
    missing = 0
    print(f"\n[{category}]")
    for key in keys:
        if key in env and env[key]:
            print(f"  ✅ OK: {key} configured")
        else:
            print(f"  ❌ MISSING: {key}")
            missing += 1
    if missing == 0:
        print(f"  All {len(keys)} variables present.")
    elif required and missing > 0:
        print(f"  ⚠️  {missing} required variable(s) missing — app may not work correctly.")
    return missing


def main():
    parser = argparse.ArgumentParser(description="Check Life Compass environment variables")
    parser.add_argument("--path", default="backend/.env", help="Path to .env file")
    parser.add_argument("--verbose", action="store_true", help="Show all variables (names only, never values)")
    args = parser.parse_args()

    env = load_env_file(args.path)

    print("=" * 50)
    print("  Life Compass — Production Environment Check")
    print("=" * 50)
    print(f"  File: {os.path.abspath(args.path)}")
    print(f"  APP_ENV: {env.get('APP_ENV', 'NOT SET')}")

    if args.verbose:
        print(f"\n[All Variables Found ({len(env)})]")
        for key in sorted(env.keys()):
            print(f"  • {key}")

    total_missing = 0
    total_missing += check("Required", REQUIRED, env, required=True)
    total_missing += check("Google OAuth", GOOGLE_OAUTH, env, required=False)
    total_missing += check("Recommended", RECOMMENDED, env, required=False)

    print()
    if total_missing == 0:
        print("  ✅ All environment variables configured.")
        return 0
    else:
        print(f"  ⚠️  {total_missing} variable(s) missing or empty.")
        if any(env.get(k, "") for k in GOOGLE_OAUTH) and not all(env.get(k, "") for k in GOOGLE_OAUTH):
            print("  ⚠️  Google OAuth is partially configured — all 3 vars must be set.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
