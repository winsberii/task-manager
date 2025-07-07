
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagFormData {
  name: string;
  color: string;
}
