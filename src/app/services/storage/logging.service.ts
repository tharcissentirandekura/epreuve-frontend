import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly LOG_ENDPOINT = `${environment.apiBaseUrl}/logs`;
  private readonly MAX_LOCAL_LOGS = 100;
  private readonly LOGS_KEY = 'app_logs';
  private readonly isDev = !environment.production;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  /**
   * Initialize the logging service
   */
  init(): void {
    // Set up global error handler
    window.addEventListener('error', (event) => {
      this.logError('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
      return false;
    });

    // Handle promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled promise rejection', {
        reason: event.reason
      });
    });

    this.logInfo('Logging service initialized');
  }

  /**
   * Log an informational message
   */
  logInfo(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   */
  logWarning(message: string, data?: any): void {
    this.log(LogLevel.WARNING, message, data);
  }

  /**
   * Log an error message
   */
  logError(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log a debug message (only in development)
   */
  logDebug(message: string, data?: any): void {
    if (this.isDev) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return this.storageService.getItem<LogEntry[]>(this.LOGS_KEY) || [];
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.storageService.removeItem(this.LOGS_KEY);
  }

  /**
   * Send logs to server
   */
  sendLogsToServer(): Promise<boolean> {
    const logs = this.getLogs();
    
    if (logs.length === 0) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.http.post(`${this.LOG_ENDPOINT}/batch`, { logs }).subscribe({
        next: () => {
          this.clearLogs();
          resolve(true);
        },
        error: () => {
          resolve(false);
        }
      });
    });
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    // Always console log in development
    if (this.isDev) {
      this.consoleLog(logEntry);
    }

    // Store log locally
    this.storeLog(logEntry);

    // Send critical logs to server immediately
    if (level === LogLevel.ERROR && navigator.onLine) {
      this.http.post(`${this.LOG_ENDPOINT}`, logEntry).subscribe({
        error: (err) => console.error('Failed to send log to server:', err)
      });
    }
  }

  /**
   * Output to console based on log level
   */
  private consoleLog(logEntry: LogEntry): void {
    const { level, message, timestamp, data } = logEntry;
    
    switch (level) {
      case LogLevel.INFO:
        console.log(`[${timestamp}] INFO: ${message}`, data || '');
        break;
      case LogLevel.WARNING:
        console.warn(`[${timestamp}] WARNING: ${message}`, data || '');
        break;
      case LogLevel.ERROR:
        console.error(`[${timestamp}] ERROR: ${message}`, data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] DEBUG: ${message}`, data || '');
        break;
    }
  }

  /**
   * Store log in local storage with size limit
   */
  private storeLog(logEntry: LogEntry): void {
    const logs = this.getLogs();
    logs.push(logEntry);
    
    // Limit the number of stored logs
    while (logs.length > this.MAX_LOCAL_LOGS) {
      logs.shift();
    }
    
    this.storageService.setItem(this.LOGS_KEY, logs);
  }
}