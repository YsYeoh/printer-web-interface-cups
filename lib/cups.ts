import { exec } from 'child_process';
import { promisify } from 'util';
import { Printer, PrintOptions } from './types';

const execAsync = promisify(exec);

const CUPS_SERVER = process.env.CUPS_SERVER || 'localhost';
const CUPS_PORT = process.env.CUPS_PORT || '631';

// List available printers
export async function listPrinters(): Promise<Printer[]> {
  try {
    // Use lpstat command to list printers
    const { stdout } = await execAsync('lpstat -p -d');
    const lines = stdout.split('\n').filter((line) => line.trim());
    
    const printers: Printer[] = [];
    
    for (const line of lines) {
      // Parse lpstat output: "printer HP_LaserJet is idle.  enabled since ..."
      const match = line.match(/printer\s+(\S+)\s+is\s+(\S+)/);
      if (match) {
        const [, name, status] = match;
        printers.push({
          name,
          status,
        });
      }
    }
    
    // If no printers found via lpstat, try lpinfo
    if (printers.length === 0) {
      try {
        const { stdout: lpinfoOut } = await execAsync('lpinfo -v');
        const lpinfoLines = lpinfoOut.split('\n').filter((line) => line.trim());
        
        for (const line of lpinfoLines) {
          const match = line.match(/^([^\s]+)\s+(.+)$/);
          if (match) {
            const [, uri, description] = match;
            printers.push({
              name: uri,
              description,
            });
          }
        }
      } catch (error) {
        console.error('Error getting printer info:', error);
      }
    }
    
    return printers;
  } catch (error) {
    console.error('Error listing printers:', error);
    // Return empty array or default printer if CUPS is not available
    return [
      {
        name: 'default',
        description: 'Default printer',
        status: 'unknown',
      },
    ];
  }
}

// Get printer options
export async function getPrinterOptions(printerName: string): Promise<Record<string, string[]>> {
  try {
    const { stdout } = await execAsync(`lpoptions -p ${printerName} -l`);
    const options: Record<string, string[]> = {};
    
    const lines = stdout.split('\n').filter((line) => line.trim());
    for (const line of lines) {
      const match = line.match(/^(\S+)\/([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, , values] = match;
        options[key] = values.split(/\s+/).map((v) => v.trim());
      }
    }
    
    return options;
  } catch (error) {
    console.error('Error getting printer options:', error);
    return {};
  }
}

// Print file
export async function printFile(
  filePath: string,
  printerName: string,
  options: PrintOptions
): Promise<string> {
  try {
    // Build lp command options
    const lpOptions: string[] = [];
    
    lpOptions.push(`-d ${printerName}`);
    lpOptions.push(`-n ${options.copies}`);
    
    if (options.color === 'monochrome') {
      lpOptions.push('-o ColorMode=Monochrome');
    } else {
      lpOptions.push('-o ColorMode=Color');
    }
    
    if (options.orientation === 'landscape') {
      lpOptions.push('-o landscape');
    }
    
    if (options.paperSize) {
      lpOptions.push(`-o media=${options.paperSize}`);
    }
    
    if (options.scaling) {
      lpOptions.push(`-o fit-to-page`);
      if (options.scaling !== 100) {
        lpOptions.push(`-o scaling=${options.scaling}`);
      }
    }
    
    if (options.quality) {
      const qualityMap: Record<string, string> = {
        draft: 'draft',
        normal: 'normal',
        high: 'high',
      };
      lpOptions.push(`-o print-quality=${qualityMap[options.quality] || 'normal'}`);
    }
    
    const command = `lp ${lpOptions.join(' ')} "${filePath}"`;
    
    const { stdout } = await execAsync(command);
    
    // Extract job ID from output: "request id is HP_LaserJet-123 (1 file(s))"
    const match = stdout.match(/request id is (\S+)/);
    const jobId = match ? match[1] : 'unknown';
    
    return jobId;
  } catch (error) {
    console.error('Error printing file:', error);
    throw new Error(`Failed to print file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check if CUPS is available
export async function isCupsAvailable(): Promise<boolean> {
  try {
    await execAsync('lpstat -r');
    return true;
  } catch (error) {
    return false;
  }
}

