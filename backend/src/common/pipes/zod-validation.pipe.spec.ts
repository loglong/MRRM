import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';

const TestSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(TestSchema);
  });

  it('should return parsed value when input is valid', () => {
    const validInput = { name: 'John', age: 25 };
    expect(pipe.transform(validInput)).toEqual(validInput);
  });

  it('should throw BadRequestException when input is invalid', () => {
    const invalidInput = { name: '', age: -5 };
    expect(() => pipe.transform(invalidInput)).toThrow(BadRequestException);
  });

  it('should concatenate ZodError messages with ", " separator', () => {
    const invalidInput = { name: '', age: -5 };
    try {
      pipe.transform(invalidInput);
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse();
      const message = typeof response === 'string' ? response : (response as any).message;
      expect(message).toContain(', ');
    }
  });

  it('should throw generic BadRequestException for non-ZodError', () => {
    const nonZodError = new Error('some error');
    const pipeWithBrokenSchema = new ZodValidationPipe({
      parse: () => { throw nonZodError; },
    } as any);

    try {
      pipeWithBrokenSchema.transform({});
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse();
      const message = typeof response === 'string' ? response : (response as any).message;
      expect(message).toBe('Validation failed');
    }
  });
});
