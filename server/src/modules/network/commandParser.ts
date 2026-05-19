export function parseConnectCommand(command: string): { ip: string } | null {
  const match = command.trim().match(/^connect\s+(\S+)$/i);
  if (!match) return null;
  return { ip: match[1] };
}
