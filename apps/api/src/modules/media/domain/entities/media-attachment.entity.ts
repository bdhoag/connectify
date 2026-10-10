export type MediaType = 'IMAGE' | 'VIDEO';

// A file already stored in the media provider and attached to a post/message.
export interface MediaAttachment {
  id: string;
  url: string;
  publicId: string;
  type: MediaType;
}

// What a client sends when attaching an uploaded file.
export interface NewMediaAttachment {
  url: string;
  publicId: string;
}
