import { Item } from "./item";

export class Odp
{
    Id:number;
    DtIn:Date;
    AddByUser:number;
    IdCustomer:number;
    basket:Array<Item>;
    constructor(Id:number,DtIn:Date,AddByUser:number,IdCustomer:number,basket:Array<Item>)
    {
    this.Id=Id;
    this.DtIn=DtIn;
    this.AddByUser=AddByUser;
    this.IdCustomer=IdCustomer;
    this.basket=basket
     }
    }
export class OdpLight
     {
        id:number;
        name:string;
        dtIn:Date;
        nbItem:number;
        prxTtl:number;
        
        constructor(Id:number,Name:string,dtIn:Date,NbItem:number,PrxTtl:number)
          {
          this.id=Id;
          this.name=Name;
          this.dtIn=dtIn;
          this.nbItem=NbItem;
          this.prxTtl=PrxTtl;
          }
     }
