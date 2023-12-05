export class BaseError extends Error {
    statusCode: number;
    errorMessage: string;
    constructor(statusCode: number, message: string) {
        super(message);
        this.errorMessage = message;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = Error.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this);
    }
}
export class InvalidInputError extends BaseError {
    constructor(message: string) {
        super(400, message);
    }
}
export class UnauthorizedError extends BaseError {
    constructor(message: string) {
        super(401, message);
    }
}
export class ForbiddenError extends BaseError {
    constructor(message: string) {
        super(403, message);
    }
}
export class NotFoundError extends BaseError {
    propertyName: string;

    constructor(propertyName: string) {
        super(404, `Property '${propertyName}' not found.`);

        this.propertyName = propertyName;
    }
}
export class ConflictError extends BaseError {
    constructor(message: string) {
        super(409, message);
    }
}

export class InternalServerError extends BaseError {
    constructor() {
        super(500, "Internal Server Error");
    }
}
