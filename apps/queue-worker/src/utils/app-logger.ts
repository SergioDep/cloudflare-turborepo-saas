/**
 * @todo Move to "@repo/utils" ?
 */
export class AppLogger {
  public static info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  public static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  public static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }
}
