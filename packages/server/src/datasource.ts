import { DataSource } from 'typeorm';
import { ORM_CONFIG } from './constant/app.config';

export const AppDataSource = new DataSource(ORM_CONFIG);
