export interface ITagShort {
  id: number;
  name: string;
}

export interface ITag extends ITagShort {
  createdAt: Date;
  updatedAt: Date;
}
