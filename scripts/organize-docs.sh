#!/bin/bash
# Script to organize documentation files
# Moves legacy/completed documentation to docs/archive/

cd "$(dirname "$0")/.." || exit

# Create archive directories
mkdir -p docs/archive
mkdir -p docs/legacy

# Move files with "COMPLETE", "FINAL", "SUMMARY" patterns to legacy
for file in *_COMPLETE*.md *_FINAL*.md *_SUMMARY*.md *_COMPLETE_*.md ALL_*.md FINAL_*.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/legacy/ 2>/dev/null
    echo "Moved: $file -> docs/legacy/"
  fi
done

# Move deployment guides to docs/
for file in *_DEPLOY*.md *_DEPLOYMENT*.md DEPLOY_*.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/ 2>/dev/null
    echo "Moved: $file -> docs/"
  fi
done

# Move feature guides to docs/
for file in *_GUIDE.md *_QUICKSTART.md *_QUICK_START.md; do
  if [ -f "$file" ] && [ "$file" != "README.md" ]; then
    mv "$file" docs/ 2>/dev/null
    echo "Moved: $file -> docs/"
  fi
done

# Move phase/improvement docs to archive
for file in PHASE_*.md *_IMPROVEMENT*.md *_ROADMAP*.md; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/ 2>/dev/null
    echo "Moved: $file -> docs/archive/"
  fi
done

echo ""
echo "Documentation organization complete!"
echo "Active docs: $(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "Legacy docs: $(ls -1 docs/legacy/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "Archived docs: $(ls -1 docs/archive/*.md 2>/dev/null | wc -l | tr -d ' ') files"

