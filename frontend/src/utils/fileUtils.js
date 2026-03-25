/**
 * Utility to safely open documents (PDFs, Images) in a new tab.
 * Handles both relative paths and base64 data URIs.
 * For data URIs, it converts them to Blobs to avoid URI_TOO_LONG errors
 * and browser security blocks.
 */

export const openDocument = (docPath) => {
  if (!docPath) return;

  // Check if it's a data URI
  if (docPath.startsWith('data:')) {
    try {
      const parts = docPath.split(';');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1].split(',')[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Clean up the blob URL after a short delay (enough for the browser to open it)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.error('Error processing data URI:', err);
      // Fallback: try opening directly (might fail for large URIs)
      window.open(docPath, '_blank');
    }
  } else {
    // Treat as relative path
    const cleanPath = docPath.replace(/^\//, '');
    const fullUrl = `${window.location.origin}/${cleanPath}`;
    window.open(fullUrl, '_blank');
  }
};
