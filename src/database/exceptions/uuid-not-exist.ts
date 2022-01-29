export class UUIDNotExist extends Error {
    constructor(public readonly uuid: string) {
        super(`UUID ${uuid} not exist`);
        this.name = UUIDNotExist.name;
    }
}
