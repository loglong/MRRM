"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const zod_validation_pipe_1 = require("./zod-validation.pipe");
const zod_1 = require("zod");
const TestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    age: zod_1.z.number().int().positive(),
});
describe('ZodValidationPipe', () => {
    let pipe;
    beforeEach(() => {
        pipe = new zod_validation_pipe_1.ZodValidationPipe(TestSchema);
    });
    it('should return parsed value when input is valid', () => {
        const validInput = { name: 'John', age: 25 };
        expect(pipe.transform(validInput)).toEqual(validInput);
    });
    it('should throw BadRequestException when input is invalid', () => {
        const invalidInput = { name: '', age: -5 };
        expect(() => pipe.transform(invalidInput)).toThrow(common_1.BadRequestException);
    });
    it('should concatenate ZodError messages with ", " separator', () => {
        const invalidInput = { name: '', age: -5 };
        try {
            pipe.transform(invalidInput);
            fail('Expected BadRequestException');
        }
        catch (error) {
            expect(error).toBeInstanceOf(common_1.BadRequestException);
            const response = error.getResponse();
            const message = typeof response === 'string' ? response : response.message;
            expect(message).toContain(', ');
        }
    });
    it('should throw generic BadRequestException for non-ZodError', () => {
        const nonZodError = new Error('some error');
        const pipeWithBrokenSchema = new zod_validation_pipe_1.ZodValidationPipe({
            parse: () => { throw nonZodError; },
        });
        try {
            pipeWithBrokenSchema.transform({});
            fail('Expected BadRequestException');
        }
        catch (error) {
            expect(error).toBeInstanceOf(common_1.BadRequestException);
            const response = error.getResponse();
            const message = typeof response === 'string' ? response : response.message;
            expect(message).toBe('Validation failed');
        }
    });
});
//# sourceMappingURL=zod-validation.pipe.spec.js.map