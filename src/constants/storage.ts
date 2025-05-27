//constants/storage.ts
import { mkdirSync } from "fs";
import { join } from "path";

export const storageMusicDir = join( 'storage', 'music');
mkdirSync(storageMusicDir, { recursive: true });
export const getStoragePath = (...name: string[]) => join(storageMusicDir, ...name);

export const storageAvatarMusicDir = join( 'storage', 'avatarMusic');
mkdirSync(storageAvatarMusicDir, { recursive: true });
export const getStorageAvatarMusicPath = (...name: string[]) => join(storageAvatarMusicDir, ...name);