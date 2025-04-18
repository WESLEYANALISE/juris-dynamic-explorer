
import { google } from 'googleapis';

// Service account key (you should replace this with your actual service account key)
// In a production environment, this should be stored securely
const GOOGLE_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "juris-explorer",
  private_key_id: "private_key_id",
  private_key: "-----BEGIN PRIVATE KEY-----\nprivate_key\n-----END PRIVATE KEY-----\n",
  client_email: "your-service-account@juris-explorer.iam.gserviceaccount.com",
  client_id: "client_id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "client_cert_url",
  universe_domain: "googleapis.com"
};

// Google Drive API Key for authorization
const DRIVE_API_KEY = 'AIzaSyDvJ23IolKwjdxAnTv7l8DwLuwGRZ_tIR8';

// Folder ID where PDFs will be uploaded
const FOLDER_ID = '1KSJYTpngn7Mg0--IV_tpF7NOeyn4Q1u8';

// Authorization using Service Account
const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/drive']
});

// Create the drive client
const drive = google.drive({
  version: 'v3',
  auth
});

/**
 * Upload file to Google Drive
 * @param fileBlob - File blob to upload
 * @param fileName - Name for the file
 * @returns URL of the uploaded file
 */
export async function uploadToDrive(fileBlob: Blob, fileName: string): Promise<string> {
  try {
    // Convert Blob to Buffer for upload
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create file metadata including expiration date (7 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    
    // Create file in Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
        // Set expiration date (file will be deleted after 7 days)
        properties: {
          expirationDate: expirationDate.toISOString()
        }
      },
      media: {
        mimeType: 'application/pdf',
        body: buffer
      },
      fields: 'id, webViewLink',
    });

    // Set file permissions to anyone with the link can view
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Return the web view link
    return response.data.webViewLink || '';
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw new Error('Failed to upload PDF to Google Drive');
  }
}

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
 * Schedule cleanup task to delete expired files
 * This should run on a server, not in the browser
 */
export async function cleanupExpiredFiles(): Promise<void> {
  try {
    const currentDate = new Date().toISOString();
    
    // Get files with expiration date before current date
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and properties has { key='expirationDate' and value<='${currentDate}' }`,
      fields: 'files(id, name)'
    });
    
    // Delete expired files
    for (const file of response.data.files || []) {
      await drive.files.delete({
        fileId: file.id!
      });
      console.log(`Deleted expired file: ${file.name}`);
    }
  } catch (error) {
    console.error('Error cleaning up expired files:', error);
  }
}
