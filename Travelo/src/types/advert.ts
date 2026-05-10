export interface Advert {
  _id: string;
  createdBy?: string;
  title: string;
  description?: string;
  actionLink?: string;
  image: string;
  altText?: string;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Form-data input for create/update. `image` may be a File (new upload) or
// omitted (keep existing). All other fields are plain text/number/boolean.
export interface AdvertFormInput {
  title: string;
  description?: string;
  actionLink?: string;
  altText?: string;
  priority: number;
  isActive: boolean;
  image?: File;
}
