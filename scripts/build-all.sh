#!/usr/bin/env bash
set -e

echo "=================================================="
echo "⚡ OxidPulse Multi-Platform Build Assistant"
echo "=================================================="

OS="$(uname -s)"
ARCH="$(uname -m)"

echo "Detected Host OS: ${OS} (${ARCH})"

echo ""
echo "1. Validating Frontend TypeScript & Assets..."
npm run build

echo ""
echo "2. Validating Rust Backend Engine..."
cargo check --manifest-path src-tauri/Cargo.toml

echo ""
echo "3. Compiling Release Standalone Application Bundle..."
npm run tauri build

echo ""
echo "=================================================="
echo "✅ Build Complete!"
echo "Generated release artifacts are located in:"
echo "👉 src-tauri/target/release/bundle/"
echo "=================================================="
