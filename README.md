# Diablo II: Resurrected Mod Manager (Warlock Edition)

D2RMM is a mod manager for Diablo II: Resurrected.

This fork adds support for the **Warlock class** from the Reign of Terror DLC and modernizes the codebase for current Node.js/Electron versions.

## What's New in This Fork

- **Warlock class support** - Skill offset 373 for the new Warlock class
- **Modernized dependencies** - Updated to Electron 28 and Node 18+
- **Replaced ffi-napi with koffi** - No more native module compilation issues on newer Node versions
- **Updated ExpandedInventory mod** - Includes Warlock in the supported classes

See the full [CHANGELOG](CHANGELOG.md) for detailed technical changes.

## Original Project

See the [Nexus page](https://www.nexusmods.com/diablo2resurrected/mods/169) for a full description of D2RMM.

Original repository: [https://github.com/olegbl/d2rmm](https://github.com/olegbl/d2rmm)

## Example Mods

You can find some example mods over at [https://github.com/olegbl/d2rmm.mods](https://github.com/olegbl/d2rmm.mods). There are also [API Docs](https://olegbl.github.io/d2rmm/) available.

## Requirements

- Node.js 18 or later
- npm 9 or later
- Windows: Visual Studio Build Tools (for native modules)

## Building

```bash
git clone <this-repo>
cd d2rmm
npm install
npm run start        # debug/development mode
npm run package      # build release
npm run docs         # build documentation
npm run build:updater        # build auto-updater exe
npm run build:config-schema  # build config json schema
```

## Technical Changes

This fork migrates from `ffi-napi`/`ref-napi` to `koffi` for FFI bindings to CascLib. This eliminates native module compilation issues that occurred with Node 18+ and makes the build process more reliable.

Key files modified:

- `src/main/worker/CascLib.ts` - Rewritten to use koffi
- `src/main/worker/BridgeAPI.ts` - Updated pointer handling
- `src/main/worker/third-party/d2s/d2/skills.ts` - Added Warlock skill offset
- `release/app/package.json` - Replaced ffi-napi/ref-napi with koffi

## Experimental support for macOS

See [instructions](README.macos.md).

## Credits

- Original D2RMM by [Oleg Lokhvitsky](https://github.com/olegbl)
- Warlock/modernization fork maintained for the D2R modding community
