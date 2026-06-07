import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class GuardService {
    private permission: any;

    constructor() {}
    // Set the permission value
    public setPermission(permission: any): void {
        this.permission = permission;
    }
    // Get the permission value
    public getPermission(): any {
        return this.permission;
    }
}