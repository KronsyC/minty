import ERR_INVALID_RANGE from "./errors/ERR_INVALID_RANGE";
import ERR_TYPE_MISMATCH from "./errors/ERR_TYPE_MISMATCH";

interface ObjectSchema {
    type: 'object';
    additionalProperties?: boolean;
    required?: string[];
    properties: {
        [key: string]: Schema;
    };
}
interface StringSchema {
    type: 'string';
    maxLength?: number;
    minLength?: number;
}
interface NumberSchema {
    type: 'number';
    max?: number;
    min?: number;
}
interface ArraySchema {
    type: 'array';
    minLength?: number;
    maxLength?: number;
    keys: Schema[];
}
interface BooleanSchema {
    type: 'boolean';
}

type Schema =
    | ObjectSchema
    | StringSchema
    | NumberSchema
    | ArraySchema
    | BooleanSchema;

export default class Validator {
    build(schema: Schema): (data: unknown) => boolean {
        // Primitives
        function stringValidator(data: unknown) {
            if (
                schema.type == 'string' &&
                typeof data === 'string' &&
                (schema.maxLength
                    ? data.length <= schema.maxLength
                    : true && schema.minLength
                    ? data.length >= schema.minLength
                    : true)
            ) {
                return true;
            } else {
                return false;
            }
        }
        const buildNumberValidator = () => {
            if(schema.type==="number"){
                if(!(schema.max&&schema.min&&(schema.max-schema.min>=0))){
                    // Invalid range was provided, i.e min greater than max
                    throw new ERR_INVALID_RANGE()
                }
                function numberValidator(data: unknown) {
                    if (
                        schema.type == 'number' &&
                        typeof data === 'number' &&
                        (schema.max
                            ? data <= schema.max
                            : true && schema.min
                            ? data >= schema.min
                            : true)
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return numberValidator
            }
            else{
                // This shouldnt ever run, but just to be safe
                throw new ERR_TYPE_MISMATCH()
            }

        }
        function booleanValidator(data: unknown) {
            if (typeof data === 'boolean') {
                return true;
            } else {
                return false;
            }
        }

        // Complex Types
        const buildObjectValidator = () => {
            // Build all the child validators and add them to an object
            const validators: { [key: string]: Function } = {};
            if (schema.type === 'object') {
                for (let [name, sch] of Object.entries(schema.properties)) {
                    const built = this.build(sch);
                    validators[name] = built;
                }
            } else {
                // This should never actually run, but better to be safe than sorry
                throw new ERR_TYPE_MISMATCH()
            }
            function objectValidator(data: unknown) {
                if (
                    data &&
                    typeof data === 'object' &&
                    schema.type === 'object'
                ) {
                    const schemaKeys = Object.keys(schema.properties);
                    for (let [key, value] of Object.entries(data)) {
                        console.log(key);

                        if (schemaKeys.includes(key)) {
                            const validator = validators[key];
                            if (!validator) {
                                throw new Error(
                                    'Validators were not properly built'
                                );
                            }
                            if (!validator(value)) {
                                return false;
                            }
                        } else {
                            // The key is excess
                            // Return false if additional Properties are not allowed
                            if (!schema.additionalProperties) {
                                return false;
                            }
                        }
                    }
                    return true;
                } else {
                    return false;
                }
                return false;
            }

            return objectValidator;
        };
        function arrayValidator(data: unknown) {
            return true;
        }

        switch (schema.type) {
            case 'string':
                return stringValidator;
            case 'number':
                return buildNumberValidator();
            case 'boolean':
                return booleanValidator;
            case 'object':
                return buildObjectValidator();
            case 'array':
                return arrayValidator;
        }
    }
}
