const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  violet: "\x1b[35m",
  cyan: "\x1b[36m",
};

export function ok(message: string): void {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

export function fail(message: string): void {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

export function heading(message: string): void {
  console.log(`\n${colors.bold}${message}${colors.reset}`);
}

export function dim(message: string): string {
  return `${colors.dim}${message}${colors.reset}`;
}

export function brand(message: string): string {
  return `${colors.violet}${colors.bold}${message}${colors.reset}`;
}

export function log(message = ""): void {
  console.log(message);
}
