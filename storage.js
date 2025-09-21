// storage.js

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from "xlsx";
import { Buffer } from "buffer";
import { gameToCSV, gameToSheet } from './helpers';

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadXLSXFile(filename, players, winnerIdx, startingScore = 501) {
  const ws = XLSX.utils.aoa_to_sheet(gameToSheet(players, winnerIdx, startingScore));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Darts");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function saveSharedTextFileAsync(filename, text) {
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, text, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Share CSV' });
}

export async function saveSharedXLSXFileAsync(filename, players, winnerIdx, startingScore = 501) {
  const ws = XLSX.utils.aoa_to_sheet(gameToSheet(players, winnerIdx, startingScore));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Darts");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const buffer = new Uint8Array(wbout);
  const base64 = Buffer.from(buffer).toString("base64");
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Share XLSX' });
}