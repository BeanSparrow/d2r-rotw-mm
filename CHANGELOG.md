# Changelog

All notable changes from the original [d2rmm](https://github.com/olegbl/d2rmm) repository.

## [1.8.1-warlock] - 2024

### Added

- **Warlock Class Support**

  - Added skill offset 373 for the new Warlock class from the Reign of the Warlock DLC
  - Location: `src/main/worker/third-party/d2s/d2/skills.ts`

- **Buffer.readCString Polyfill**

  - Added polyfill for `Buffer.prototype.readCString()` which was previously provided by ref-napi
  - Required for reading null-terminated strings from CASC game files
  - Location: `src/main/worker/CascLib.ts`

- **Electron 28 Bootstrap**
  - Created `src/main/bootstrap.js` to handle ts-node registration
  - Necessary because Electron 28's ESM loader doesn't work with ts-node's register hook

### Changed

- **FFI Library Migration**

  - Replaced `ffi-napi` and `ref-napi` with `koffi` (^2.9.0)
  - koffi is a modern FFI library that doesn't require native compilation
  - Eliminates build issues on Node 18+

- **CascLib Rewrite**

  - Completely rewrote `src/main/worker/CascLib.ts` to use koffi
  - Updated pointer allocation and dereferencing patterns
  - Maintained all 6 CascLib functions: CascOpenStorage, CascCloseStorage, CascOpenFile, CascCloseFile, CascReadFile, GetCascError

- **BridgeAPI Updates**

  - Updated `src/main/worker/BridgeAPI.ts` pointer handling for koffi compatibility
  - Changed from ref-napi's `ref.alloc()`/`.deref()` pattern to koffi's array-based pointers

- **Electron Upgrade (16 → 28)**

  - Updated `electron` from ^16.0.5 to ^28.0.0
  - Updated `electron-builder` from ^22.13.1 to ^24.9.0
  - Updated `electron-updater` from ^4.6.5 to ^6.1.0
  - Replaced `electron-rebuild` with `@electron/rebuild` (^3.6.0)
  - Replaced `electron-notarize` with `@electron/notarize` (^2.2.0)

- **Webpack Configuration**

  - Removed deprecated `NoEmitOnErrorsPlugin` (removed in Webpack 5)
  - Removed deprecated `LoaderOptionsPlugin`
  - Replaced deprecated `onBeforeSetupMiddleware` with `setupMiddlewares`
  - Fixed null safety for `module.parent` access

- **NxmProtocolAPI**

  - Added null checks for `process.argv` access
  - Prevents crashes when launched via bootstrap

- **Development Experience**

  - Disabled auto-open DevTools on startup (can still open with F12)
  - Location: `src/main/main.ts`

- **ExpandedInventory Mod**

  - Added Warlock to the list of supported character classes
  - Added extensive null safety checks for child element access
  - Location: `mods/ExpandedInventory/mod.js`

- **Null Safety Improvements**
  - Added null safety for skill lookups in `src/main/worker/third-party/d2s/d2/attribute_enhancer.ts`
  - Prevents crashes when encountering unknown skill IDs

### Removed

- **Deprecated Dependencies**

  - Removed `ffi-napi` - replaced by koffi
  - Removed `ref-napi` - replaced by koffi
  - Removed `node-addon-api` - was only needed by ffi-napi
  - Removed `@types/ffi-napi` - no longer needed
  - Removed `@types/ref-napi` - no longer needed

- **Empty Files**
  - Removed `src/renderer/react/ed2r/ED2RPickedUpItemContext.tsx` (contained only TODO comment)

### Fixed

- **Empty TSV Output Files**
  - Fixed issue where TSV files (like inventory.txt) would be empty after mod installation
  - Root cause: missing `readCString` method after removing ref-napi

### Technical Details

#### Why koffi?

The original d2rmm used `ffi-napi` and `ref-napi` for FFI bindings to CascLib. These packages require native compilation with node-gyp, which frequently fails on:

- Newer Node.js versions (18+)
- Systems without Visual Studio Build Tools
- Various Windows configurations

`koffi` is a pure JavaScript FFI library that:

- Requires no native compilation
- Works with Node 18, 20, 22+
- Has simpler pointer handling
- Is actively maintained

#### Pointer Handling Changes

**Before (ref-napi):**

```javascript
const cascStoragePtr = ref.alloc(voidPtrPtr);
getCascLib().CascOpenStorage(path, 0, cascStoragePtr);
const storage = cascStoragePtr.deref();
```

**After (koffi):**

```javascript
const cascStoragePtr = [null];
getCascLib().CascOpenStorage(path, 0, cascStoragePtr);
const storage = cascStoragePtr[0];
```

#### Requirements

- Node.js 18 or later
- npm 9 or later
- Windows: Visual Studio Build Tools (for other native modules like regedit)

### Compatibility

This fork is compatible with:

- Diablo II: Resurrected (latest version)
- Reign of the Warlock DLC (Warlock class)
