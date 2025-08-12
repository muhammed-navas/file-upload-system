export type FilesUploadedDetail = { files: any[] };

export const emitFilesUploaded = (files: any[]) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<FilesUploadedDetail>('files:uploaded', { detail: { files } })
  );
};

export const onFilesUploaded = (
  handler: (files: any[]) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    const custom = event as CustomEvent<FilesUploadedDetail>;
    handler(custom.detail.files);
  };

  window.addEventListener('files:uploaded', listener as EventListener);
  return () => window.removeEventListener('files:uploaded', listener as EventListener);
}; 