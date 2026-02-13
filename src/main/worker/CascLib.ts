import koffi from 'koffi';
import path from 'path';
import { getAppPath } from './AppInfoAPI';

// http://www.zezula.net/en/casc/casclib.html
// https://github.com/ladislav-zezula/CascLib/blob/master/src/CascLib.h

// Polyfill for Buffer.readCString() which was previously provided by ref-napi
// This reads a null-terminated C string from a buffer
declare global {
  interface Buffer {
    readCString(offset?: number): string;
  }
}

Buffer.prototype.readCString = function (offset: number = 0): string {
  // Find the null terminator
  let end = offset;
  while (end < this.length && this[end] !== 0) {
    end++;
  }
  // Return the string up to (but not including) the null terminator
  return this.toString('utf-8', offset, end);
};

// Define types for koffi
const voidPtrPtr = koffi.pointer('void*', 2);
const uint32Ptr = koffi.pointer('uint32_t', 1);

export type ICascLib = {
  CascCloseFile: (hFile: unknown) => boolean;
  CascCloseStorage: (hStorage: unknown) => boolean;
  CascOpenFile: (
    hStorage: unknown,
    szFileName: string,
    dwLocale: number,
    dwFlags: number,
    phFile: unknown[]
  ) => boolean;
  CascOpenStorage: (
    szPath: string,
    dwFlags: number,
    phStorage: unknown[]
  ) => boolean;
  CascReadFile: (
    hFile: unknown,
    lpBuffer: Buffer,
    dwToRead: number,
    pdwRead: number[]
  ) => boolean;
  GetCascError: () => number;
};

let CASC_LIB: ICascLib;
let koffiLib: koffi.IKoffiLib;

export async function initCascLib(): Promise<void> {
  let libName: string;

  switch (process.platform) {
    case 'win32':
      libName = 'CascLib.dll';
      break;
    case 'darwin':
      libName = 'CascLib.dylib';
      break;
    case 'linux':
      throw new Error("CascLib hasn't been compiled for Linux.");
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }

  const pathLibrary = path.resolve(getAppPath(), 'tools', libName);
  koffiLib = koffi.load(pathLibrary);

  CASC_LIB = {
    CascCloseFile: koffiLib.func('bool CascCloseFile(void* hFile)'),
    CascCloseStorage: koffiLib.func('bool CascCloseStorage(void* hStorage)'),
    CascOpenFile: koffiLib.func(
      'bool CascOpenFile(void* hStorage, const char* szFileName, uint32_t dwLocale, uint32_t dwFlags, _Out_ void** phFile)'
    ),
    CascOpenStorage: koffiLib.func(
      'bool CascOpenStorage(const char* szPath, uint32_t dwFlags, _Out_ void** phStorage)'
    ),
    CascReadFile: koffiLib.func(
      'bool CascReadFile(void* hFile, _Out_ void* lpBuffer, uint32_t dwToRead, _Out_ uint32_t* pdwRead)'
    ),
    GetCascError: koffiLib.func('int GetCascError()'),
  };
}

export function getCascLib(): ICascLib {
  return CASC_LIB;
}

// Helper functions for pointer management with koffi
export function allocVoidPtrPtr(): unknown[] {
  return [null];
}

export function allocUint32Ptr(): number[] {
  return [0];
}

export function derefVoidPtrPtr(ptr: unknown[]): unknown {
  return ptr[0];
}

export function derefUint32Ptr(ptr: number[]): number {
  return ptr[0];
}

// CascLib Error Codes for GetCascError()
// https://github.com/ladislav-zezula/CascLib/blob/master/src/CascPort.h#L230
// https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-
const KnownWindowsErrorCodes: { [code: number]: string } = {
  0: 'ERROR_SUCCESS: The operation completed successfully.',
  1: 'ERROR_INVALID_FUNCTION: Incorrect function.',
  2: 'ERROR_FILE_NOT_FOUND: The system cannot find the file specified.',
  3: 'ERROR_PATH_NOT_FOUND: The system cannot find the path specified.',
  4: 'ERROR_TOO_MANY_OPEN_FILES: The system cannot open the file.',
  5: 'ERROR_ACCESS_DENIED: Access is denied.',
  6: 'ERROR_INVALID_HANDLE: The handle is invalid.',
  7: 'ERROR_ARENA_TRASHED: The storage control blocks were destroyed.',
  8: 'ERROR_NOT_ENOUGH_MEMORY: Not enough memory resources are available to process this command.',
  9: 'ERROR_INVALID_BLOCK: The storage control block address is invalid.',
  10: 'ERROR_BAD_ENVIRONMENT: The environment is incorrect.',
  11: 'ERROR_BAD_FORMAT: An attempt was made to load a program with an incorrect format.',
  12: 'ERROR_INVALID_ACCESS: The access code is invalid.',
  13: 'ERROR_INVALID_DATA: The data is invalid.',
  14: 'ERROR_OUTOFMEMORY: Not enough storage is available to complete this operation.',
  15: 'ERROR_INVALID_DRIVE: The system cannot find the drive specified.',
  16: 'ERROR_CURRENT_DIRECTORY: The directory cannot be removed.',
  17: 'ERROR_NOT_SAME_DEVICE: The system cannot move the file to a different disk drive.',
  18: 'ERROR_NO_MORE_FILES: There are no more files.',
  19: 'ERROR_WRITE_PROTECT: The media is write protected.',
  20: 'ERROR_BAD_UNIT: The system cannot find the device specified.',
  21: 'ERROR_NOT_READY: The device is not ready.',
  22: 'ERROR_BAD_COMMAND: The device does not recognize the command.',
  23: 'ERROR_CRC: Data error (cyclic redundancy check).',
  24: 'ERROR_BAD_LENGTH: The program issued a command but the command length is incorrect.',
  25: 'ERROR_SEEK: The drive cannot locate a specific area or track on the disk.',
  26: 'ERROR_NOT_DOS_DISK: The specified disk or diskette cannot be accessed.',
  27: 'ERROR_SECTOR_NOT_FOUND: The drive cannot find the sector requested.',
  28: 'ERROR_OUT_OF_PAPER: The printer is out of paper.',
  29: 'ERROR_WRITE_FAULT: The system cannot write to the specified device.',
  30: 'ERROR_READ_FAULT: The system cannot read from the specified device.',
  31: 'ERROR_GEN_FAILURE: A device attached to the system is not functioning.',
  32: 'ERROR_SHARING_VIOLATION: The process cannot access the file because it is being used by another process.',
  33: 'ERROR_LOCK_VIOLATION: The process cannot access the file because another process has locked a portion of the file.',
  34: 'ERROR_WRONG_DISK: The wrong diskette is in the drive.',
  36: 'ERROR_SHARING_BUFFER_EXCEEDED: Too many files opened for sharing.',
  38: 'ERROR_HANDLE_EOF: Reached the end of the file.',
  39: 'ERROR_HANDLE_DISK_FULL: The disk is full.',
  50: 'ERROR_NOT_SUPPORTED: The request is not supported.',
  87: 'ERROR_INVALID_PARAMETER: The parameter is incorrect.',
  110: 'ERROR_OPEN_FAILED: The system cannot open the device or file specified.',
  111: 'ERROR_BUFFER_OVERFLOW: The file name is too long.',
  112: 'ERROR_DISK_FULL: There is not enough space on the disk.',
  123: 'ERROR_INVALID_NAME: The filename, directory name, or volume label syntax is incorrect.',
  126: 'ERROR_MOD_NOT_FOUND: The specified module could not be found.',
  127: 'ERROR_PROC_NOT_FOUND: The specified procedure could not be found.',
  183: 'ERROR_ALREADY_EXISTS: Cannot create a file when that file already exists.',
  206: 'ERROR_FILENAME_EXCED_RANGE: The filename or extension is too long.',
  234: 'ERROR_MORE_DATA: More data is available.',
  267: 'ERROR_DIRECTORY: The directory name is invalid.',
};

export function getLastCascLibError(): string {
  let errorCode = getCascLib().GetCascError();
  if (typeof errorCode === 'string') {
    errorCode = parseInt(errorCode, 10);
  }

  const message = KnownWindowsErrorCodes[errorCode] ?? `UNKNOWN ERROR`;
  return `CascLib error code ${errorCode}: ${message}`;
}
