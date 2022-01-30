export class InvalidUUID extends Error {
    constructor(public readonly uuid: unknown) {
        super(invalidUUIDMessage(uuid));
        this.name = InvalidUUID.name;
    }
}

function invalidUUIDMessage(uuid: unknown) {
    return uuid ? `Invalid UUID: ${uuid}` : "You should specify a UUID.";
}
