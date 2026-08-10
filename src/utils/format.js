// Turns a Zod validation error into a single human-readable string,
// e.g. for sending back in an API error response.
export const formatValidationErrors = (errors) => {
    if (!errors || !errors.issues) return 'Validation failed'; // not a Zod error shape — generic fallback
    if (Array.isArray(errors.issues)) return errors.issues.map(issue => issue.message).join(', '); // join all issue messages
    return JSON.stringify(errors); // last resort — dump whatever we got
}
