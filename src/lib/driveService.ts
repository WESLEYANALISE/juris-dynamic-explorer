// Mock implementation of Google Drive service for browser environment
// This replaces the server-side googleapis implementation which requires Node.js process

/**
 * Create a blob from PDF document
 * @param pdfDoc - jsPDF document
 * @returns Blob of PDF
 */
export function createPdfBlob(pdfDoc: any): Promise<Blob> {
  return new Promise((resolve) => {
    const blob = pdfDoc.output('blob');
    resolve(blob);
  });
}

/**
 * Mock function to simulate uploading to Google Drive
 * In browser environment, this creates a downloadable link
 * @param fileBlob - File blob to upload
 * @param fileName - Name for the file
 * @returns URL of the uploaded file
 */
export async function uploadToDrive(fileBlob: Blob, fileName: string): Promise<string> {
  try {
    console.log(`Mock uploading file: ${fileName} (${Math.round(fileBlob.size / 1024)} KB)`);
    
    // Create a local object URL for the PDF
    const objectUrl = URL.createObjectURL(fileBlob);
    
    // Open the PDF in a new tab/window
    window.open(objectUrl, '_blank');
    
    // Store the file info in localStorage
    const storedFiles = JSON.parse(localStorage.getItem('storedPdfFiles') || '{}');
    storedFiles[fileName] = {
      objectUrl,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    localStorage.setItem('storedPdfFiles', JSON.stringify(storedFiles));
    
    return objectUrl;
  } catch (error) {
    console.error('Error uploading file to browser storage:', error);
    throw new Error('Failed to save PDF');
  }
}

/**
 * Clean up expired files from local storage
 */
export function cleanupExpiredFiles(): void {
  try {
    const storedFiles = JSON.parse(localStorage.getItem('storedPdfFiles') || '{}');
    const currentDate = new Date().toISOString();
    let hasChanges = false;
    
    // Check each file's expiration date
    for (const [fileName, fileInfo] of Object.entries(storedFiles)) {
      const info = fileInfo as any;
      if (info.expiresAt && info.expiresAt < currentDate) {
        // Revoke the object URL to free up memory
        if (info.objectUrl) {
          URL.revokeObjectURL(info.objectUrl);
        }
        // Remove this file from storage
        delete storedFiles[fileName];
        hasChanges = true;
        console.log(`Deleted expired file: ${fileName}`);
      }
    }
    
    // Save the updated storage if we made changes
    if (hasChanges) {
      localStorage.setItem('storedPdfFiles', JSON.stringify(storedFiles));
    }
  } catch (error) {
    console.error('Error cleaning up expired files:', error);
  }
}

// Run cleanup on initialization
setTimeout(cleanupExpiredFiles, 1000);
