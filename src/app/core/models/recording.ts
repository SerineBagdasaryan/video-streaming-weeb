import {RecordingTypes} from "../enums";

export interface Recording {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  type: RecordingTypes;
  filePath: string;
}

export interface IMetaResponse {
  skip: number;
  take: number;
  total: number;
  pageCount: number;
}
export interface PaginatedResponse {
  data: Recording[];
  meta: IMetaResponse;
}
