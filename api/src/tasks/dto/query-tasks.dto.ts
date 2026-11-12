import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/enums.js';

export enum TaskSortField {
  DUE_DATE = 'dueDate',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/** Query string for GET /tasks, e.g. ?status=TODO&sort=dueDate&order=asc */
export class QueryTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `status must be one of: ${Object.values(TaskStatus).join(', ')}`,
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskSortField, {
    message: `sort must be one of: ${Object.values(TaskSortField).join(', ')}`,
  })
  sort?: TaskSortField;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'order must be asc or desc' })
  order?: SortOrder;
}
