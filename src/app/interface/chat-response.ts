import { IUser } from "./user-response";

export interface Ichat {
    created_at: string;
    editable: boolean;
    id: string;
    sender: string;
    text: string;
    receiver: string;
    users: IUser
}