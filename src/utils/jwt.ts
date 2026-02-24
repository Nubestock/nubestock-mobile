/**
 * Decodifica Base64 URL-safe (compatible con React Native)
 */
function base64UrlDecode(str: string): string {
  // Reemplazar caracteres URL-safe de Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Agregar padding si es necesario
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  
  // Decodificar Base64
  // En React Native, usamos Buffer si está disponible, sino intentamos atob
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } else if (typeof atob !== 'undefined') {
    return atob(base64);
  } else {
    // Fallback manual para entornos sin Buffer ni atob
    // Esto es una implementación básica de Base64 decode
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    
    base64 = base64.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    
    for (let i = 0; i < base64.length; i += 4) {
      const enc1 = chars.indexOf(base64.charAt(i));
      const enc2 = chars.indexOf(base64.charAt(i + 1));
      const enc3 = chars.indexOf(base64.charAt(i + 2));
      const enc4 = chars.indexOf(base64.charAt(i + 3));
      
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      
      output += String.fromCharCode(chr1);
      
      if (enc3 !== 64) {
        output += String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output += String.fromCharCode(chr3);
      }
    }
    
    return output;
  }
}

/**
 * Decodifica un JWT sin verificar la firma (solo para lectura del payload)
 * @param token JWT token
 * @returns Payload decodificado o null si hay error
 */
export function decodeJWT(token: string): any | null {
  try {
    // Los JWTs tienen formato: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar el payload (segunda parte)
    const payload = parts[1];
    const decoded = base64UrlDecode(payload);
    
    // Parsear JSON
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}
