import { z } from 'zod';
import { CreateTouchpointSchema } from './create-touchpoint.dto';

export const UpdateTouchpointSchema = CreateTouchpointSchema.partial();
export type UpdateTouchpointDto = z.infer<typeof UpdateTouchpointSchema>;
