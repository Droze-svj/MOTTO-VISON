# Documentation Organization

## Overview

This document explains the documentation structure after the cleanup on $(date).

## Structure

```
MOTTO-VISON/
├── README.md                    # Main project README
├── *.md                         # Active/essential docs (36 files)
├── docs/
│   ├── README.md               # Documentation index
│   ├── COMPREHENSIVE_GUIDE.md  # Main development guide
│   ├── API_REFERENCE.md        # API documentation
│   ├── *.md                    # Active guides (deployment, features, etc.)
│   ├── legacy/                 # Historical/completed documentation (54 files)
│   └── archive/                # Improvement roadmaps and plans (7 files)
```

## File Categories

### Root Directory (Active Docs)
These files remain in the root for quick access:
- Main README.md
- Essential status/version files
- Critical configuration docs
- Quick reference materials

### docs/ (Active Guides)
All current, actively maintained documentation:
- Feature guides
- Deployment guides
- Setup instructions
- API references
- Development guides

### docs/legacy/ (Historical)
Completed milestones and summaries:
- `*_COMPLETE*.md` files
- `*_SUMMARY*.md` files
- `*_FINAL*.md` files
- Historical project status documents

**Note**: These are kept for reference but may be outdated.

### docs/archive/ (Roadmaps)
Planning and improvement documents:
- Roadmaps
- Improvement plans
- Future considerations

## Maintenance

To keep documentation organized:

1. **New guides** → Add to `docs/`
2. **Completed milestones** → Move to `docs/legacy/`
3. **Planning docs** → Move to `docs/archive/`
4. **Root docs** → Keep minimal, only essential files

## Statistics

- **Before cleanup**: ~139 markdown files in root
- **After cleanup**: 36 files in root (74% reduction)
- **Organized**: 61 files moved to appropriate folders
- **Legacy docs**: 54 files preserved for reference
- **Archived plans**: 7 files preserved for context

## Quick Access

- 📖 **Main README**: [../README.md](../README.md)
- 📚 **Documentation Index**: [README.md](./README.md)
- 🔧 **Full Guide**: [COMPREHENSIVE_GUIDE.md](./COMPREHENSIVE_GUIDE.md)
- 📋 **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)

