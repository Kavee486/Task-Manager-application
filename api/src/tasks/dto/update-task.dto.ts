import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto.js';

/** PATCH body: every field of CreateTaskDto becomes optional. */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
