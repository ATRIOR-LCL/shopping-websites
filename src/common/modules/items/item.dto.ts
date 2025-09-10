import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemDTO {
  @IsString()
  public itemName!: string;

  @IsNumber()
  @Type(() => Number)
  public price!: number;

  @IsString()
  @IsOptional()
  public description?: string;
}

export class ItemReqDTO {}

export class ItemResDTO {
  @Type(() => ItemDTO)
  rows: ItemDTO[];
  success?: boolean;
  message?: string;
}
