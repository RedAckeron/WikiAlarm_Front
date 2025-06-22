export interface User {
    Id: number;
    Name: string;
    Email: string;
    Role: string;
    IdPortal: number | null;
    Dtln: number | null;
    Active: number;
    FirstName: string | null;
    NickName: string | null;
    ApiKey?: string;
}
