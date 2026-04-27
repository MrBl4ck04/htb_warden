// This script parses the raw CSV spreadsheet data into structured machine objects
import fs from 'fs';
import path from 'path';

export interface MachineSeed {
  name: string;
  ip: string;
  os: string;
  difficulty: string;
  techniques: string[];
  certifications: string[];
}

export function parseMachines(): MachineSeed[] {
  const raw = fs.readFileSync(path.join(process.cwd(), 'src/lib/seed/raw_data.txt'), 'utf-8');
  const machines: MachineSeed[] = [];
  
  // The CSV format: Name,IP,OS,Difficulty,"Techniques\nmultiline","Certs\nmultiline",WriteupURL,Resolved,
  // We need to handle multiline quoted fields
  
  const lines = raw.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip empty lines, headers, metadata
    if (!line || line.startsWith('Source:') || line.startsWith('---') || line.startsWith(',,') || 
        line.startsWith('Máquina,') || line.startsWith('The above')) {
      i++;
      continue;
    }
    
    // Try to extract a machine entry - look for pattern: Name,IP,OS,Difficulty
    const machineMatch = line.match(/^([A-Za-z0-9_\- ]+),(10\.\d+\.\d+\.\d+)\s*,\s*(Linux|Windows|Otro)\s*,\s*(Fácil|Media|Difícil|Insane|Difcil)\s*,/);
    
    if (machineMatch) {
      const name = machineMatch[1].trim();
      const ip = machineMatch[2].trim();
      const os = machineMatch[3].trim();
      let difficulty = machineMatch[4].trim();
      if (difficulty === 'Difcil') difficulty = 'Difícil';
      
      // Now we need to collect the rest until we find the next machine or end
      // Collect all lines until next machine entry
      let fullEntry = line;
      let j = i + 1;
      
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        // Check if next line is a new machine
        if (nextLine.match(/^[A-Za-z0-9_\- ]+,10\.\d+\.\d+\.\d+\s*,\s*(Linux|Windows|Otro)/)) {
          break;
        }
        if (nextLine.startsWith('The above')) break;
        fullEntry += '\n' + nextLine;
        j++;
      }
      
      // Extract techniques and certifications from the full entry
      const techniques: string[] = [];
      const certifications: string[] = [];
      
      // After the difficulty, the rest contains techniques and certs
      const afterMeta = fullEntry.substring(machineMatch[0].length);
      
      // Split by the URL pattern to separate techniques from certs
      const urlSplit = afterMeta.split(/https?:\/\/[^\s,]+/);
      const beforeUrl = urlSplit[0] || '';
      
      // The content before URL has: "techniques","certs"
      // Find the quoted sections
      const quotedSections: string[] = [];
      let inQuote = false;
      let current = '';
      
      for (const char of beforeUrl) {
        if (char === '"' && !inQuote) {
          inQuote = true;
          current = '';
        } else if (char === '"' && inQuote) {
          inQuote = false;
          quotedSections.push(current.trim());
        } else if (inQuote) {
          current += char;
        }
      }
      
      // Also handle unquoted single values
      if (quotedSections.length === 0) {
        // Try splitting by comma after the difficulty match
        const parts = beforeUrl.split(',').map(p => p.trim().replace(/"/g, '')).filter(p => p && p !== 'Si' && p !== 'No' && !p.startsWith('http'));
        if (parts.length >= 1) quotedSections.push(parts[0]);
        if (parts.length >= 2) quotedSections.push(parts[1]);
      }
      
      // First quoted section = techniques
      if (quotedSections[0]) {
        const techs = quotedSections[0].split('\n')
          .map(t => t.trim().replace(/^\r/, '').replace(/\r$/, ''))
          .filter(t => t.length > 0);
        techniques.push(...techs);
      }
      
      // Second quoted section = certifications
      if (quotedSections[1]) {
        const certs = quotedSections[1].split('\n')
          .map(c => c.trim().replace(/^\r/, '').replace(/\r$/, ''))
          .filter(c => c.length > 0);
        
        // Clean cert names
        const validCerts = ['eJPT', 'eWPT', 'eWPTXv2', 'OSCP', 'OSEP', 'OSWE', 'OSED', 'OSWP',
          'eCPPTv3', 'eCPPTv2', 'eCPTXv2', 'eCPTXv3', 'Active Directory', 'Buffer Overflow', 'Mobile',
          'eWPTXv2', 'eWPTX', 'eCPPTXv2'];
        
        certs.forEach(c => {
          // Normalize cert names
          let cert = c.trim();
          // Handle suffixes like "(Escalada)", "(Intrusión)"
          cert = cert.replace(/\s*\(.*\)/, '').trim();
          if (cert && (validCerts.includes(cert) || cert.startsWith('OSCP') || cert.startsWith('eWPT') || cert.startsWith('eCPP') || cert.startsWith('eCPT') || cert.startsWith('eJPT') || cert === 'Active Directory' || cert === 'Buffer Overflow' || cert === 'Mobile')) {
            // Final cleanup
            cert = cert.replace(/\s*\(.*/, '').trim();
            if (!certifications.includes(cert)) {
              certifications.push(cert);
            }
          }
        });
      }
      
      if (name && ip && techniques.length > 0) {
        machines.push({ name, ip, os, difficulty, techniques, certifications });
      }
      
      i = j;
    } else {
      i++;
    }
  }
  
  return machines;
}

// Run standalone
if (require.main === module) {
  const machines = parseMachines();
  console.log(`Parsed ${machines.length} machines`);
  machines.slice(0, 3).forEach(m => console.log(JSON.stringify(m, null, 2)));
}
